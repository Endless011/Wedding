import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, Keyboard, ScrollView, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface WeddingDateModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (dateIso: string) => void;
}

export default function WeddingDateModal({ visible, onClose, onSave }: WeddingDateModalProps) {
    const { colors } = useTheme();
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');

    const handleSave = () => {
        const d = parseInt(day);
        const m = parseInt(month);
        const y = parseInt(year);

        if (isNaN(d) || isNaN(m) || isNaN(y)) {
            Alert.alert("Hata", "Lütfen geçerli bir tarih giriniz.");
            return;
        }

        if (d < 1 || d > 31 || m < 1 || m > 12 || y < 2024 || y > 2100) {
            Alert.alert("Hata", "Tarih bilgileri mantıksız görünüyor.");
            return;
        }

        // Create ISO Date (YYYY-MM-DD)
        const dateIso = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        onSave(dateIso);
        onClose();
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.centeredView}>
                    <View style={[styles.modalView, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Düğün Tarihin Ne Zaman? 💍</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Geri sayımı başlatmak için tarihi gir.
                        </Text>

                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: colors.textLight }]}>Gün</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.cardBorder }]}
                                    placeholder="DD"
                                    placeholderTextColor={colors.textLight}
                                    keyboardType="numeric"
                                    maxLength={2}
                                    value={day}
                                    onChangeText={setDay}
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: colors.textLight }]}>Ay</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.cardBorder }]}
                                    placeholder="MM"
                                    placeholderTextColor={colors.textLight}
                                    keyboardType="numeric"
                                    maxLength={2}
                                    value={month}
                                    onChangeText={setMonth}
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: colors.textLight }]}>Yıl</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.cardBorder }]}
                                    placeholder="YYYY"
                                    placeholderTextColor={colors.textLight}
                                    keyboardType="numeric"
                                    maxLength={4}
                                    value={year}
                                    onChangeText={setYear}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: colors.rose }]}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>Geri Sayımı Başlat! ⏳</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={{ color: colors.textSecondary }}>Vazgeç</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)"
    },
    modalView: {
        width: '85%',
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 14, marginBottom: 24, textAlign: 'center' },
    inputContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 24 },
    inputWrapper: { width: '30%' },
    label: { fontSize: 12, marginBottom: 4, textAlign: 'center' },
    input: {
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        fontSize: 18,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    saveButton: {
        width: '100%',
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3
    },
    saveButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
    closeButton: { padding: 8 }
});
