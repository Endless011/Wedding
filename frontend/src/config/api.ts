// API Configuration
import { Platform } from 'react-native';

// --- AYARLAR ---
// Render'a yükledikten sonra size verilen URL'i buraya yapıştırın:
const PRODUCTION_API_URL = ''; // Örn: 'https://wedding-planner-backup.onrender.com/api'

// Yerel IP Adresiniz (ipconfig ile aldığınız):
const LOCAL_IP = '192.168.1.37';
// ----------------

const DEV_API_URL = Platform.select({
    android: 'http://10.0.2.2:3000/api',
    ios: 'http://localhost:3000/api',
    default: `http://${LOCAL_IP}:3000/api`,
});

// Eğer PRODUCTION_API_URL doluysa onu kullan, yoksa yerel (DEV) kullan
export const API_URL = PRODUCTION_API_URL ? PRODUCTION_API_URL : DEV_API_URL;

export const headers = {
    'Content-Type': 'application/json',
};
