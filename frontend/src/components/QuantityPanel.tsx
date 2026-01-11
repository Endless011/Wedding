import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface QuantityPanelProps {
    visible: boolean;
    onClose: () => void;
    itemName: string;
    totalQuantity: number;
    purchasedQuantity: number;
    onQuantityChange: (quantity: number) => void;
    color: string;
}

export default function QuantityPanel({
    visible,
    onClose,
    itemName,
    totalQuantity,
    purchasedQuantity,
    onQuantityChange,
    color,
}: QuantityPanelProps) {
    const { colors } = useTheme();

    const remaining = totalQuantity - purchasedQuantity;
    const isComplete = remaining === 0;

    const handleQuantitySelect = (quantity: number) => {
        onQuantityChange(quantity);
    };

    // Generate quantity buttons
    const renderQuantityButtons = () => {
        const buttons = [];
        for (let i = 1; i <= totalQuantity; i++) {
            const isPurchased = i <= purchasedQuantity;
            buttons.push(
                <TouchableOpacity
                    key={i}
                    style={[
                        styles.quantityButton,
                        {
                            backgroundColor: isPurchased ? color : colors.background,
                            borderColor: color,
                        },
                    ]}
                    onPress={() => handleQuantitySelect(i === purchasedQuantity ? i - 1 : i)}
                >
                    <Text
                        style={[
                            styles.quantityButtonText,
                            { color: isPurchased ? '#fff' : color },
                        ]}
                    >
                        {i}
                    </Text>
                </TouchableOpacity>
            );
        }
        return buttons;
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                        <View style={styles.headerContent}>
                            <Text style={[styles.itemName, { color: colors.textPrimary }]}>
                                {itemName}
                            </Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                Toplam {totalQuantity} adet alınacak
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close-circle" size={32} color={colors.gray} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <Text style={[styles.question, { color: colors.textPrimary }]}>
                            Kaç tane aldınız?
                        </Text>

                        {/* Quantity Grid */}
                        <ScrollView
                            contentContainerStyle={styles.quantityGrid}
                            showsVerticalScrollIndicator={false}
                        >
                            {renderQuantityButtons()}
                        </ScrollView>

                        {/* Status */}
                        <View style={[styles.statusCard, { backgroundColor: isComplete ? '#d4edda' : color + '15' }]}>
                            {isComplete ? (
                                <>
                                    <Ionicons name="checkmark-circle" size={32} color="#28a745" />
                                    <View style={styles.statusTextContainer}>
                                        <Text style={[styles.statusTitle, { color: '#28a745' }]}>
                                            Tamamlandı! 🎉
                                        </Text>
                                        <Text style={[styles.statusSubtitle, { color: '#155724' }]}>
                                            Tüm ürünler alındı
                                        </Text>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="cart" size={32} color={color} />
                                    <View style={styles.statusTextContainer}>
                                        <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
                                            {purchasedQuantity} adet alındı
                                        </Text>
                                        <Text style={[styles.statusSubtitle, { color: color }]}>
                                            {remaining} tane daha alınacak
                                        </Text>
                                    </View>
                                </>
                            )}
                        </View>

                        {/* Quick Actions */}
                        <View style={styles.quickActions}>
                            <TouchableOpacity
                                style={[styles.quickButton, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}
                                onPress={() => handleQuantitySelect(0)}
                            >
                                <Ionicons name="refresh" size={18} color={colors.textSecondary} />
                                <Text style={[styles.quickButtonText, { color: colors.textSecondary }]}>
                                    Sıfırla
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.quickButton, { backgroundColor: color, borderColor: color }]}
                                onPress={() => handleQuantitySelect(totalQuantity)}
                            >
                                <Ionicons name="checkmark-done" size={18} color="#fff" />
                                <Text style={[styles.quickButtonText, { color: '#fff' }]}>
                                    Tamamla
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Done Button */}
                    <TouchableOpacity
                        style={[styles.doneButton, { backgroundColor: color }]}
                        onPress={onClose}
                    >
                        <Text style={styles.doneButtonText}>Tamam</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        maxHeight: '80%',
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
    },
    headerContent: {
        flex: 1,
    },
    itemName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    question: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    quantityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20,
    },
    quantityButton: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    quantityButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    statusTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statusSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    quickActions: {
        flexDirection: 'row',
        gap: 12,
    },
    quickButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 6,
    },
    quickButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    doneButton: {
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 20,
        alignItems: 'center',
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
