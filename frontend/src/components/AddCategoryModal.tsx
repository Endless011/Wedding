import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, Keyboard, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface AddCategoryModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (data: { name: string; quantity: number; description: string }) => void;
    groupColor: string;
}

export default function AddCategoryModal({ visible, onClose, onAdd, groupColor }: AddCategoryModalProps) {
    const { colors } = useTheme();
    const [name, setName] = useState(''); // Kategori / Ürün Adı
    const [brand, setBrand] = useState(''); // Marka
    const [quantity, setQuantity] = useState('1'); // Adet

    const handleSave = () => {
        if (!name.trim()) return;

        const desc = brand.trim() ? `Marka: ${brand}` : '';

        onAdd({
            name: name,
            quantity: parseInt(quantity) || 1,
            description: desc
        });

        setName('');
        setBrand('');
        setQuantity('1');
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.centeredView}
                >
                    <TouchableOpacity
                        style={styles.backdrop}
                        activeOpacity={1}
                        onPress={onClose}
                    />
                    <View style={[styles.modalView, { backgroundColor: colors.surface }]}>
                        <View style={styles.header}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Yeni Kategori Ekle</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Kategori Adı */}
                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Kategori / Ürün Adı</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: groupColor }]}
                                    placeholder="Örn: Yemek Takımı"
                                    placeholderTextColor={colors.textLight}
                                    value={name}
                                    onChangeText={setName}
                                    autoFocus
                                />
                            </View>

                            {/* Marka */}
                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Marka (Opsiyonel)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.lightGray }]}
                                    placeholder="Örn: Karaca, Jumbo"
                                    placeholderTextColor={colors.textLight}
                                    value={brand}
                                    onChangeText={setBrand}
                                />
                            </View>

                            {/* Adet */}
                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Hedef Adet</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.lightGray }]}
                                    placeholder="1"
                                    placeholderTextColor={colors.textLight}
                                    value={quantity}
                                    onChangeText={setQuantity}
                                    keyboardType="number-pad"
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: groupColor, opacity: name.trim() ? 1 : 0.6 }]}
                                onPress={handleSave}
                                disabled={!name.trim()}
                            >
                                <Text style={styles.saveButtonText}>Kaydet ve Ekle</Text>
                            </TouchableOpacity>
                            <View style={{ height: 20 }} />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: {
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, paddingBottom: 40,
        shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 5,
        maxHeight: '80%'
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 14, marginBottom: 8, fontWeight: '500' },
    input: { height: 50, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, fontSize: 16 },
    saveButton: {
        height: 56, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center', marginTop: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4
    },
    saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
