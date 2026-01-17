# PIXPOS Garson - Android APK Build Rehberi

## Gereksinimler

1. **Android Studio** (önerilen) veya **Android SDK Command Line Tools**
2. **Java JDK 17+**

## Hızlı Build (Android Studio ile)

```bash
# 1. Web build yap
cd apps/waiter
pnpm build

# 2. Capacitor sync
pnpm exec cap sync android

# 3. Android projesini Android Studio'da aç
pnpm exec cap open android

# 4. Android Studio'da:
#    - Build > Build Bundle(s) / APK(s) > Build APK(s)
#    - APK: android/app/build/outputs/apk/debug/app-debug.apk
```

## Terminal ile Build

```bash
# 1. ANDROID_HOME ayarla (macOS için)
export ANDROID_HOME=~/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# 2. Web build + sync
cd apps/waiter
pnpm build
pnpm exec cap sync android

# 3. Android build
cd android
./gradlew assembleDebug

# 4. APK konumu
# android/app/build/outputs/apk/debug/app-debug.apk
```

## Release APK (İmzalı)

```bash
# 1. Keystore oluştur (bir kez)
keytool -genkey -v -keystore pixpos-waiter.keystore -alias pixpos -keyalg RSA -keysize 2048 -validity 10000

# 2. android/app/build.gradle'a ekle:
android {
    signingConfigs {
        release {
            storeFile file('pixpos-waiter.keystore')
            storePassword 'YOUR_PASSWORD'
            keyAlias 'pixpos'
            keyPassword 'YOUR_PASSWORD'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

# 3. Release build
./gradlew assembleRelease

# 4. APK konumu
# android/app/build/outputs/apk/release/app-release.apk
```

## Özellikler

- ✅ Dik (Portrait) ve Yatay (Landscape) mod desteği
- ✅ Safe area desteği (notch, home bar)
- ✅ Dark mode tasarım
- ✅ Responsive grid layout
- ✅ Offline-first PWA altyapısı
- ✅ WebSocket real-time güncellemeler

## API Konfigürasyonu

Varsayılan API: `https://api.pixpos.cloud/api`

Farklı API kullanmak için build öncesi:
```bash
VITE_API_URL=https://your-api.com/api pnpm build --filter=@mega-pos/waiter
pnpm exec cap sync android
```

## Test

1. APK'yı Android cihaza yükle
2. Ayarlar > Güvenlik > Bilinmeyen kaynaklar'ı aç
3. APK'yı aç ve yükle
4. Uygulamayı başlat

## Sorun Giderme

### Build hatası: SDK not found
```bash
# local.properties dosyası oluştur
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
```

### Gradle hatası
```bash
# Gradle cache temizle
cd android
./gradlew clean
./gradlew assembleDebug
```

### Proguard hatası
AGP 8.7.3 ve Gradle 8.9 kullanılıyor. Eğer hata alırsanız:
```bash
# Gradle wrapper güncelle
cd android
./gradlew wrapper --gradle-version=8.9
```

## Versiyon Bilgileri

- Android Gradle Plugin: 8.7.3
- Gradle: 8.9
- Capacitor: 8.0.1
- Min SDK: 22
- Target SDK: 35
