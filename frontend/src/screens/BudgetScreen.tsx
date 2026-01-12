import React from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { Group, Category } from '../types';

export default function BudgetScreen() {
    const { groups } = useData();
    const { colors } = useTheme();

    // Calculate Overall Stats
    const calculateStats = () => {
        let totalItemsTarget = 0;
        let totalItemsPurchased = 0;
        let totalSpent = 0;

        groups.forEach(group => {
            group.categories.forEach(cat => {
                totalItemsTarget += cat.targetQuantity || 0;

                cat.products.forEach(prod => {
                    totalItemsPurchased += prod.purchasedQuantity || 0;
                    totalSpent += prod.price || 0;
                });
            });
        });

        const percentage = totalItemsTarget === 0 ? 0 : Math.min(100, Math.round((totalItemsPurchased / totalItemsTarget) * 100));

        return { totalItemsTarget, totalItemsPurchased, totalSpent, percentage };
    };

    const stats = calculateStats();

    const renderSummary = () => (
        <View style={styles.summaryContainer}>
            {/* Total Spending Card */}
            <View style={[styles.mainCard, { backgroundColor: colors.rose }]}>
                <View style={styles.cardHeader}>
                    <Text style={styles.mainCardTitle}>Toplam Harcama</Text>
                    <Ionicons name="wallet-outline" size={24} color="rgba(255,255,255,0.8)" />
                </View>
                <Text style={styles.mainCardValue}>{stats.totalSpent.toLocaleString('tr-TR')} ₺</Text>

                <View style={styles.divider} />

                <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>Çeyiz Tamamlanma</Text>
                    <Text style={styles.progressValue}>%{stats.percentage}</Text>
                </View>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${stats.percentage}%` }]} />
                </View>
                <Text style={styles.progressSubtext}>
                    {stats.totalItemsPurchased} / {stats.totalItemsTarget} ürün alındı
                </Text>
            </View>
        </View>
    );

    const renderGroupStats = ({ item }: { item: Group }) => {
        let groupSpent = 0;
        let groupTarget = 0;
        let groupPurchased = 0;

        item.categories.forEach(cat => {
            groupTarget += cat.targetQuantity || 0;
            cat.products.forEach(p => {
                groupPurchased += p.purchasedQuantity || 0;
                groupSpent += p.price || 0;
            });
        });

        const progress = groupTarget === 0 ? 0 : Math.round((groupPurchased / groupTarget) * 100);

        return (
            <View style={[styles.groupCard, { backgroundColor: colors.surface }]}>
                <View style={styles.groupHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                        <Text style={styles.icon}>{item.icon}</Text>
                    </View>
                    <View style={styles.groupInfo}>
                        <Text style={[styles.groupName, { color: colors.textPrimary }]}>{item.name}</Text>
                        <Text style={[styles.groupSpent, { color: colors.rose }]}>
                            {groupSpent.toLocaleString('tr-TR')} ₺
                        </Text>
                    </View>
                    <View style={styles.percentContainer}>
                        <Text style={[styles.percentText, { color: item.color }]}>%{progress}</Text>
                    </View>
                </View>

                <View style={[styles.miniProgressBar, { backgroundColor: colors.lightGray }]}>
                    <View style={[styles.miniProgressFill, { width: `${progress}%`, backgroundColor: item.color }]} />
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={groups}
                renderItem={renderGroupStats}
                keyExtractor={item => item.id}
                ListHeaderComponent={renderSummary}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            Henüz veri yok.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    listContainer: { padding: 20, paddingBottom: 120 },
    summaryContainer: { marginBottom: 20 },
    mainCard: {
        borderRadius: 24, padding: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    mainCardTitle: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '500' },
    mainCardValue: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginBottom: 20 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 20 },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
    progressValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, marginBottom: 8 },
    progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },
    progressSubtext: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },

    groupCard: {
        borderRadius: 16, padding: 16, marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    groupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    iconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    icon: { fontSize: 20 },
    groupInfo: { flex: 1 },
    groupName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
    groupSpent: { fontSize: 14, fontWeight: 'bold' },
    percentContainer: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.03)' },
    percentText: { fontWeight: 'bold', fontSize: 14 },
    miniProgressBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
    miniProgressFill: { height: '100%', borderRadius: 2 },

    emptyContainer: { alignItems: 'center', marginTop: 40 },
    emptyText: { fontSize: 16 }
});
