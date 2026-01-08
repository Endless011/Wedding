// Auth Service - Kullanıcı adı ve şifre tabanlı kimlik doğrulama
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import { collection, doc, getDoc, setDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';

const USERS_COLLECTION = 'users';
const CURRENT_USER_KEY = '@current_user';

export interface User {
    username: string;
    password: string;
    registeredAt: string;
    role?: 'user' | 'admin';
    title?: string; // e.g. 'Gelin Hanım', 'Kaynana', 'Görümce'
    friendCode?: string; // Random code for sharing
    id?: string; // Firestore Doc ID
}

export interface AuthResult {
    success: boolean;
    user?: User;
    error?: string;
}

// Random Friend Code Generator
export const generateFriendCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded O, I, 1, 0 for clarity
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Arkadaş kodu ile kullanıcı bul
export const getUserByFriendCode = async (code: string): Promise<User | null> => {
    try {
        const q = query(collection(db, USERS_COLLECTION), where('friendCode', '==', code.toUpperCase().trim()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data() as User;
        }
        return null;
    } catch (error) {
        console.error('Get user by friend code error:', error);
        return null;
    }
};

// Kullanıcı adı kontrolü
export const checkUsernameExists = async (username: string): Promise<boolean> => {
    try {
        const userDoc = await getDoc(doc(db, USERS_COLLECTION, username.toLowerCase()));
        return userDoc.exists();
    } catch (error) {
        console.error('Username check error:', error);
        return false;
    }
};

// Kayıt ol
export const registerUser = async (username: string, password: string): Promise<AuthResult> => {
    try {
        const lowerUsername = username.toLowerCase().trim();

        // Kullanıcı adı kontrolü
        if (lowerUsername.length < 3) {
            return { success: false, error: 'Kullanıcı adı en az 3 karakter olmalı' };
        }

        if (password.length < 4) {
            return { success: false, error: 'Şifre en az 4 karakter olmalı' };
        }

        // Kullanıcı adı var mı kontrol et
        const exists = await checkUsernameExists(lowerUsername);
        if (exists) {
            return { success: false, error: 'Bu kullanıcı adı zaten kullanılıyor' };
        }

        // Yeni kullanıcı oluştur
        const role = lowerUsername === 'admin' ? 'admin' : 'user';

        const newUser: User = {
            username: lowerUsername,
            password: password,
            registeredAt: new Date().toISOString(),
            role: role,
            title: 'Gelin Hanım', // Default title
            friendCode: generateFriendCode()
        };

        // Firestore'a kaydet
        await setDoc(doc(db, USERS_COLLECTION, lowerUsername), newUser);

        // Mevcut kullanıcı olarak kaydet
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

        return { success: true, user: newUser };
    } catch (error: any) {
        console.error('Register error:', error);
        const errorMessage = error?.code === 'permission-denied'
            ? 'Firebase izin hatası. Firestore kurallarını kontrol edin.'
            : error?.message || 'Kayıt sırasında bir hata oluştu';
        return { success: false, error: errorMessage };
    }
};

// Yönetici tarafından kullanıcı oluşturma (Mevcut oturumu bozmaz)
export const adminCreateUser = async (username: string, password: string, role: 'user' | 'admin' = 'user', title: string = 'Gelin Hanım'): Promise<AuthResult> => {
    try {
        const lowerUsername = username.toLowerCase().trim();

        if (lowerUsername.length < 3) return { success: false, error: 'En az 3 karakter olmalı' };
        if (password.length < 4) return { success: false, error: 'Şifre en az 4 karakter olmalı' };

        const exists = await checkUsernameExists(lowerUsername);
        if (exists) return { success: false, error: 'Bu kullanıcı adı zaten kullanılıyor' };

        const newUser: User = {
            username: lowerUsername,
            password: password,
            registeredAt: new Date().toISOString(),
            role: role,
            title: title,
            friendCode: generateFriendCode()
        };

        await setDoc(doc(db, USERS_COLLECTION, lowerUsername), newUser);

        return { success: true, user: newUser };
    } catch (error: any) {
        console.error('Admin Create User error:', error);
        return { success: false, error: error?.message || 'Kullanıcı oluşturulamadı' };
    }
};

// Giriş yap
export const loginUser = async (username: string, password: string): Promise<AuthResult> => {
    try {
        const lowerUsername = username.toLowerCase().trim();

        // Kullanıcıyı bul
        const userDoc = await getDoc(doc(db, USERS_COLLECTION, lowerUsername));

        if (!userDoc.exists()) {
            return { success: false, error: 'Kullanıcı bulunamadı' };
        }

        const userData = userDoc.data() as User;

        // Şifre kontrolü
        if (userData.password !== password) {
            return { success: false, error: 'Şifre hatalı' };
        }

        // Mevcut kullanıcı olarak kaydet
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));

        // BACKWARD COMPATIBILITY: Eğer eski kullanıcıda kod yoksa oluştur ve kaydet
        if (!userData.friendCode) {
            const newCode = generateFriendCode();
            await updateUserDetails(lowerUsername, { friendCode: newCode });
            userData.friendCode = newCode;
            await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
        }

        return { success: true, user: userData };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Giriş sırasında bir hata oluştu' };
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

// Mevcut kullanıcıyı yerel olarak güncelle (Şifre değişimi vb. için)
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
        const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
        const users: User[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data() as User;
            data.id = doc.id; // Correctly capture the doc ID
            // Ensure username exists (fallback to doc ID)
            if (!data.username) {
                data.username = doc.id;
            }
            users.push(data);
        });
        return users;
    } catch (error) {
        console.error('Get all users error:', error);
        return [];
    }
};

