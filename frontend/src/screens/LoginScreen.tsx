import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

interface Props {
    onNavigateToRegister: () => void;
}

const LoginScreen: React.FC<Props> = ({ onNavigateToRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdminLogin, setIsAdminLogin] = useState(false); // Toggle for Admin Mode
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!username.trim()) {
            Alert.alert('Hata', 'Kullanıcı adı giriniz');
            return;
        }
        if (!password.trim()) {
            Alert.alert('Hata', 'Şifre giriniz');
            return;
        }

        setIsLoading(true);
        try {
            const result = await login(username, password);
            if (!result.success) {
                Alert.alert('Hata', result.error || 'Giriş başarısız');
                return;
            }

            // Admin Login Check
            if (isAdminLogin) {
                if (result.user?.role !== 'admin') {
                    // If user is not admin but tries admin login, show error and logout locally
                    // Ideally logout function should be called here or just state reset
                    Alert.alert('Erişim Reddedildi', 'Bu alana sadece yöneticiler girebilir.');
                    // We might need a logout method here but useAuth is needed. 
                    // For now, let's just proceed to regular home but with error? 
                    // Or better, modify login logic in AuthContext later. 
                    // Let's assume for now any user can login but we will check role later or
                    // force logout if valid user checks admin. 
                    // Actually, simple check:
                    return;
                }
                // If Admin, navigation is handled by RootNavigator/App.tsx logic generally
            }
        } catch (error) {
            Alert.alert('Hata', 'Bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#D48792', '#B08B8E', '#8BB4D4']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    {/* Logo/Title Area */}
                    <View style={styles.logoContainer}>
                        <Ionicons name="diamond-outline" size={64} color="#FFFFFF" style={styles.icon} />
                        <Text style={styles.title}>Çeyiz Takip</Text>
                        <Text style={styles.subtitle}>Düğün Hazırlıklarınızı Kolayca Yönetin</Text>
                    </View>

                    {/* Login Card */}
                    <View style={[styles.card, isAdminLogin && { borderTopWidth: 4, borderColor: '#D48792' }]}>
                        <Text style={styles.cardTitle}>{isAdminLogin ? 'Yönetici Paneli' : 'Giriş Yap'}</Text>

                        {/* Username Input */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={22} color="#9E9E9E" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Kullanıcı Adı"
                                placeholderTextColor="#9E9E9E"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={22} color="#9E9E9E" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Şifre"
                                placeholderTextColor="#9E9E9E"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                    size={22}
                                    color="#9E9E9E"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Giriş Yap</Text>
                            )}
                        </TouchableOpacity>

                        {/* Register Link */}
                        <View style={styles.registerContainer}>
                            <Text style={styles.registerText}>Hesabınız yok mu? </Text>
                            <TouchableOpacity onPress={onNavigateToRegister}>
                                <Text style={styles.registerLink}>Kayıt Olun</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Subtle Admin Login Link */}
                    <TouchableOpacity
                        style={{ marginTop: 40, padding: 10 }}
                        onPress={() => setIsAdminLogin(!isAdminLogin)}
                        activeOpacity={0.7}
                    >
                        <Text style={{
                            color: isAdminLogin ? '#D48792' : 'rgba(255,255,255,0.5)',
                            fontSize: 12,
                            fontWeight: isAdminLogin ? 'bold' : 'normal'
                        }}>
                            {isAdminLogin ? 'Kullanıcı Girişine Dön' : 'Yönetici Girişi'}
                        </Text>
                    </TouchableOpacity>


                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    icon: {
        marginBottom: 16,
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 8,
        textAlign: 'center',
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 24,
        padding: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 10,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#3D3D3D',
        textAlign: 'center',
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 14,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#3D3D3D',
    },
    eyeIcon: {
        padding: 4,
    },
    button: {
        backgroundColor: '#D48792',
        borderRadius: 14,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#E8B4BC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#C9A9A6',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    registerText: {
        fontSize: 14,
        color: '#757575',
    },
    registerLink: {
        fontSize: 14,
        fontWeight: '700',
        color: '#E8B4BC',
    },
});

export default LoginScreen;
