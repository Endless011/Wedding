import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Category, Product, Group } from '../types';
import { useData } from '../context/DataContext';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import AddProductModal from '../components/AddProductModal';

export default function CategoryDetailScreen() {
    const { colors } = useTheme();
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { groups, createProduct, removeProduct, editCategory } = useData();
    const [showAddModal, setShowAddModal] = useState(false);

    const groupId = route.params?.groupId;
    const initialCategory = route.params?.category as Category;

    // Get fresh data
    const group = groups.find(g => g.id === groupId);
    const category = group?.categories.find(c => c.id === initialCategory.id);

    const [localTarget, setLocalTarget] = useState(category?.targetQuantity || 1);

    // Sync local state when category changes (but only if not currently editing?)
    // Actually, simple sync is fine for this use case.
    React.useEffect(() => {
        if (category) {
            setLocalTarget(category.targetQuantity);
        }
    }, [category?.targetQuantity]);


    if (!group || !category) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Text>Kategori bulunamadı</Text>
            </View>
        );
    }

    const purchasedTotal = category.products.reduce((acc, p) => acc + p.purchasedQuantity, 0);
    // Use localTarget for progress calculation to be instant
    const progress = localTarget > 0 ? Math.min(100, Math.round((purchasedTotal / localTarget) * 100)) : 0;

    const handleAddProduct = async (data: { name: string; brand: string; quantity: number; price: number }) => {
        const purchasedTotal = category.products.reduce((acc, p) => acc + p.purchasedQuantity, 0);
        const newTotal = purchasedTotal + data.quantity;

        if (newTotal > localTarget) {
            Alert.alert(
                'Limit Aşıldı',
                `Bu kategori için hedef ${localTarget} adet. Zaten ${purchasedTotal} adet alınmış. Eklemek istediğin ${data.quantity} adet ile limit aşılıyor.`
            );
            return;
        }

        await createProduct(groupId, category.id, {
            name: data.name,
            brand: data.brand,
            purchasedQuantity: data.quantity,
            price: data.price,
            isPurchased: true,
            notes: ''
        });
    };

    const handleEditTarget = () => {
        Alert.prompt('Hedef Adet', 'Bu kategoriden toplam kaç adet lazım?', [
            { text: 'İptal', style: 'cancel' },
            {
                text: 'Kaydet',
                onPress: (text?: string) => {
                    const quantity = parseInt(text || '0');
                    if (!isNaN(quantity) && quantity > 0) {
                        // Optimistic Update
                        setLocalTarget(quantity);
                        // Fire and forget (or handle error silently)
                        editCategory(groupId, category.id, { targetQuantity: quantity });
                    }
                }
            }
        ], 'plain-text', localTarget.toString());
    };

    const handleLongPressProduct = (product: Product) => {
        Alert.alert('Sil', `${product.name} silinsin mi?`, [
            { text: 'İptal', style: 'cancel' },
            { text: 'Sil', style: 'destructive', onPress: () => removeProduct(groupId, category.id, product.id) }
        ]);
    };

    const renderProductItem = ({ item }: { item: Product }) => {
        return (
            <TouchableOpacity
                style={[styles.productCard, { backgroundColor: colors.surface, borderLeftColor: group.color }]}
                onLongPress={() => handleLongPressProduct(item)}
            >
                <View style={styles.productContent}>
                    <Text style={[styles.productName, { color: colors.textPrimary }]}>{item.name}</Text>
                    {item.brand ? <Text style={[styles.productDetail, { color: colors.textSecondary }]}>{item.brand}</Text> : null}
                    {item.price ? <Text style={[styles.productPrice, { color: colors.rose }]}>{item.price.toLocaleString('tr-TR')} ₺</Text> : null}
                </View>
                <View style={styles.rightContent}>
                    <View style={[styles.badge, { backgroundColor: colors.sage }]}>
                        <Text style={styles.badgeText}>{item.purchasedQuantity} adet</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{category.name}</Text>

                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => setShowAddModal(true)} style={{ marginRight: 15 }}>
                        <Ionicons name="add-circle-outline" size={28} color={colors.rose} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleEditTarget}>
                        <Ionicons name="settings-outline" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Progress Section */}
            <View style={[styles.progressSection, { backgroundColor: colors.surface }]}>
                <View style={styles.progressTextRow}>
                    <Text style={{ color: colors.textSecondary }}>İlerleme</Text>
                    <Text style={{ fontWeight: 'bold', color: colors.rose }}>{purchasedTotal} / {localTarget}</Text>
                </View>
                <View style={[styles.progressBarBg, { backgroundColor: colors.lightGray }]}>
                    <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: group.color }]} />
                </View>
            </View>

            <FlatList
                data={category.products}
                renderItem={renderProductItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            Henüz ürün eklenmemiş. Aldıklarını ekle!
                        </Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: group.color }]}
                onPress={() => setShowAddModal(true)}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>

            <AddProductModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddProduct}
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
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, zIndex: 1
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },

    progressSection: { padding: 20, marginBottom: 10 },
    progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },

    list: { padding: 20 },
    productCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16, marginBottom: 12,
        borderRadius: 12, borderLeftWidth: 4,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
    },
    productContent: { flex: 1 },
    productName: { fontSize: 16, fontWeight: '600' },
    productDetail: { fontSize: 14, marginTop: 2 },
    productPrice: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
    rightContent: { alignItems: 'flex-end' },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

    emptyState: { padding: 40, alignItems: 'center' },
    emptyText: { textAlign: 'center' },

    fab: {
        position: 'absolute', bottom: 30, right: 30,
        width: 56, height: 56, borderRadius: 28,
        justifyContent: 'center', alignItems: 'center',
        elevation: 5
    }
});
