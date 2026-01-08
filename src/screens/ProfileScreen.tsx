import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Switch, Alert, TextInput } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { checkUsernameExists, getUserByFriendCode } from '../services/authService';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Clipboard } from 'react-native'; // Fallback for copy functionality
import WeddingDateModal from '../components/WeddingDateModal';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { user, logout, weddingDate, saveWeddingDate, updatePassword } = useAuth();
    const { colors, isDark, toggleTheme } = useTheme();
    const [showDateModal, setShowDateModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [daysLeft, setDaysLeft] = useState<number | null>(null);

    useEffect(() => {
        if (weddingDate) {
            const now = new Date();
            const target = new Date(weddingDate);
            const diff = target.getTime() - now.getTime();
            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
            setDaysLeft(days > 0 ? days : 0);
        } else {
            setDaysLeft(null);
        }
    }, [weddingDate]);

    const { setTargetUserId } = useData();
    const [friendCode, setFriendCode] = useState('');

    const handleViewFriend = async () => {
        if (!friendCode.trim()) return;

        try {
            const friendUser = await getUserByFriendCode(friendCode);
            if (!friendUser) {
                Alert.alert('Hata', 'Bu kod ile bir kullanıcı bulunamadı.');
                return;
            }

            if (friendUser.username.toLowerCase() === user?.username.toLowerCase()) {
                Alert.alert('Uyarı', 'Kendi kodunu giremezsin :)');
                return;
            }

            // Success
            Alert.alert(
                'Başarılı',
                `${friendUser.username} hesabının çeyiz listesini inceliyorsun.`,
                [
                    {
                        text: 'Listeye Git',
                        onPress: () => {
                            // @ts-ignore
                            navigation.navigate('Guest', {
                                screen: 'GuestHome',
                                params: { username: friendUser.username.toLowerCase() }
                            });
                            setFriendCode('');
                        }
                    }
                ]
            );

        } catch (error) {
            Alert.alert('Hata', 'Bir sorun oluştu');
        }
    };

    const handleLogout = () => {
        Alert.alert('Çıkış Yap', 'Emin misiniz?', [
            { text: 'İptal', style: 'cancel' },
            { text: 'Çık', style: 'destructive', onPress: logout }
        ]);
    };

    const handleCopyCode = () => {
        if (user?.friendCode) {
            Clipboard.setString(user.friendCode);
            Alert.alert('Başarılı', 'Kod kopyalandı!');
        }
    };

    const { groups, editGroup } = useData();
    const handleFixColors = () => {
        Alert.alert('Renkleri Yenile', 'Tüm grupların renkleri yeni temaya göre güncellenecek. Onaylıyor musun?', [
            { text: 'İptal', style: 'cancel' },
            {
                text: 'Yenile',
                onPress: () => {
                    const { categoryColors } = require('../theme/colors');
                    groups.forEach((group, index) => {
                        const newColor = categoryColors[index % categoryColors.length];
                        editGroup(group.id, { color: newColor });
                    });
                    Alert.alert('Başarılı', 'Renkler güncellendi! Lütfen sayfayı yenile.');
                }
            }
        ]);
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={{ paddingBottom: 120 }}
        >
            <View style={[styles.header, { backgroundColor: colors.rose }]}>
                <View style={styles.avatarContainer}>
                    <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
                        <Text style={{ fontSize: 40 }}>👰‍♀️</Text>
                    </View>
                </View>
                <Text style={styles.name}>{user?.username || 'Gelin Hanım'}</Text>
                <Text style={styles.email}>{user?.title || 'Müstakbel Gelin'}</Text>
            </View>

            <View style={styles.content}>
                {/* Wedding Date Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Düğün Tarihi</Text>
                    <TouchableOpacity
                        style={[styles.dateCard, { backgroundColor: colors.surface }]}
                        onPress={() => setShowDateModal(true)}
                    >
                        <View style={styles.dateInfo}>
                            <View style={[styles.iconBox, { backgroundColor: colors.rose + '20' }]}>
                                <Ionicons name="calendar" size={24} color={colors.rose} />
                            </View>
                            <View>
                                <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
                                    {weddingDate ? 'Büyük Gün' : 'Tarih Belirle'}
                                </Text>
                                <Text style={[styles.cardValue, { color: colors.textPrimary }]}>
                                    {weddingDate
                                        ? new Date(weddingDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                                        : 'Henüz Seçilmedi'}
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                    </TouchableOpacity>
                </View>

                {/* Countdown Widget (If date is set) */}
                {daysLeft !== null && (
                    <View style={[styles.countdownContainer, { backgroundColor: colors.rose }]}>
                        <Text style={styles.countdownTitle}>Büyük Güne Kalan</Text>
                        <View style={styles.countdownValueContainer}>
                            <Text style={styles.countdownValue}>{daysLeft}</Text>
                            <Text style={styles.countdownUnit}>GÜN</Text>
                        </View>
                        <Text style={styles.countdownSubtitle}>Heyecan Dorukta! ✨</Text>
                    </View>
                )}

                {/* Dowry Code Sharing */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Çeyiz Paylaşımı</Text>

                    {/* My Code */}
                    <View style={[styles.dateCard, { backgroundColor: colors.surface, flexDirection: 'column', alignItems: 'flex-start', marginBottom: 12 }]}>
                        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Senin Çeyiz Kodun</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Text style={[styles.cardValue, { color: colors.rose, fontSize: 24, letterSpacing: 1 }]}>
                                {user?.friendCode || user?.username}
                            </Text>
                            <TouchableOpacity
                                onPress={handleCopyCode}
                                style={{ backgroundColor: colors.rose + '15', padding: 8, borderRadius: 8 }}
                            >
                                <Ionicons name="copy-outline" size={20} color={colors.rose} />
                            </TouchableOpacity>
                        </View>
                        <Text style={{ fontSize: 11, color: colors.textLight, marginTop: 8 }}>
                            Bu kodu arkadaşına vererek çeyiz listeni görmesini sağlayabilirsin.
                        </Text>
                    </View>

                    {/* Enter Code */}
                    <View style={[styles.dateCard, { backgroundColor: colors.surface, flexDirection: 'column', alignItems: 'flex-start' }]}>
                        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Başkasının Çeyizine Bak</Text>
                        <View style={{ flexDirection: 'row', width: '100%', marginTop: 8 }}>
                            <TextInput
                                style={{
                                    flex: 1,
                                    backgroundColor: colors.background,
                                    borderRadius: 12,
                                    padding: 12,
                                    color: colors.textPrimary,
                                    marginRight: 10
                                }}
                                placeholder="Arkadaşının kodu..."
                                value={friendCode}
                                onChangeText={setFriendCode}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                style={{ backgroundColor: colors.rose, borderRadius: 12, padding: 12, justifyContent: 'center' }}
                                onPress={handleViewFriend}
                            >
                                <Ionicons name="arrow-forward" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* App Settings */}
                <View style={[styles.section, { marginTop: 20 }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Uygulama Ayarları</Text>

                    <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="moon-outline" size={22} color={colors.textPrimary} />
                            <Text style={[styles.settingText, { color: colors.textPrimary }]}>Karanlık Mod</Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: "#767577", true: colors.rose }}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.settingRow, { backgroundColor: colors.surface, marginTop: 1 }]}
                        onPress={() => setShowPasswordModal(true)}
                    >
                        <View style={styles.settingLeft}>
                            <Ionicons name="lock-closed-outline" size={22} color={colors.textPrimary} />
                            <Text style={[styles.settingText, { color: colors.textPrimary }]}>Şifre Değiştir</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.settingRow, { backgroundColor: colors.surface, marginTop: 1 }]}
                        onPress={handleLogout}
                    >
                        <View style={styles.settingLeft}>
                            <Ionicons name="log-out-outline" size={22} color={colors.error} />
                            <Text style={[styles.settingText, { color: colors.error }]}>Çıkış Yap</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <WeddingDateModal
                visible={showDateModal}
                onClose={() => setShowDateModal(false)}
                onSave={saveWeddingDate}
            />

            <ChangePasswordModal
                visible={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSave={updatePassword}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingBottom: 60,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    avatarContainer: {
        marginBottom: 10,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    email: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    content: {
        flex: 1,
        padding: 20,
        // marginTop: -30, // Removed to fix overlap issue
    },
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
        marginLeft: 4,
    },
    dateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 20,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    dateInfo: { flexDirection: 'row', alignItems: 'center' },
    iconBox: {
        width: 44, height: 44, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', marginRight: 16
    },
    cardLabel: { fontSize: 13, marginBottom: 4 },
    cardValue: { fontSize: 16, fontWeight: '600' },

    countdownContainer: {
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        marginVertical: 10,
        elevation: 4,
        shadowColor: '#f43f5e',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    countdownTitle: { color: 'white', fontSize: 14, opacity: 0.9, marginBottom: 8, letterSpacing: 1 },
    countdownValueContainer: { flexDirection: 'row', alignItems: 'baseline' },
    countdownValue: { color: 'white', fontSize: 48, fontWeight: 'bold' },
    countdownUnit: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 6 },
    countdownSubtitle: { color: 'white', fontSize: 14, opacity: 0.8, marginTop: 4 },

    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    settingLeft: { flexDirection: 'row', alignItems: 'center' },
    settingText: { fontSize: 16, marginLeft: 12, fontWeight: '500' },
});