// Kullanıcı rolünü güncelle
export const updateUserRole = async (username: string, newRole: 'user' | 'admin'): Promise<void> => {
    try {
        await setDoc(doc(db, USERS_COLLECTION, username), { role: newRole }, { merge: true });
    } catch (error) {
        console.error('Update role error:', error);
        throw error;
    }
};

// Kullanıcı şifresini güncelle (Admin için)
export const adminResetPassword = async (username: string, newPassword: string): Promise<void> => {
    try {
        await setDoc(doc(db, USERS_COLLECTION, username), { password: newPassword }, { merge: true });
    } catch (error) {
        console.error('Reset password error:', error);
        throw error;
    }
};

// Kullanıcı unvanını güncelle (Admin için)
export const updateUserTitle = async (username: string, newTitle: string): Promise<void> => {
    try {
        await setDoc(doc(db, USERS_COLLECTION, username), { title: newTitle }, { merge: true });
    } catch (error) {
        console.error('Update title error:', error);
        throw error;
    }
};

// Admin Kullanıcısını Sıfırla ve Temizle
export const resetAdminEnvironment = async (): Promise<void> => {
    try {
        console.log('Starting Admin Reset...');

        // 1. Tüm kullanıcıları al
        const allUsers = await getAllUsers();

        // 2. 'admin' kullanıcı adını içerenleri (ama tam admin olmayanları vs) temizle
        const usersToDelete = allUsers.filter(u => u.username.toLowerCase().includes('admin'));

        for (const u of usersToDelete) {
            console.log('Deleting existing admin/duplicate:', u.username);
            await deleteDoc(doc(db, USERS_COLLECTION, u.username));
        }

        // 3. 'admin' kullanıcısını FORCE create
        const adminUser: User = {
            username: 'admin',
            password: 'alaturka01',
            registeredAt: new Date().toISOString(),
            role: 'admin',
            title: 'Yönetici'
        };

        // deleteDoc sonrası hemen setDoc yapıyoruz, await'ler önemli
        await setDoc(doc(db, USERS_COLLECTION, 'admin'), adminUser);
        console.log('Admin user reset successfully: admin / alaturka01');

    } catch (error) {
        console.error('Reset admin error:', error);
        throw error;
    }
};

