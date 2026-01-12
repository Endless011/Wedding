import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SubCategory } from '../types';

interface EditSubItemModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (updates: { name: string; description?: string; price?: number; color: string; icon?: string; purchasedQuantity: number }) => void;
    subItem: SubCategory | null;
    categoryColor: string;
    categoryTotalQuantity: number;
    currentPurchasedTotal: number; // Sum of OTHER sub-items' purchasedQuantity
}

const ICONS = ['🛒', '🛍️', '📦', '🎁', '✨', '💫', '⭐', '🌟', '💝', '🏷️'];

const COLORS = [
    '#E8B4BC', '#9CAF88', '#B4C7E8', '#F4978E', '#DDA0DD',
    '#87CEEB', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

export default function EditSubItemModal({
    visible,
    onClose,
    onSave,
    subItem,
    categoryColor,
    categoryTotalQuantity,
    currentPurchasedTotal
}: EditSubItemModalProps) {
    const { colors } = useTheme();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [selectedIcon, setSelectedIcon] = useState('');
    const [selectedColor, setSelectedColor] = useState(categoryColor);
    const [showQuantityPicker, setShowQuantityPicker] = useState(false);

    const remainingQuantity = categoryTotalQuantity - currentPurchasedTotal;
    const quantityOptions = Array.from({ length: remainingQuantity + 1 }, (_, i) => i);

    useEffect(() => {
        if (subItem) {
            setName(subItem.name);
            setDescription(subItem.description || '');
            setPrice(subItem.price?.toString() || '');
            setQuantity(subItem.purchasedQuantity || 0);
            setSelectedIcon(subItem.icon || '');
            setSelectedColor(subItem.color || categoryColor);
            setShowQuantityPicker(false);
        }
    }, [subItem, categoryColor]);

    const handleSave = () => {
        if (name.trim()) {
            onSave({
                name: name.trim(),
                description: description.trim() || undefined,
                price: price ? parseFloat(price) : undefined,
                color: selectedColor,
                icon: selectedIcon || undefined,
                purchasedQuantity: quantity,
            });
            onClose();
        }
    };

    if (!subItem) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.title, { color: colors.textPrimary }]}>
                                Öğe Düzenle
                            </Text>
                            <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
                                Kalan: {remainingQuantity}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Name Input */}
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Ürün Adı *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.cardBorder }]}
                            placeholder="Ürün adı..."
                            placeholderTextColor={colors.gray}
                            value={name}
                            onChangeText={setName}
                        />

                        {/* Quantity Picker */}
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Adet <Text style={{ fontSize: 12, fontWeight: '400' }}>(Kalan: {remainingQuantity})</Text>
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.input,
                                styles.pickerButton,
                                {
                                    backgroundColor: colors.background,
                                    borderColor: colors.cardBorder
                                }
                            ]}
                            onPress={() => setShowQuantityPicker(!showQuantityPicker)}
                        >
                            <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
                                {quantity} adet
                            </Text>
                            <Ionicons
                                name={showQuantityPicker ? "chevron-up" : "chevron-down"}
                                size={20}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>

                        {showQuantityPicker && (
                            <ScrollView
                                style={[styles.quantityPickerContainer, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}
                                nestedScrollEnabled={true}
                            >
                                <View style={styles.quantityGrid}>
                                    {quantityOptions.map((item) => (
                                        <TouchableOpacity
                                            key={item}
                                            style={[
                                                styles.quantityOption,
                                                { backgroundColor: quantity === item ? selectedColor : colors.surface },
                                            ]}
                                            onPress={() => {
                                                setQuantity(item);
                                                setShowQuantityPicker(false);
                                            }}
                                        >
                                            <Text style={[
                                                styles.quantityOptionText,
                                                { color: quantity === item ? '#fff' : colors.textPrimary }
                                            ]}>
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        )}

                        {/* Price Input */}
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Birim Fiyat</Text>
                        <View style={styles.priceContainer}>
                            <TextInput
                                style={[styles.priceInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.cardBorder }]}
                                placeholder="0"
                                placeholderTextColor={colors.gray}
                                value={price}
                                onChangeText={(text) => setPrice(text.replace(/[^0-9.]/g, ''))}
                                keyboardType="numeric"
                            />
                            <View style={[styles.currencyBadge, { backgroundColor: selectedColor }]}>
                                <Text style={styles.currencyText}>₺</Text>
                            </View>
                        </View>

                        {/* Description Input */}
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Açıklama / Not</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.cardBorder }]}
                            placeholder="Açıklama..."
                            placeholderTextColor={colors.gray}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                        />

                        {/* Icon Selection */}
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Emoji</Text>
                        <View style={styles.iconGrid}>
                            <TouchableOpacity
                                style={[
                                    styles.iconButton,
                                    { backgroundColor: colors.background, borderColor: colors.cardBorder },
                                    selectedIcon === '' && { borderColor: selectedColor, backgroundColor: selectedColor + '20' },
                                ]}
                                onPress={() => setSelectedIcon('')}
                            >
                                <Text style={styles.iconText}>-</Text>
                            </TouchableOpacity>
                            {ICONS.map((icon) => (
                                <TouchableOpacity
                                    key={icon}
                                    style={[
                                        styles.iconButton,
                                        { backgroundColor: colors.background, borderColor: colors.cardBorder },
                                        selectedIcon === icon && { borderColor: selectedColor, backgroundColor: selectedColor + '20' },
                                    ]}
                                    onPress={() => setSelectedIcon(icon)}
                                >
                                    <Text style={styles.iconText}>{icon}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Color Selection */}
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Renk</Text>
                        <View style={styles.colorGrid}>
                            {COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorButton,
                                        { backgroundColor: color },
                                        selectedColor === color && styles.selectedColor,
                                    ]}
                                    onPress={() => setSelectedColor(color)}
                                >
                                    {selectedColor === color && (
                                        <Ionicons name="checkmark" size={18} color="#fff" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            { backgroundColor: selectedColor },
                            !name.trim() && styles.disabledButton,
                        ]}
                        onPress={handleSave}
                        disabled={!name.trim()}
                    >
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    categoryLabel: {
        fontSize: 14,
        marginTop: 4,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        borderWidth: 1,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    priceInput: {
        flex: 1,
        borderRadius: 12,
        padding: 14,
        fontSize: 18,
        fontWeight: '600',
        borderWidth: 1,
    },
    currencyBadge: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
    },
    currencyText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    iconText: {
        fontSize: 20,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 24,
    },
    colorButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedColor: {
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 20,
        gap: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.5,
    },
    pickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantityPickerContainer: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 8,
        marginTop: 8,
        maxHeight: 200,
    },
    quantityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    quantityOption: {
        width: '18%',
        margin: '1%',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityOptionText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
