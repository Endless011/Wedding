import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    User,
    loginUser,
    registerUser,
    logoutUser,
    getCurrentUser,
    AuthResult,
    updateUserDetails,
    updateLocalUser
} from '../services/authService';
import { updateUserWeddingDate, getUserWeddingDate } from '../services/firebaseService';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<AuthResult>;
    register: (username: string, password: string) => Promise<AuthResult>;
    logout: () => Promise<void>;
    weddingDate: string | null;
    saveWeddingDate: (date: string) => Promise<void>;
    updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Uygulama başladığında mevcut kullanıcıyı kontrol et
    useEffect(() => {
        checkCurrentUser();
    }, []);

    const checkCurrentUser = async () => {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error('Check current user error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username: string, password: string): Promise<AuthResult> => {
        const result = await loginUser(username, password);
        if (result.success && result.user) {
            setUser(result.user);
        }
        return result;
    };

    const register = async (username: string, password: string): Promise<AuthResult> => {
        const result = await registerUser(username, password);
        if (result.success && result.user) {
            setUser(result.user);
        }
        return result;
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
    };

    const [weddingDate, setWeddingDate] = useState<string | null>(null);

    useEffect(() => {
        if (user?.username) {
            getUserWeddingDate(user.username).then(date => {
                if (date) setWeddingDate(date);
            });
        }
    }, [user]);

    const saveWeddingDate = async (date: string) => {
        if (user?.username) {
            await updateUserWeddingDate(user.username, date);
            setWeddingDate(date);
        }
    };

    const updatePassword = async (newPassword: string) => {
        if (user?.username) {
            const lowerUsername = user.username.toLowerCase();
            await updateUserDetails(lowerUsername, { password: newPassword });
            await updateLocalUser({ password: newPassword });
            setUser(prev => prev ? { ...prev, password: newPassword } : null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
                weddingDate,
                saveWeddingDate,
                updatePassword
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
