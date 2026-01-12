// Veri Modeli Tip Tanımları

// 3. Seviye: Ürün (Satın alınan gerçek eşya)
export interface Product {
    id: string;
    name: string; // Örn: "English Home 6 Parça Set"
    brand?: string; // Örn: "English Home"
    price?: number;
    purchasedQuantity: number; // Kaç adet alındı
    notes?: string;
    isPurchased: boolean; // Tamamlandı mı?
}

// 2. Seviye: Kategori (İhtiyaç Kalemi)
export interface Category {
    id: string;
    name: string; // Örn: "Çatal Bıçak Takımı"
    description?: string; // Örn: "Paslanmaz çelik olsun"
    targetQuantity: number; // Hedeflenen toplam adet (Örn: 12)
    products: Product[]; // Bu kategoriye ait satın alınan ürünler
    isCompleted: boolean; // Hedefe ulaşıldı mı?
}

// 1. Seviye: Grup (Ana Başlık)
export interface Group {
    id: string;
    name: string; // Örn: "Mutfak", "Yatak Odası"
    icon: string; // Emoji
    color: string; // Tema Rengi
    categories: Category[]; // Gruba ait kategoriler
}

// Tema Tipi
export type ThemeMode = 'light' | 'dark' | 'system';

// Tema Paleti
export type ThemePalette = 'rose' | 'blue' | 'gold' | 'sage' | 'lavender';

// Navigation Tipleri
export type TabParamList = {
    HomeStack: undefined;
    Budget: undefined;
    Profile: undefined;
};

// Stack Navigation Tipleri (Detay sayfaları için)
export type RootStackParamList = {
    Main: undefined; // Tab Navigator
    GroupDetail: { group: Group };
    CategoryDetail: { category: Category; groupId: string };
};
