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
import { Category } from '../types';

interface EditCategoryModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (updates: { name: string; description: string; totalQuantity: number; icon: string; color: string }) => void;
    category: Category | null;
}

const ICONS = ['🥤', '🍽️', '🛏️', '🪑', '👗', '💍', '🏠', '🧺', '🍳', '☕', '🥣', '🍴', '🧊', '📺', '💡', '🛋️', '🪞', '🧹', '🧴', '🎁'];

const COLORS = [
    '#E8B4BC', '#9CAF88', '#B4C7E8', '#F4978E', '#DDA0DD',
    '#87CEEB', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

export default function EditCategoryModal({ visible, onClose, onSave, category }: EditCategoryModalProps) {
    const { colors } = useTheme();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);

    useEffect(() => {
        if (category) {
            setName(category.name);
            setDescription(category.description);
            setQuantity(category.totalQuantity.toString());
            setSelectedIcon(category.icon);
            setSelectedColor(category.color);
        }
    }, [category]);

    const handleSave = () => {
        if (name.trim() && parseInt(quantity) > 0) {
            onSave({
                name: name.trim(),
                description: description.trim(),
                totalQuantity: parseInt(quantity),
                icon: selectedIcon,
                color: selectedColor,
            });
            onClose();
        }
    };

    const handleQuantityChange = (text: string) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        if (numericValue === '' || parseInt(numericValue) > 0) {
            setQuantity(numericValue);
        }
    };

    const adjustQuantity = (delta: number) => {
        const current = parseInt(quantity) || 0;
        const newValue = Math.max(1, current + delta);
        setQuantity(newValue.toString());
    };

    if (!category) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>
                            Kategori Düzenle
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Name Input */}
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Kategori Adı *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.cardBorder }]}
                            placeholder="Kategori adı..."
                            placeholderTextColor={colors.gray}
                            value={name}
                            onChangeText={setName}
                        />

                        {/* Quantity Input */}
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Toplam Adet *</Text>
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity
                                style={[styles.quantityAdjust, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}
                                onPress={() => adjustQuantity(-1)}
                            >
                                <Ionicons name="remove" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                            <TextInput
                                style={[styles.quantityInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: selectedColor }]}
                                value={quantity}
                                onChangeText={handleQuantityChange}
                                keyboardType="numeric"
                                textAlign="center"
                            />
                            <TouchableOpacity
                                style={[styles.quantityAdjust, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}
                                onPress={() => adjustQuantity(1)}
                            >
                                <Ionicons name="add" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        {/* Description Input */}
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Açıklama</Text>
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
                            {ICONS.map((icon) => (
                                <TouchableOpacity
                                    key={icon}
                                    style={[
                                        styles.iconButton,
                                        { backgroundColor: colors.background, borderColor: colors.cardBorder },
                                        selectedIcon === icon && { backgroundColor: selectedColor + '30', borderColor: selectedColor },
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
                                        <Ionicons name="checkmark" size={20} color="#fff" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: selectedColor }, (!name.trim() || !quantity) && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={!name.trim() || !quantity}
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
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
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
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    quantityAdjust: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    quantityInput: {
        flex: 1,
        height: 56,
        borderRadius: 12,
        fontSize: 24,
        fontWeight: 'bold',
        borderWidth: 2,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    iconText: {
        fontSize: 22,
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
});
