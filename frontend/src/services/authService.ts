// Auth Service - Kullanıcı adı ve şifre tabanlı kimlik doğrulama
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, headers } from '../config/api';

const CURRENT_USER_KEY = '@current_user';

export interface User {
    username: string;
    password: string;
    registeredAt: string;
    role?: 'user' | 'admin';
    title?: string;
    friendCode?: string;
    id?: string;
}

export interface AuthResult {
    success: boolean;
    user?: User;
    error?: string;
}

// Random Friend Code Generator
export const generateFriendCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Arkadaş kodu ile kullanıcı bul
export const getUserByFriendCode = async (code: string): Promise<User | null> => {
    // API endpoint needed
    return null;
};

// Kullanıcı adı kontrolü
export const checkUsernameExists = async (username: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/user/${username}`, { headers });
        return response.status === 200;
    } catch (error) {
        console.error('Username check error:', error);
        return false;
    }
};

// Yönetici tarafından kullanıcı oluşturma
export const adminCreateUser = async (username: string, password: string, role: 'user' | 'admin' = 'user', title: string = 'Gelin Hanım'): Promise<AuthResult> => {
    return registerUser(username, password);
};

// Mevcut kullanıcıyı yerel olarak güncelle
export const updateLocalUser = async (updates: Partial<User>): Promise<void> => {
    try {
        const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
        if (userJson) {
            const currentUser = JSON.parse(userJson) as User;
            const updatedUser = { ...currentUser, ...updates };
            await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
        }
    } catch (error) {
        console.error('Update local user error:', error);
    }
};

// Mevcut kullanıcıyı al
export const getCurrentUser = async (): Promise<User | null> => {
    try {
        const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
        if (userJson) {
            return JSON.parse(userJson) as User;
        }
        return null;
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
};

// Tüm kullanıcıları getir (admin için)
export const getAllUsers = async (): Promise<User[]> => {
    try {
        const response = await fetch(`${API_URL}/users`, { headers });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('Get all users error:', error);
        return [];
    }
};

// Genel kullanıcı güncelleme
export const updateUserDetails = async (username: string, updates: Partial<User>): Promise<void> => {
    try {
        await fetch(`${API_URL}/user/update`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ username, updates }),
        });
    } catch (error) {
        console.error('Update details error:', error);
        throw error;
    }
};

// Kullanıcı rolünü güncelle
export const updateUserRole = async (username: string, newRole: 'user' | 'admin'): Promise<void> => {
    await updateUserDetails(username, { role: newRole });
};

// Kullanıcı şifresini güncelle (Admin için)
export const adminResetPassword = async (username: string, newPassword: string): Promise<void> => {
    await updateUserDetails(username, { password: newPassword });
};

// Kullanıcı unvanını güncelle (Admin için)
export const updateUserTitle = async (username: string, newTitle: string): Promise<void> => {
    await updateUserDetails(username, { title: newTitle });
};

// Admin Kullanıcısını Sıfırla ve Temizle
export const resetAdminEnvironment = async (): Promise<void> => {
    console.warn('resetAdminEnvironment not implemented for SQL backend');
};

// Kullanıcı adını değiştir
export const changeUsername = async (currentDocId: string, newUsername: string): Promise<boolean> => {
    try {
        await updateUserDetails(currentDocId, { username: newUsername });
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

// Kullanıcı sil
export const deleteUser = async (username: string): Promise<void> => {
    try {
        await fetch(`${API_URL}/user/${username}`, {
            method: 'DELETE',
            headers,
        });
    } catch (error) {
        console.error('Delete user error:', error);
        throw error;
    }
};

// Giriş yap
export const loginUser = async (username: string, password: string): Promise<AuthResult> => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error || 'Giriş başarısız' };
        }

        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Sunucu bağlantı hatası' };
    }
};

// Kayıt ol
export const registerUser = async (username: string, password: string): Promise<AuthResult> => {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error || 'Kayıt başarısız' };
        }

        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Register error:', error);
        return { success: false, error: 'Sunucu bağlantı hatası' };
    }
};

// Çıkış yap
export const logoutUser = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
        console.error('Logout error:', error);
    }
};
