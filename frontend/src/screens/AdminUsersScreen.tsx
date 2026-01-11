import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getAllUsers, updateUserRole, adminResetPassword, updateUserTitle, changeUsername, updateUserDetails, deleteUser, adminCreateUser, User } from '../services/authService';
import { Ionicons } from '@expo/vector-icons';

export default function AdminUsersScreen() {
    const { colors } = useTheme();
    const { user: currentUser, logout } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Unified Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editUsername, setEditUsername] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [editRole, setEditRole] = useState<'user' | 'admin'>('user');
    const [editTitle, setEditTitle] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);

    // Preset Titles
    const PRESET_TITLES = ['Gelin Hanım', 'Damat Bey', 'Kayınvalide', 'Kayınpeder', 'Görümce', 'Elti', 'Baldız', 'Dayı', 'Amca', 'Teyze', 'Hala', 'Nedime', 'Sağdıç'];

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            // Force refresh users
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            Alert.alert('Hata', 'Kullanıcılar yüklenemedi');
        } finally {
            setIsLoading(false);
        }
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setIsAddingNew(false);
        setEditUsername(user.username);
        setEditPassword(''); // Keep blank unless changing
        setEditRole(user.role || 'user');
        setEditTitle(user.title || 'Gelin Hanım');
        setShowEditModal(true);
    };

    const openAddModal = () => {
        setSelectedUser(null);
        setIsAddingNew(true);
        setEditUsername('');
        setEditPassword('');
        setEditRole('user');
        setEditTitle('Gelin Hanım');
        setShowEditModal(true);
    };

    const handleSaveUser = async () => {
        if (!isAddingNew && !selectedUser) return;

        if (isAddingNew) {
            if (!editUsername.trim() || !editPassword.trim()) {
                Alert.alert('Hata', 'Kullanıcı adı ve şifre gereklidir');
                return;
            }
        }

        try {
            if (isAddingNew) {
                const result = await adminCreateUser(editUsername, editPassword, editRole, editTitle);
                if (result.success) {
                    Alert.alert('Başarılı', 'Yeni kullanıcı oluşturuldu');
                } else {
                    throw new Error(result.error);
                }
            } else if (selectedUser) {
                // IMPORTANT: Always use lowercase username as doc ID
                const currentDocId = selectedUser.username.toLowerCase();
                const newDocId = editUsername.toLowerCase().trim();

                // 1. Username Change Logic
                if (currentDocId !== newDocId) {
                    await changeUsername(currentDocId, editUsername);
                }
                else if (selectedUser.username !== editUsername) {
                    await updateUserDetails(currentDocId, { username: editUsername });
                }

                // 2. Update Details
                const updates: Partial<User> = {
                    role: editRole,
                    title: editTitle
                };
                if (editPassword.trim()) {
                    updates.password = editPassword;
                }

                const targetId = (currentDocId !== newDocId) ? newDocId : currentDocId;
                await updateUserDetails(targetId, updates);
                Alert.alert('Başarılı', 'Kullanıcı güncellendi');
            }

            setShowEditModal(false);
            loadUsers();

        } catch (error: any) {
            console.log(error);
            Alert.alert('Hata', error.message || 'Güncelleme başarısız');
        }
    };

    const handleDeleteUser = (user: User) => {
        Alert.alert(
            'Kullanıcı Sil',
            `"${user.username}" kullanıcısını silmek istediğine emin misin?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Always use lowercase username as doc ID
                            const docId = user.username.toLowerCase();
                            await deleteUser(docId);
                            Alert.alert('Başarılı', 'Kullanıcı silindi');
                            loadUsers();
                        } catch (error) {
                            Alert.alert('Hata', 'Kullanıcı silinemedi');
                        }
                    }
                }
            ]
        );
    };

    const renderUserItem = ({ item }: { item: User }) => (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.userInfo}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(item.username || '?').charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                    <Text style={[styles.username, { color: colors.textPrimary }]}>{item.username}</Text>
                    <Text style={[styles.role, { color: colors.textSecondary }]}>
                        {item.role === 'admin' ? 'Yönetici' : 'Kullanıcı'} • {item.title || 'Gelin Hanım'} • Kod: {item.friendCode || '-'}
                    </Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.rose + '20' }]} // Tinted background
                    onPress={() => openEditModal(item)}
                >
                    <Ionicons name="create-outline" size={24} color={colors.rose} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#ffebeel' }]} // Light red
                    onPress={() => handleDeleteUser(item)}
                >
                    <Ionicons name="trash-outline" size={24} color="#ff4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.rose }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>Yönetici Paneli</Text>
                    <TouchableOpacity onPress={openAddModal} style={{ marginLeft: 15, backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 10 }}>
                        <Ionicons name="person-add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.rose} />
                </View>
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderUserItem}
                    keyExtractor={item => item.username}
                    contentContainerStyle={styles.list}
                />
            )}

            {/* UNIFIED EDIT USER MODAL */}
            <Modal visible={showEditModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface, maxHeight: '80%' }]}>
                        {/* Header */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
                                {isAddingNew ? 'Yeni Kullanıcı' : 'Kullanıcı Düzenle'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowEditModal(false)}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Username */}
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Kullanıcı Adı</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary }]}
                                value={editUsername}
                                onChangeText={setEditUsername}
                                autoCapitalize="none"
                            />

                            {/* Password */}
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Şifre (Boş bırakırsan değişmez)</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary }]}
                                value={editPassword}
                                onChangeText={setEditPassword}
                                placeholder="Yeni şifre..."
                                placeholderTextColor={colors.textLight}
                            />

                            {/* System Role */}
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Sistem Yetkisi</Text>
                            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                                <TouchableOpacity
                                    style={[styles.roleOption, editRole === 'user' && { backgroundColor: colors.rose }]}
                                    onPress={() => setEditRole('user')}
                                >
                                    <Text style={{ color: editRole === 'user' ? '#fff' : colors.textSecondary }}>Kullanıcı</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.roleOption, editRole === 'admin' && { backgroundColor: colors.rose, marginLeft: 10 }]}
                                    onPress={() => setEditRole('admin')}
                                >
                                    <Text style={{ color: editRole === 'admin' ? '#fff' : colors.textSecondary }}>Yönetici</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Title (Custom Role) */}
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Görünen Unvan (Rol)</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary }]}
                                value={editTitle}
                                onChangeText={setEditTitle}
                                placeholder="Örn: Kaynana, Nedime..."
                            />

                            {/* Quick Titles */}
                            <Text style={[styles.label, { color: colors.textLight, fontSize: 12, marginTop: -10, marginBottom: 10 }]}>Hızlı Seçim:</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {PRESET_TITLES.map(t => (
                                    <TouchableOpacity
                                        key={t}
                                        style={{ backgroundColor: colors.background, padding: 6, borderRadius: 6, marginRight: 8, marginBottom: 8 }}
                                        onPress={() => setEditTitle(t)}
                                    >
                                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: colors.rose, marginTop: 20 }]}
                                onPress={handleSaveUser}
                            >
                                <Text style={styles.saveButtonText}>
                                    {isAddingNew ? 'Kullanıcı Oluştur' : 'Değişiklikleri Kaydet'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    logoutButton: { padding: 5 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 20 },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
    },
    userInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee',
        justifyContent: 'center', alignItems: 'center', marginRight: 12
    },
    avatarText: { fontSize: 18, fontWeight: 'bold', color: '#555' },
    username: { fontSize: 16, fontWeight: '600' },
    role: { fontSize: 12 },
    actions: { flexDirection: 'row' },
    actionButton: { padding: 8, borderRadius: 8, marginLeft: 8 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { borderRadius: 20, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },

    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 10 },
    input: { height: 50, borderRadius: 10, paddingHorizontal: 16, marginBottom: 20 },

    roleOption: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#eee'
    },

    saveButton: { height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
