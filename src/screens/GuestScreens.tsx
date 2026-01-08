import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Group, Category, Product } from '../types';

const GuestStack = createStackNavigator();

export default function GuestNavigator() {
    return (
        <GuestStack.Navigator screenOptions={{ headerShown: false }}>
            <GuestStack.Screen name="GuestHome" component={GuestHomeScreen} />
            <GuestStack.Screen name="GuestGroupDetail" component={GuestGroupDetailScreen} />
        </GuestStack.Navigator>
    );
}

function GuestHomeScreen() {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { guestGroups, loadGuestData } = useData();
    const targetUsername = route.params?.username;

    useEffect(() => {
        if (targetUsername) {
            const unsubscribe = loadGuestData(targetUsername);
            return () => {
                if (unsubscribe) unsubscribe();
            };
        }
    }, [targetUsername]);

    const handleExit = () => {
        Alert.alert('Çıkış', 'Misafir modundan çıkmak istiyor musun?', [
            { text: 'İptal', style: 'cancel' },
            { text: 'Çık', style: 'destructive', onPress: () => navigation.getParent()?.goBack() }
        ]);
    };

    const renderGroupCard = ({ item }: { item: Group }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface, borderLeftColor: item.color }]}
            onPress={() => navigation.navigate('GuestGroupDetail', { group: item })}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{item.name}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                    {item.categories.length} Kategori
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
                    <Ionicons name="close" size={24} color={colors.rose} />
                    <Text style={[styles.exitText, { color: colors.rose }]}>Çıkış</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{targetUsername}'in Çeyizi</Text>
                <View style={{ width: 60 }} />
            </View>

            <FlatList
                data={guestGroups}
                renderItem={renderGroupCard}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            Henüz grup eklenmemiş.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

function GuestGroupDetailScreen() {
    const { colors } = useTheme();
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const group = route.params?.group as Group;

    const renderProduct = (product: Product) => (
        <View style={[styles.productRow, { borderBottomColor: colors.cardBorder }]}>
            <View style={{ flex: 1 }}>
                <Text style={[styles.productName, { color: colors.textPrimary }]}>{product.name}</Text>
                {product.brand && <Text style={[styles.productBrand, { color: colors.textSecondary }]}>{product.brand}</Text>}
            </View>
            {/* Price HIDDEN explicitly as requested */}
            <View style={[styles.badge, { backgroundColor: colors.sage }]}>
                <Text style={styles.badgeText}>{product.purchasedQuantity} adet</Text>
            </View>
        </View>
    );

    const renderCategory = ({ item }: { item: Category }) => {
        const purchasedCount = item.products.reduce((acc, p) => acc + p.purchasedQuantity, 0);
        return (
            <View style={[styles.categoryCard, { backgroundColor: colors.surface, borderTopColor: group.color }]}>
                <View style={styles.categoryHeader}>
                    <Text style={[styles.categoryTitle, { color: colors.textPrimary }]}>{item.name}</Text>
                    <Text style={[styles.categoryProgress, { color: colors.rose }]}>
                        {purchasedCount} / {item.targetQuantity}
                    </Text>
                </View>

                {item.products.length > 0 ? (
                    <View style={styles.productList}>
                        {item.products.map(p => (
                            <View key={p.id}>
                                {renderProduct(p)}
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={[styles.noProductText, { color: colors.textLight }]}>Henüz ürün yok.</Text>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{group.name}</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={group.categories}
                renderItem={renderCategory}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
    },
    exitButton: { flexDirection: 'row', alignItems: 'center' },
    exitText: { marginLeft: 4, fontWeight: '600', fontSize: 16 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    backButton: { padding: 4 },

    list: { padding: 20 },
    card: {
        flexDirection: 'row', alignItems: 'center',
        padding: 16, marginBottom: 16,
        borderRadius: 16, borderLeftWidth: 4,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
    },
    iconContainer: {
        width: 50, height: 50, borderRadius: 25,
        justifyContent: 'center', alignItems: 'center', marginRight: 16
    },
    icon: { fontSize: 24 },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
    cardSubtitle: { fontSize: 14 },

    emptyState: { padding: 40, alignItems: 'center' },
    emptyText: { textAlign: 'center' },

    // Detail Styles
    categoryCard: {
        marginBottom: 20, borderRadius: 16,
        padding: 16, borderTopWidth: 4,
        shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 1
    },
    categoryHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 8
    },
    categoryTitle: { fontSize: 18, fontWeight: 'bold' },
    categoryProgress: { fontWeight: '600' },
    productList: {},
    productRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 8, borderBottomWidth: 1
    },
    productName: { fontSize: 15, fontWeight: '500' },
    productBrand: { fontSize: 12, marginTop: 2 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    noProductText: { fontStyle: 'italic', fontSize: 12 }
});
