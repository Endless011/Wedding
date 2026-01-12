import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface ChangePasswordModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (newPassword: string) => Promise<void>;
}

export default function ChangePasswordModal({ visible, onClose, onSave }: ChangePasswordModalProps) {
    const { colors } = useTheme();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!newPassword.trim()) {
            Alert.alert('Hata', 'Yeni şifre boş olamaz.');
            return;
        }

        if (newPassword.length < 4) {
            Alert.alert('Hata', 'Şifre en az 4 karakter olmalıdır.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Hata', 'Şifreler uyuşmuyor.');
            return;
        }

        setIsLoading(true);
        try {
            await onSave(newPassword);
            Alert.alert('Başarılı', 'Şifreniz başarıyla güncellendi.');
            setNewPassword('');
            setConfirmPassword('');
            onClose();
        } catch (error) {
            Alert.alert('Hata', 'Şifre güncellenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.modalContainer}
                    >
                        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                            <View style={styles.header}>
                                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Şifre Değiştir</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.label, { color: colors.textSecondary }]}>Yeni Şifre</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary }]}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                                placeholder="Yeni şifre..."
                                placeholderTextColor={colors.textLight}
                            />

                            <Text style={[styles.label, { color: colors.textSecondary }]}>Şifreyi Onayla</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary }]}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                placeholder="Şifreyi tekrar gir..."
                                placeholderTextColor={colors.textLight}
                            />

                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: colors.rose }]}
                                onPress={handleSave}
                                disabled={isLoading}
                            >
                                <Text style={styles.saveButtonText}>
                                    {isLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20
    },
    modalContainer: {
        width: '100%'
    },
    modalContent: {
        borderRadius: 20,
        padding: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8
    },
    input: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 20,
        fontSize: 16
    },
    saveButton: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    }
});
