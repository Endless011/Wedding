import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface AddProductModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (data: { name: string; brand: string; quantity: number; price: number }) => void;
    groupColor: string;
}

export default function AddProductModal({ visible, onClose, onAdd, groupColor }: AddProductModalProps) {
    const { colors } = useTheme();
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');

    const handleSave = () => {
        if (!name.trim()) return;

        onAdd({
            name,
            brand,
            quantity: parseInt(quantity || '1'),
            price: parseFloat(price || '0')
        });

        // Reset
        setName('');
        setBrand('');
        setQuantity('');
        setPrice('');
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
                    <View style={[styles.modalView, { backgroundColor: colors.surface }]}>
                        <View style={styles.header}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Yeni Ürün Ekle</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Product Name */}
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Ürün Adı</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: colors.background,
                                    color: colors.textPrimary,
                                    borderColor: colors.cardBorder
                                }]}
                                placeholder="Örn: 6'lı Kahve Fincanı"
                                placeholderTextColor={colors.textLight}
                                value={name}
                                onChangeText={setName}
                            />

                            {/* Brand */}
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Marka</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: colors.background,
                                    color: colors.textPrimary,
                                    borderColor: colors.cardBorder
                                }]}
                                placeholder="Örn: Karaca"
                                placeholderTextColor={colors.textLight}
                                value={brand}
                                onChangeText={setBrand}
                            />

                            <View style={styles.row}>
                                {/* Quantity */}
                                <View style={styles.halfInput}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Adet</Text>
                                    <TextInput
                                        style={[styles.input, {
                                            backgroundColor: colors.background,
                                            color: colors.textPrimary,
                                            borderColor: colors.cardBorder
                                        }]}
                                        placeholder="1"
                                        placeholderTextColor={colors.textLight}
                                        value={quantity}
                                        onChangeText={setQuantity}
                                        keyboardType="numeric"
                                    />
                                </View>

                                {/* Price */}
                                <View style={styles.halfInput}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Toplam Fiyat</Text>
                                    <TextInput
                                        style={[styles.input, {
                                            backgroundColor: colors.background,
                                            color: colors.textPrimary,
                                            borderColor: colors.cardBorder
                                        }]}
                                        placeholder="0"
                                        placeholderTextColor={colors.textLight}
                                        value={price}
                                        onChangeText={setPrice}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <Text style={[styles.note, { color: colors.textLight }]}>
                                * Fiyat alanına ürünün toplam fiyatını giriniz (Adet ile çarpılmaz).
                            </Text>

                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: groupColor }]}
                                onPress={handleSave}
                            >
                                <Text style={styles.saveButtonText}>Kaydet</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.5)"
    },
    modalView: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        maxHeight: '80%'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    modalTitle: { fontSize: 20, fontWeight: "bold" },
    label: { fontSize: 14, marginBottom: 8, fontWeight: '600' },
    input: {
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        fontSize: 16,
        marginBottom: 16
    },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    halfInput: { width: '48%' },
    note: { fontSize: 12, marginBottom: 20, fontStyle: 'italic' },
    saveButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        marginTop: 10
    },
    saveButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16
    }
});
