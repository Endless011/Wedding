import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Category } from '../types';

interface EditCategoryModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (updates: Partial<Category>) => void;
    initialCategory: Category;
    groupColor: string;
}

export default function EditCategoryModal({ visible, onClose, onSave, initialCategory, groupColor }: EditCategoryModalProps) {
    const { colors } = useTheme();

    // Form State
    const [name, setName] = useState(initialCategory.name);
    const [description, setDescription] = useState(initialCategory.description || '');
    const [targetQuantity, setTargetQuantity] = useState(initialCategory.targetQuantity.toString());

    // Sync state when modal opens or initialCategory changes
    useEffect(() => {
        if (visible) {
            setName(initialCategory.name);
            setDescription(initialCategory.description || '');
            setTargetQuantity(initialCategory.targetQuantity.toString());
        }
    }, [visible, initialCategory]);

    const handleSave = () => {
        const qty = parseInt(targetQuantity);
        if (!name.trim()) return;

        onSave({
            name: name,
            description: description,
            targetQuantity: isNaN(qty) || qty < 1 ? 1 : qty
        });
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.centeredView}
            >
                <View style={[styles.modalView, { backgroundColor: colors.surface }]}>
                    <View style={styles.header}>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Kategoriyi Düzenle</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Name Input */}
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Kategori Adı</Text>
                        <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary }]}
                                value={name}
                                onChangeText={setName}
                                placeholder="Örn: Tencere Seti"
                                placeholderTextColor={colors.textLight}
                            />
                        </View>

                        {/* Description Input */}
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Açıklama (Marka/Model)</Text>
                        <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary }]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Örn: Karaca Bio Diamond"
                                placeholderTextColor={colors.textLight}
                            />
                        </View>

                        {/* Quantity Input */}
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Hedef Adet</Text>
                        <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary }]}
                                value={targetQuantity}
                                onChangeText={setTargetQuantity}
                                keyboardType="numeric"
                                placeholder="1"
                                placeholderTextColor={colors.textLight}
                            />
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: groupColor }]}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalView: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 40,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
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
        marginBottom: 8,
        marginLeft: 4
    },
    inputContainer: {
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        justifyContent: 'center',
        marginBottom: 16
    },
    input: {
        fontSize: 16
    },
    saveButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});
