# Queen Waffle - Build ve Paketleme Rehberi

**Tarih:** 18 Ocak 2026  
**Durum:** Production Ready

---

## 📱 Android APK Build (Garson Tablet)

### Gereksinimler
- Android Studio (Arctic Fox veya üzeri)
- Java JDK 17+
- Android SDK (API 35)

### Hızlı Build

```bash
# 1. Proje kök dizinine git
cd /path/to/Queen-Q

# 2. Web build + Capacitor sync
npm run build --workspace=apps/waiter
npx cap sync android --project=apps/waiter

# 3. Android Studio'da aç
npx cap open android --project=apps/waiter

# 4. Android Studio'da:
#    Build > Build Bundle(s) / APK(s) > Build APK(s)
```

### Terminal ile Build (Android Studio olmadan)

```bash
# ANDROID_HOME ayarla
export ANDROID_HOME=~/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Build
cd apps/waiter
npm run build
npx cap sync android

# Debug APK
cd android
./gradlew assembleDebug

# APK konumu:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK (İmzalı - Play Store için)

```bash
# 1. Keystore oluştur (bir kez)
keytool -genkey -v \
  -keystore queen-waffle.keystore \
  -alias queenwaffle \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# 2. android/app/build.gradle'a signing config ekle
# (Aşağıdaki örneğe bak)

# 3. Release build
cd android
./gradlew assembleRelease

# APK konumu:
# android/app/build/outputs/apk/release/app-release.apk
```

### APK Özellikleri
- ✅ Offline desteği (localStorage cache)
- ✅ PWA altyapısı
- ✅ Portrait & Landscape mod
- ✅ Safe area desteği (notch)
- ✅ Dark mode tasarım
- ✅ 30 saniyede otomatik senkronizasyon
- ✅ WebSocket real-time güncellemeler

---

## 💻 Windows EXE Build (POS Kasa)

### Gereksinimler
- Node.js 18+
- pnpm
- Windows için: Wine (macOS/Linux'ta cross-compile için)

### Windows'ta Build

```bash
cd apps/pos

# Bağımlılıkları yükle
pnpm install

# Windows EXE oluştur
pnpm electron:build:win

# Çıktılar:
# electron-dist/PIXPOS-Kasa-1.0.0-Setup.exe (Installer)
# electron-dist/PIXPOS-Kasa-1.0.0-portable.exe (Portable)
```

### macOS'ta Windows EXE Build

```bash
# Wine yükle
brew install --cask wine-stable

# Build
cd apps/pos
pnpm electron:build:win
```

### macOS App Build

```bash
cd apps/pos
pnpm electron:build:mac

# Çıktı: electron-dist/PIXPOS-Kasa-1.0.0.dmg
```

### Linux Build

```bash
cd apps/pos
pnpm electron:build:linux

# Çıktı: electron-dist/PIXPOS-Kasa-1.0.0.AppImage
```

### EXE Özellikleri
- ✅ Müşteri ekranı desteği (ikinci monitör)
- ✅ Tam ekran modu (F11)
- ✅ Yazıcı keşfi (ağ tarama)
- ✅ ÖKC/Ingenico TCP bağlantısı
- ✅ Otomatik güncelleme altyapısı
- ✅ Offline çalışma (local dist)

---

## 🌐 Web Deployment (Bulut)

### Mevcut URL'ler
- POS: https://queen.pixpos.cloud/pos
- Boss: https://queen.pixpos.cloud/boss
- Waiter: https://queen.pixpos.cloud/waiter
- Kitchen: https://queen.pixpos.cloud/kitchen
- QR Menu: https://queen.pixpos.site

### Offline Desteği

**Waiter (Garson Tablet):**
```typescript
// İnternet kesildiğinde:
// 1. Ürünler ve kategoriler localStorage'dan gelir
// 2. Siparişler queue'da tutulur
// 3. İnternet gelince otomatik sync

import { networkStatus, pendingOrdersQueue } from '@/services/offlineStorage';

// Online/offline durumu dinle
networkStatus.onStatusChange((online) => {
  if (online) {
    // Bekleyen siparişleri gönder
    ordersApi.syncPendingOrders();
  }
});

// Bekleyen sipariş sayısı
const pendingCount = pendingOrdersQueue.getUnsyncedCount();
```

**POS (Electron):**
- Local dist dosyalarından çalışır
- API erişilemezse hata gösterir
- Yazıcı ve ÖKC local ağda çalışır

---

## 🔧 Donanım Yapılandırması

### ÖKC (Ingenico)
```
IP: 192.168.1.116
Port: 4100
Terminal ID: QUEEN001
```

### Yazıcılar
| Yazıcı | IP | Port | Tip |
|--------|-----|------|-----|
| KASA | 192.168.1.106 | 9100 | Fiş |
| WAFFLE | 192.168.1.149 | 9100 | Mutfak |

---

## 📦 Build Boyutları

| Uygulama | Web | APK | EXE |
|----------|-----|-----|-----|
| POS | 877 KB | - | ~80 MB |
| Waiter | 367 KB | ~15 MB | - |
| Boss | 381 KB | - | - |
| Kitchen | 292 KB | - | - |
| QR Menu | 234 KB | - | - |

---

## 🚀 Hızlı Komutlar

```bash
# Tüm uygulamaları build et
npm run build

# Sadece POS build
npm run build --workspace=apps/pos

# Sadece Waiter build
npm run build --workspace=apps/waiter

# Android APK (debug)
cd apps/waiter && npm run android:build

# Windows EXE
cd apps/pos && pnpm electron:build:win

# macOS DMG
cd apps/pos && pnpm electron:build:mac
```

---

## ⚠️ Sorun Giderme

### Android: SDK not found
```bash
echo "sdk.dir=$HOME/Library/Android/sdk" > apps/waiter/android/local.properties
```

### Android: Gradle hatası
```bash
cd apps/waiter/android
./gradlew clean
./gradlew assembleDebug
```

### Electron: electron not found
```bash
cd apps/pos
pnpm install
```

### Windows build macOS'ta çalışmıyor
```bash
brew install --cask wine-stable
```

---

## 📋 Checklist

### APK Release Öncesi
- [ ] Version numarası güncellendi
- [ ] API URL production'a ayarlı
- [ ] Keystore oluşturuldu
- [ ] Release build test edildi
- [ ] Offline mod test edildi

### EXE Release Öncesi
- [ ] Version numarası güncellendi
- [ ] API URL production'a ayarlı
- [ ] İkon dosyaları mevcut (ico, icns)
- [ ] Müşteri ekranı test edildi
- [ ] Yazıcı bağlantısı test edildi
- [ ] ÖKC bağlantısı test edildi

---

**Son Güncelleme:** 18 Ocak 2026
