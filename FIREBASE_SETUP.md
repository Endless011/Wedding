# Firebase Kurulum Rehberi

## 1. Firebase Console'da Proje Oluşturma

1. **[Firebase Console](https://console.firebase.google.com/)** adresine gidin
2. **"Proje Oluştur"** butonuna tıklayın
3. Proje adı: `ceyiz-takip` (veya istediğiniz bir ad)
4. Google Analytics gerekli değil, kapatabilirsiniz
5. **"Proje Oluştur"** tıklayın

---

## 2. Web Uygulaması Ekleme

1. Proje ana sayfasında **Web simgesi (</>)** tıklayın
2. Uygulama adı: `Çeyiz Takip Web`
3. Firebase Hosting **işaretlemeyin**
4. **"Uygulamayı kaydet"** tıklayın

---

## 3. Firestore Database Oluşturma

1. Sol menüden **"Build" > "Firestore Database"** tıklayın
2. **"Veritabanı oluştur"** tıklayın
3. **"Test modunda başlat"** seçin (geliştirme için)
4. Konum: **"eur3 (europe-west)"** seçin (Türkiye'ye yakın)
5. **"Etkinleştir"** tıklayın

---

## 4. Config Değerlerini Kopyalama

1. Sol menüden **"Proje Ayarları"** (dişli simgesi) tıklayın
2. Aşağı kaydırın, **"Uygulamalarınız"** bölümünde Web uygulamanızı bulun
3. **firebaseConfig** değerlerini kopyalayın:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "ceyiz-takip.firebaseapp.com",
  projectId: "ceyiz-takip",
  storageBucket: "ceyiz-takip.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## 5. Uygulamaya Ekleme

`src/config/firebase.ts` dosyasını açın ve kendi değerlerinizi yapıştırın:

```typescript
const firebaseConfig = {
    apiKey: "BURAYA_KENDI_API_KEY",
    authDomain: "PROJE_ID.firebaseapp.com",
    projectId: "PROJE_ID",
    storageBucket: "PROJE_ID.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};
```

---

## 6. Firestore Kuralları (Güvenlik)

Firestore > Rules sekmesinde şu kuralları yapıştırın:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /categories/{categoryId} {
      allow read, write: if true;
      match /subcategories/{subcategoryId} {
        allow read, write: if true;
      }
    }
  }
}
```

> ⚠️ Bu kurallar test içindir. Üretimde daha güvenli kurallar yazılmalı.

---

## 7. Test Etme

1. Uygulamayı yeniden başlatın: `npx expo start`
2. Bir kategori ekleyin
3. Başka bir cihazdan açın - aynı kategori görünmeli!

---

## Tamamlandı! 🎉

Firebase kurulumu tamamlandığında uygulama otomatik olarak tüm kullanıcılar arasında senkronize olacaktır.