// Kullanıcı adını değiştir (Doc ID değişimi gerektirir + VERİ GÖÇ)
export const changeUsername = async (currentDocId: string, newUsername: string): Promise<boolean> => {
    try {
        const docId = currentDocId; // Use exact ID
        const lowerNew = newUsername.toLowerCase().trim();

        if (docId === lowerNew) return true;

        // 1. Yeni isim müsait mi?
        const exists = await checkUsernameExists(lowerNew);
        if (exists) {
            throw new Error('Bu kullanıcı adı zaten kullanımda');
        }

        // 2. Eski veriyi al (Direct ID lookup)
        const oldDocRef = doc(db, USERS_COLLECTION, docId);
        const oldDoc = await getDoc(oldDocRef);

        if (!oldDoc.exists()) {
            throw new Error(`Kullanıcı (ID: ${docId}) bulunamadı`);
        }

        const userData = oldDoc.data() as User;

        // 3. Yeni veriyi hazırla (username güncelle - Orijinal casing ile)
        const newUser: User = {
            ...userData,
            username: newUsername.trim() // Preserve casing for display
        };

        // 4. Yeni doc oluştur (ID hep lowercase)
        await setDoc(doc(db, USERS_COLLECTION, lowerNew), newUser);

        // 5. VERİ GÖÇ: Kullanıcının çeyiz verilerini taşı (groups sub-collection)
        try {
            const oldGroupsRef = collection(db, `${USERS_COLLECTION}/${docId}/groups`);
            const groupsSnap = await getDocs(oldGroupsRef);

            for (const groupDoc of groupsSnap.docs) {
                const groupData = groupDoc.data();
                const newGroupRef = doc(db, `${USERS_COLLECTION}/${lowerNew}/groups`, groupDoc.id);
                await setDoc(newGroupRef, groupData);

                // Categories
                const oldCatsRef = collection(db, `${USERS_COLLECTION}/${docId}/groups/${groupDoc.id}/categories`);
                const catsSnap = await getDocs(oldCatsRef);

                for (const catDoc of catsSnap.docs) {
                    const catData = catDoc.data();
                    const newCatRef = doc(db, `${USERS_COLLECTION}/${lowerNew}/groups/${groupDoc.id}/categories`, catDoc.id);
                    await setDoc(newCatRef, catData);

                    // Products
                    const oldProdsRef = collection(db, `${USERS_COLLECTION}/${docId}/groups/${groupDoc.id}/categories/${catDoc.id}/products`);
                    const prodsSnap = await getDocs(oldProdsRef);

                    for (const prodDoc of prodsSnap.docs) {
                        const prodData = prodDoc.data();
                        const newProdRef = doc(db, `${USERS_COLLECTION}/${lowerNew}/groups/${groupDoc.id}/categories/${catDoc.id}/products`, prodDoc.id);
                        await setDoc(newProdRef, prodData);

                        // Delete old product
                        await deleteDoc(prodDoc.ref);
                    }

                    // Delete old category
                    await deleteDoc(catDoc.ref);
                }

                // Delete old group
                await deleteDoc(groupDoc.ref);
            }
        } catch (migrationError) {
            console.warn('Data migration partial failure:', migrationError);
            // Continue anyway - user doc is already migrated
        }

        // 6. Eski user doc sil
        await deleteDoc(oldDocRef);

        return true;
    } catch (error) {
        console.error('Username change error:', error);
        throw error;
    }
};

// Genel kullanıcı güncelleme (Password, Role, Title vb.)
export const updateUserDetails = async (docId: string, updates: Partial<User>): Promise<void> => {
    try {
        await setDoc(doc(db, USERS_COLLECTION, docId), updates, { merge: true });
    } catch (error) {
        console.error('Update details error:', error);
        throw error;
    }
};

// Kullanıcı sil
export const deleteUser = async (docId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, USERS_COLLECTION, docId));
    } catch (error) {
        console.error('Delete user error:', error);
        throw error;
    }
};
