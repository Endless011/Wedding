import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { Group } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


import { useAuth } from '../context/AuthContext';

// Simple "Hero" component for the greeting
const HeroSection = ({ progress }: { progress: number }) => {
    const { colors } = useTheme();
    const { user } = useAuth();

    return (
        <View style={styles.heroContainer}>
            <View>
                <Text style={[styles.greetingText, { color: colors.textSecondary }]}>Hoş geldin,</Text>
                <Text style={[styles.heroTitle, { color: colors.rose }]}>
                    {user?.title ? user.title : 'Gelin Hanım'}
                </Text>
            </View>
            <View style={styles.progressRingContainer}>
                {/* Placeholder for a ring chart */}
                <View style={[styles.progressRing, { borderColor: colors.rose }]}>
                    <Text style={[styles.progressText, { color: colors.rose }]}>%{progress}</Text>
                </View>
            </View>
        </View>
    );
};


import QuickAddGroupsModal from '../components/QuickAddGroupsModal';

export default function HomeScreen() {
    const { groups, isLoading, calculateOverallProgress, createGroup, removeGroup, isReadOnly, targetUserId, setTargetUserId } = useData();
    const { colors } = useTheme();
    const navigation = useNavigation<any>();
    const [showQuickAdd, setShowQuickAdd] = React.useState(false);

    const handleExitGuestMode = () => {
        setTargetUserId(null);
        Alert.alert('Hoşça kal', 'Kendi çeyiz listene geri döndün.');
    };

    const handleGroupPress = (group: Group) => {
        navigation.navigate('GroupDetail', { group });
    };

    const handleAddGroup = () => {
        if (isReadOnly) return;
        Alert.prompt('Yeni Grup Oluştur', 'Grup adı giriniz (örn: Mutfak)', async (text) => {
            if (text) {
                await createGroup({
                    name: text,
                    icon: '📦',
                    color: '#E8B4BC',
                    categories: []
                } as any);
            }
        });
    };

    const handleLongPress = (group: Group) => {
        if (isReadOnly) return;
        Alert.alert('Grubu Sil', `${group.name} silinsin mi?`, [
            { text: 'İptal', style: 'cancel' },
            {
                text: 'Sil',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await removeGroup(group.id);
                    } catch (error) {
                        console.error('Group delete failed:', error);
                        Alert.alert('Hata', 'Grup silinemedi');
                    }
                }
            }
        ]);
    };

    const renderGroupCard = ({ item }: { item: Group }) => {
        // Calculate group progress
        // Total items in this group vs purchased
        let total = 0;
        let purchased = 0;
        item.categories.forEach(c => {
            total += c.targetQuantity;
            c.products.forEach(p => purchased += p.purchasedQuantity);
        });
        const progress = total === 0 ? 0 : Math.round((purchased / total) * 100);

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.surface }]}
                onPress={() => handleGroupPress(item)}
                onLongPress={() => handleLongPress(item)}
                activeOpacity={0.8}
            >
                <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                    <Text style={styles.icon}>{item.icon}</Text>
                </View>
                <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{item.name}</Text>
                    <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                        {item.categories.length} Kategori • %{progress} Tamamlandı
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.rose} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {isReadOnly && (
                <View style={{ backgroundColor: colors.rose, paddingVertical: 12, paddingHorizontal: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Misafir Modu</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>{targetUserId} kullanıcısını görüntülüyorsun</Text>
                    </View>
                    <TouchableOpacity
                        style={{ backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
                        onPress={handleExitGuestMode}
                    >
                        <Text style={{ color: colors.rose, fontWeight: '600' }}>Çıkış</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={[styles.header, isReadOnly && { paddingTop: 20 }]}>
                {!isReadOnly && <HeroSection progress={calculateOverallProgress()} />}
            </View>

            <View style={styles.listContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                        {isReadOnly ? `${targetUserId}'in Çeyizi` : 'Çeyiz Gruplarım'}
                    </Text>
                    {!isReadOnly && (
                        <TouchableOpacity
                            style={[styles.quickAddButton, { backgroundColor: colors.surface, borderColor: colors.rose }]}
                            onPress={() => setShowQuickAdd(true)}
                        >
                            <Ionicons name="sparkles" size={16} color={colors.rose} style={{ marginRight: 4 }} />
                            <Text style={[styles.quickAddText, { color: colors.rose }]}>Hızlı Ekle</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <FlatList
                    data={groups}
                    renderItem={renderGroupCard}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.flatList}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                {isReadOnly ? 'Bu kullanıcının henüz bir grubu yok.' : 'Henüz bir grup yok. Başlamak için ekle!'}
                            </Text>
                        </View>
                    }
                />
            </View>

            {!isReadOnly && (
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: colors.rose }]}
                    onPress={handleAddGroup}
                >
                    <Ionicons name="add" size={32} color="#fff" />
                </TouchableOpacity>
            )}

            <QuickAddGroupsModal
                visible={showQuickAdd}
                onClose={() => setShowQuickAdd(false)}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 24, paddingTop: 60, paddingBottom: 10 },
    heroContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    greetingText: { fontSize: 16, fontWeight: '500' },
    heroTitle: { fontSize: 28, fontWeight: 'bold' },
    progressRingContainer: {},
    progressRing: {
        width: 60, height: 60, borderRadius: 30, borderWidth: 3,
        justifyContent: 'center', alignItems: 'center'
    },
    progressText: { fontSize: 14, fontWeight: 'bold' },

    listContainer: { flex: 1, paddingHorizontal: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginLeft: 5 },
    quickAddButton: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1
    },
    quickAddText: { fontSize: 13, fontWeight: '600' },
    flatList: { paddingBottom: 100 },

    card: {
        flexDirection: 'row', alignItems: 'center',
        padding: 16, marginBottom: 16,
        borderRadius: 20,
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3
    },
    iconContainer: {
        width: 50, height: 50, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center', marginRight: 16
    },
    icon: { fontSize: 24 },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
    cardSubtitle: { fontSize: 14 },

    emptyState: { padding: 40, alignItems: 'center' },
    emptyText: { textAlign: 'center' },

    fab: {
        position: 'absolute', bottom: 30, right: 30,
        width: 64, height: 64, borderRadius: 32,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
    }
});
