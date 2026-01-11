// ... imports
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { predefinedCategories } from '../data/predefinedCategories';
import { Category } from '../types';

interface QuickAddModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (selectedData: { categoryIndex: number; selectedItems: string[] }[]) => void;
    existingCategories: Category[];
}

export default function QuickAddModal({ visible, onClose, onAdd, existingCategories }: QuickAddModalProps) {
    const { colors } = useTheme();
    const [selections, setSelections] = useState<{ [key: number]: string[] }>({});
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

    const SELECTION_COLOR = '#4CAF50'; // Green as requested

    // Calculate existing items to prevent duplicates
    const { existingItemsMap } = useMemo(() => {
        const map: { [categoryName: string]: Set<string> } = {};
        const catSet = new Set<string>();

        existingCategories.forEach(cat => {
            catSet.add(cat.name);
            if (!map[cat.name]) map[cat.name] = new Set();
            cat.subCategories.forEach(sub => {
                map[cat.name].add(sub.name);
            });
        });

        return { existingItemsMap: map, hasExistingCategory: catSet };
    }, [existingCategories]);

    const isItemExisting = (categoryName: string, itemName: string) => {
        return existingItemsMap[categoryName]?.has(itemName);
    };

    // Helper to get available items for a category (not already added)
    const getAvailableItems = (categoryIndex: number) => {
        const cat = predefinedCategories[categoryIndex];
        return cat.items.filter(item => !isItemExisting(cat.name, item));
    };

    const toggleCategoryExpand = (index: number) => {
        setExpandedCategories(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const toggleCategorySelection = (index: number) => {
        const availableItems = getAvailableItems(index);
        if (availableItems.length === 0) return; // Nothing to select

        setSelections(prev => {
            const currentSelected = prev[index] || [];
            // If all AVAILABLE items are selected, deselect all. Otherwise, select all available.
            const allAvailableSelected = availableItems.every(item => currentSelected.includes(item));

            if (allAvailableSelected) {
                const next = { ...prev };
                delete next[index];
                return next;
            } else {
                return { ...prev, [index]: [...availableItems] };
            }
        });
    };

    const toggleItemSelection = (categoryIndex: number, item: string) => {
        if (isItemExisting(predefinedCategories[categoryIndex].name, item)) return;

        setSelections(prev => {
            const currentSelected = prev[categoryIndex] || [];
            let newSelected;
            if (currentSelected.includes(item)) {
                newSelected = currentSelected.filter(i => i !== item);
            } else {
                newSelected = [...currentSelected, item];
            }

            const next = { ...prev };
            if (newSelected.length === 0) {
                delete next[categoryIndex];
            } else {
                next[categoryIndex] = newSelected;
            }
            return next;
        });
    };

    const toggleSelectAll = () => {
        // Check if everything available is selected
        let allPossibleSelected = true;

        for (let i = 0; i < predefinedCategories.length; i++) {
            const available = getAvailableItems(i);
            if (available.length > 0) {
                const currentSelected = selections[i] || [];
                if (currentSelected.length !== available.length) {
                    allPossibleSelected = false;
                    break;
                }
            }
        }

        if (allPossibleSelected) {
            // Deselect all
            setSelections({});
        } else {
            // Select all available
            const newSelections: { [key: number]: string[] } = {};
            predefinedCategories.forEach((cat, index) => {
                const available = getAvailableItems(index);
                if (available.length > 0) {
                    newSelections[index] = available;
                }
            });
            setSelections(newSelections);
        }
    };

    // Check strict equality for "Select All" checkbox state
    const isGlobalAllSelected = useMemo(() => {
        let hasAnyAvailable = false;
        for (let i = 0; i < predefinedCategories.length; i++) {
            const available = getAvailableItems(i);
            if (available.length > 0) {
                hasAnyAvailable = true;
                const currentSelected = selections[i] || [];
                if (currentSelected.length !== available.length) return false;
            }
        }
        return hasAnyAvailable;
    }, [selections, existingItemsMap]);

    const handleAdd = () => {
        const result = Object.entries(selections).map(([indexStr, items]) => ({
            categoryIndex: parseInt(indexStr),
            selectedItems: items
        }));
        onAdd(result);
        setSelections({});
    };

    const totalSelectedCount = Object.values(selections).reduce((sum, items) => sum + items.length, 0);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                        <Text style={[styles.backText, { color: colors.textPrimary }]}>Geri</Text>
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Hızlı Ekle</Text>
                    <View style={{ width: 60 }} />
                </View>

                {/* Sub Header (Select All) */}
                <View style={[styles.subHeader, { backgroundColor: colors.surface, borderBottomColor: colors.cardBorder }]}>
                    <TouchableOpacity
                        style={styles.selectAllContainer}
                        onPress={toggleSelectAll}
                    >
                        <Ionicons
                            name={isGlobalAllSelected ? "checkbox" : "square-outline"}
                            size={24}
                            color={isGlobalAllSelected ? SELECTION_COLOR : colors.textSecondary}
                        />
                        <Text style={[styles.selectAllText, { color: colors.textPrimary }]}>
                            Tümünü Seç
                        </Text>
                    </TouchableOpacity>
                    <Text style={[styles.selectionCountText, { color: colors.textSecondary }]}>
                        {totalSelectedCount} ürün seçildi
                    </Text>
                </View>

                {/* Content */}
                <ScrollView style={styles.content}>
                    {predefinedCategories.map((category, index) => {
                        const availableItems = getAvailableItems(index);
                        const allItemsAlreadyAdded = category.items.length > 0 && availableItems.length === 0;

                        const selectedItems = selections[index] || [];
                        const isAllSelected = availableItems.length > 0 && selectedItems.length === availableItems.length;
                        const isPartialSelected = selectedItems.length > 0 && !isAllSelected;
                        const isExpanded = expandedCategories.includes(index);

                        return (
                            <View key={index} style={[styles.categoryCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                                {/* Category Header */}
                                <View style={styles.categoryHeader}>
                                    {/* Selectable Area (Checkbox + Icon + Name) */}
                                    <TouchableOpacity
                                        style={styles.categorySelectArea}
                                        onPress={() => toggleCategorySelection(index)}
                                        activeOpacity={0.7}
                                        disabled={allItemsAlreadyAdded}
                                    >
                                        <View style={styles.checkboxContainer}>
                                            <Ionicons
                                                name={
                                                    allItemsAlreadyAdded ? "checkmark-circle" :
                                                        isAllSelected ? "checkbox" :
                                                            isPartialSelected ? "remove-circle" :
                                                                "square-outline"
                                                }
                                                size={24}
                                                color={
                                                    allItemsAlreadyAdded ? colors.sage :
                                                        isAllSelected || isPartialSelected ? SELECTION_COLOR :
                                                            colors.textSecondary
                                                }
                                            />
                                        </View>

                                        <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
                                            <Text style={styles.emoji}>{category.icon}</Text>
                                        </View>

                                        <View style={styles.categoryInfo}>
                                            <Text style={[styles.categoryName, { color: colors.textPrimary }]}>{category.name}</Text>
                                            <Text style={[styles.categoryDetail, { color: colors.textSecondary }]}>
                                                {allItemsAlreadyAdded
                                                    ? "Tümü eklendi"
                                                    : `${selectedItems.length} / ${availableItems.length} seçildi`
                                                }
                                            </Text>
                                        </View>
                                    </TouchableOpacity>

                                    {/* Expansion Button (Separate) */}
                                    <TouchableOpacity
                                        style={styles.expandButton}
                                        onPress={() => toggleCategoryExpand(index)}
                                    >
                                        <Ionicons
                                            name={isExpanded ? "chevron-up" : "chevron-down"}
                                            size={24}
                                            color={colors.textSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Items List (Collapsible) */}
                                {isExpanded && (
                                    <View style={[styles.itemsList, { borderTopColor: colors.cardBorder }]}>
                                        {category.items.map((item, itemIndex) => {
                                            const isAdded = isItemExisting(category.name, item);
                                            const isSelected = selectedItems.includes(item);

                                            return (
                                                <TouchableOpacity
                                                    key={itemIndex}
                                                    style={[styles.itemRow, isAdded && { backgroundColor: colors.background }]}
                                                    onPress={() => toggleItemSelection(index, item)}
                                                    disabled={isAdded}
                                                >
                                                    <Ionicons
                                                        name={isAdded ? "checkmark-circle-outline" : isSelected ? "checkbox" : "square-outline"}
                                                        size={20}
                                                        color={isAdded ? colors.sage : isSelected ? SELECTION_COLOR : colors.gray}
                                                    />
                                                    <Text style={[
                                                        styles.itemName,
                                                        {
                                                            color: isAdded ? colors.textLight : isSelected ? colors.textPrimary : colors.textSecondary,
                                                            fontWeight: '400', // STRICTLY NO BOLD
                                                            textDecorationLine: isAdded ? 'line-through' : 'none'
                                                        }
                                                    ]}>
                                                        {item}
                                                    </Text>
                                                    {isAdded && (
                                                        <Text style={{ fontSize: 10, color: colors.sage, fontStyle: 'italic' }}>Eklendi</Text>
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        );
                    })}
                    <View style={{ height: 40 }} />
                </ScrollView>

                {/* Footer */}
                <View style={[styles.footer, { borderTopColor: colors.cardBorder, backgroundColor: colors.surface }]}>
                    <TouchableOpacity
                        style={[
                            styles.addButton,
                            { backgroundColor: totalSelectedCount > 0 ? SELECTION_COLOR : colors.lightGray }
                        ]}
                        onPress={handleAdd}
                        disabled={totalSelectedCount === 0}
                    >
                        <Text style={styles.addButtonText}>
                            Ekle ({totalSelectedCount} Ürün)
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    subHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    selectAllContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    selectAllText: {
        fontSize: 16,
        fontWeight: '600',
    },
    selectionCountText: {
        fontSize: 14,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 60,
    },
    backText: {
        fontSize: 16,
        marginLeft: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    guideText: {
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
    },
    categoryCard: {
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 0, // Reset padding as inner containers deal with it
    },
    categorySelectArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    expandButton: {
        padding: 12,
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(0,0,0,0.05)',
    },
    checkboxContainer: {
        padding: 4,
        marginRight: 8,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    emoji: {
        fontSize: 20,
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
    },
    categoryDetail: {
        fontSize: 12,
        marginTop: 2,
    },
    itemsList: {
        borderTopWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 16,
    },
    itemName: {
        fontSize: 14,
        flex: 1,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
    },
    addButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
