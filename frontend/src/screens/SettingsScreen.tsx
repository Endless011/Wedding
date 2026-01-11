import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ThemePalette } from '../types';

const themePaletteOptions: { key: ThemePalette; label: string; color: string; emoji: string }[] = [
    { key: 'rose', label: 'Gül', color: '#E8B4BC', emoji: '🌹' },
    { key: 'blue', label: 'Mavi', color: '#8BB4D4', emoji: '💙' },
    { key: 'gold', label: 'Altın', color: '#D4B896', emoji: '✨' },
    { key: 'sage', label: 'Yeşil', color: '#9CAF88', emoji: '🌿' },
    { key: 'lavender', label: 'Lavanta', color: '#B4A8D4', emoji: '💜' },
];

export default function SettingsScreen() {
    const { resetAllData, getTotalProgress, categories } = useData();
    const { palette, setMode, setPalette, isDark, colors } = useTheme();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Çıkış Yap',
            'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: () => logout(),
                },
            ]
        );
    };

    const handleResetData = () => {
        Alert.alert(
            'Verileri Sıfırla',
            'Tüm kategoriler ve öğeler silinecek. Bu işlem geri alınamaz!',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sıfırla',
                    style: 'destructive',
                    onPress: () => {
                        resetAllData();
                        Alert.alert('Başarılı', 'Tüm veriler silindi.');
                    },
                },
            ]
        );
    };

    const totalProgress = getTotalProgress();
    const totalSubCategories = categories.reduce(
        (sum, cat) => sum + cat.subCategories.length,
        0
    );

    const toggleDarkMode = () => {
        setMode(isDark ? 'light' : 'dark');
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
            {/* User Info */}
            {user && (
                <View style={styles.section}>
                    <View style={[styles.userInfo, { backgroundColor: colors.surface }]}>
                        <View style={[styles.userAvatar, { backgroundColor: colors.rose }]}>
                            <Text style={styles.userAvatarText}>{user.username.charAt(0).toUpperCase()}</Text>
                        </View>
                        <Text style={[styles.userName, { color: colors.textPrimary }]}>Merhaba, {user.username}!</Text>
                        <Text style={[styles.userSubtitle, { color: colors.textSecondary }]}>Hoş geldiniz</Text>
                    </View>
                </View>
            )}

            {/* App Info */}
            <View style={styles.section}>
                <View style={[styles.appInfo, { backgroundColor: colors.surface }]}>
                    <View style={[styles.appIcon, { backgroundColor: colors.rose + '20' }]}>
                        <Text style={styles.appEmoji}>📦</Text>
                    </View>
                    <Text style={[styles.appName, { color: colors.textPrimary }]}>Çeyiz Takip</Text>
                    <Text style={[styles.appVersion, { color: colors.textSecondary }]}>Sürüm 1.0.0</Text>
                </View>
            </View>

            {/* Theme Settings */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Görünüm</Text>

                {/* Dark Mode Toggle */}
                <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
                    <View style={[styles.settingIcon, { backgroundColor: colors.charcoal + '20' }]}>
                        <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={colors.charcoal} />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Karanlık Mod</Text>
                    </View>
                    <Switch
                        value={isDark}
                        onValueChange={toggleDarkMode}
                        trackColor={{ false: colors.lightGray, true: colors.rose }}
                        thumbColor={colors.surface}
                    />
                </View>

                {/* Theme Palette */}
                <View style={[styles.paletteContainer, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.paletteTitle, { color: colors.textPrimary }]}>Renk Teması</Text>
                    <View style={styles.paletteRow}>
                        {themePaletteOptions.map((option) => (
                            <TouchableOpacity
                                key={option.key}
                                style={[
                                    styles.paletteOption,
                                    { backgroundColor: option.color },
                                    palette === option.key && styles.paletteOptionSelected,
                                ]}
                                onPress={() => setPalette(option.key)}
                            >
                                <Text style={styles.paletteEmoji}>{option.emoji}</Text>
                                {palette === option.key && (
                                    <View style={styles.paletteCheck}>
                                        <Ionicons name="checkmark" size={14} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Statistics */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>İstatistikler</Text>

                <View style={styles.statsGrid}>
                    <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
                        <Ionicons name="folder" size={24} color={colors.rose} />
                        <Text style={[styles.statValue, { color: colors.textPrimary }]}>{categories.length}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Kategori</Text>
                    </View>

                    <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
                        <Ionicons name="layers" size={24} color={colors.dustyRose} />
                        <Text style={[styles.statValue, { color: colors.textPrimary }]}>{totalSubCategories}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Öğe</Text>
                    </View>

                    <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
                        <Ionicons name="cube" size={24} color={colors.coral} />
                        <Text style={[styles.statValue, { color: colors.textPrimary }]}>{totalProgress.total}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Toplam Adet</Text>
                    </View>

                    <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
                        <Ionicons name="checkmark-circle" size={24} color={colors.sage} />
                        <Text style={[styles.statValue, { color: colors.textPrimary }]}>{totalProgress.purchased}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Alınan</Text>
                    </View>
                </View>
            </View>

            {/* Actions */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Veri Yönetimi</Text>

                <TouchableOpacity style={[styles.settingRow, { backgroundColor: colors.surface }]} onPress={handleResetData}>
                    <View style={[styles.settingIcon, { backgroundColor: colors.error + '20' }]}>
                        <Ionicons name="trash" size={20} color={colors.error} />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Tüm Verileri Sil</Text>
                        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Tüm kategorileri ve öğeleri sil</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.gray} />
                </TouchableOpacity>
            </View>

            {/* Account Actions */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Hesap</Text>

                <TouchableOpacity style={[styles.settingRow, { backgroundColor: colors.surface }]} onPress={handleLogout}>
                    <View style={[styles.settingIcon, { backgroundColor: '#FF6B6B20' }]}>
                        <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Çıkış Yap</Text>
                        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Hesabınızdan çıkış yapın</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.gray} />
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                    Argun & Atakan tarafından geliştirilmiştir.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    appInfo: {
        alignItems: 'center',
        borderRadius: 20,
        padding: 24,
    },
    appIcon: {
        width: 72,
        height: 72,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    appEmoji: {
        fontSize: 36,
    },
    appName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    appVersion: {
        fontSize: 14,
    },
    userInfo: {
        alignItems: 'center',
        borderRadius: 20,
        padding: 24,
    },
    userAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    userAvatarText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userSubtitle: {
        fontSize: 14,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: 13,
    },
    paletteContainer: {
        borderRadius: 14,
        padding: 16,
    },
    paletteTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    paletteRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    paletteOption: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    paletteOptionSelected: {
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    paletteEmoji: {
        fontSize: 20,
    },
    paletteCheck: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#4CAF50',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statItem: {
        flex: 1,
        minWidth: '45%',
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    footerText: {
        fontSize: 14,
        marginBottom: 4,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '80%',
        borderRadius: 20,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
    },
    usersList: {
        paddingBottom: 16,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    userItemAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userItemAvatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userItemInfo: {
        flex: 1,
    },
    userItemName: {
        fontSize: 16,
        fontWeight: '600',
    },
    userItemPassword: {
        fontSize: 13,
        marginTop: 2,
    },
    userItemDate: {
        fontSize: 11,
        marginTop: 2,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 12,
        marginTop: 8,
    },
    refreshButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        marginLeft: 8,
    },
});
