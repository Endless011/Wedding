import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Category } from '../types';
import { useData } from '../context/DataContext';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddCategoryModal from '../components/AddCategoryModal';

export default function GroupDetailScreen() {
    const { colors } = useTheme();
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { groups, createCategory, removeCategory, removeGroup, isReadOnly } = useData();
    const [showAddModal, setShowAddModal] = useState(false);

    const insets = useSafeAreaInsets();

    const groupId = route.params?.group?.id;
    const group = groups.find(g => g.id === groupId);

    if (!group) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Text>Grup bulunamadı</Text>
            </View>
        );
    }

    const handleAddCategory = async (data: { name: string; quantity: number; description: string }) => {
        await createCategory(group.id, {
            name: data.name,
            description: data.description,
            targetQuantity: data.quantity,
            isCompleted: false
        });
    };

    const handleCategoryPress = (category: Category) => {
        navigation.navigate('CategoryDetail', { category, groupId: group.id });
    };

    const handleLongPress = (category: Category) => {
        if (isReadOnly) return;
        Alert.alert('Sil', `${category.name} silinsin mi?`, [
            { text: 'İptal', style: 'cancel' },
            { text: 'Sil', style: 'destructive', onPress: () => removeCategory(group.id, category.id) }
        ]);
    };

    const renderCategoryItem = ({ item }: { item: Category }) => {
        const purchasedCount = item.products.reduce((acc, p) => acc + p.purchasedQuantity, 0);
        return (
            <TouchableOpacity
                style={[styles.itemCard, { backgroundColor: colors.surface, borderLeftColor: group.color }]}
                onPress={() => handleCategoryPress(item)}
                onLongPress={() => handleLongPress(item)}
            >
                <View style={styles.itemContent}>
                    <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{item.name}</Text>
                    <View style={styles.subtitleRow}>
                        <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                            Hedef: {item.targetQuantity} • Alınan: {purchasedCount}
                        </Text>
                        {item.description ? (
                            <Text style={[styles.itemBrand, { color: group.color }]}>
                                {item.description}
                            </Text>
                        ) : null}
                    </View>
                </View>
                {item.isCompleted && <Ionicons name="checkmark-circle" size={24} color={colors.sage} />}
            </TouchableOpacity>
        );
    };

    // Button to be shown either in center (empty) or footer (list)
    const AddButton = () => {
        if (isReadOnly) return null;
        return (
            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: group.color + '15', borderColor: group.color }]}
                onPress={() => setShowAddModal(true)}
            >
                <Ionicons name="add-circle" size={24} color={group.color} />
                <Text style={[styles.addButtonText, { color: group.color }]}>Yeni Kategori Ekle</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, {
                backgroundColor: colors.surface,
                paddingTop: insets.top + 10, // Dynamic safe area + small spacing
                paddingBottom: 15
            }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{group.name}</Text>

                <View style={{ flexDirection: 'row' }}>
                    {!isReadOnly && (
                        <TouchableOpacity onPress={() => setShowAddModal(true)}>
                            <Ionicons name="add-circle-outline" size={28} color={group.color} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={group.categories}
                renderItem={renderCategoryItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListHeaderComponent={group.categories.length > 0 ? <AddButton /> : null}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="documents-outline" size={48} color={colors.lightGray} />
                        </View>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            {isReadOnly ? 'Bu grupta henüz kategori yok.' : 'Henüz kategori yok.'}
                        </Text>
                        <AddButton />
                    </View>
                }
            />

            <AddCategoryModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddCategory}
                groupColor={group.color}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20,
        // paddingTop is handled inline
        zIndex: 1
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    list: { padding: 20, paddingBottom: 120 },

    itemCard: {
        flexDirection: 'row', alignItems: 'center',
        padding: 16, marginBottom: 12,
        borderRadius: 16, borderLeftWidth: 4,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
    },
    itemContent: { flex: 1 },
    itemTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    subtitleRow: { flexDirection: 'column' },
    itemSubtitle: { fontSize: 13, marginBottom: 2 },
    itemBrand: { fontSize: 13, fontWeight: '500', fontStyle: 'italic' },

    // Add Button Styles
    addButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        padding: 16, borderRadius: 16,
        borderWidth: 1, borderStyle: 'dashed',
        marginBottom: 20
    },
    addButtonText: { fontSize: 16, fontWeight: '600', marginLeft: 8 },

    // Empty State
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyIconContainer: { marginBottom: 16, opacity: 0.5 },
    emptyText: { fontSize: 16, marginBottom: 24 }
});
