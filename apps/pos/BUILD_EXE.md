# PIXPOS Kasa - Windows EXE Build Rehberi

## Gereksinimler

1. **Node.js 18+**
2. **pnpm** (paket yöneticisi)
3. **Windows için:** Wine (macOS/Linux'ta cross-compile için)

## Hızlı Build

### Windows'ta Build

```bash
cd apps/pos

# Bağımlılıkları yükle
pnpm install

# Windows EXE oluştur
pnpm electron:build:win

# Çıktı: electron-dist/PIXPOS-Kasa-1.0.0-Setup.exe
```

### macOS'ta Windows EXE Build (Cross-compile)

```bash
# Wine yükle (gerekli)
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

## Geliştirme Modu

```bash
# 1. Web uygulamasını başlat
pnpm dev --filter=@mega-pos/pos

# 2. Başka terminalde Electron'u başlat
cd apps/pos
pnpm electron:dev
```

## Özellikler

- ✅ Windows .exe installer (NSIS)
- ✅ Windows portable .exe
- ✅ macOS .dmg
- ✅ Linux AppImage
- ✅ Müşteri ekranı desteği (ikinci monitör)
- ✅ Tam ekran modu (F11)
- ✅ Otomatik güncelleme altyapısı

## Müşteri Ekranı

Uygulama ikinci monitör algıladığında otomatik olarak müşteri ekranını açabilir:

1. İkinci monitörü bağla
2. Menü > PIXPOS > Müşteri Ekranı Aç (Ctrl+D)
3. Müşteri ekranı ikinci monitörde tam ekran açılır

## Konfigürasyon

### API URL Değiştirme

Varsayılan: `https://api.pixpos.cloud/api`

Farklı API kullanmak için:

**Windows:**
```batch
set PIXPOS_API_URL=https://your-api.com/api
set PIXPOS_WEB_URL=https://your-pos.com/pos
PIXPOS-Kasa.exe
```

**macOS/Linux:**
```bash
PIXPOS_API_URL=https://your-api.com/api PIXPOS_WEB_URL=https://your-pos.com/pos ./PIXPOS-Kasa
```

## İkon Oluşturma

Windows için `.ico`, macOS için `.icns` dosyası gerekli:

```bash
# PNG'den ICO oluştur (ImageMagick ile)
convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico

# PNG'den ICNS oluştur (macOS)
mkdir icon.iconset
sips -z 16 16 icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32 icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32 icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64 icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128 icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256 icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256 icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512 icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512 icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset
```

## Sorun Giderme

### Build hatası: electron not found
```bash
pnpm install
```

### Windows build macOS'ta çalışmıyor
```bash
# Wine yükle
brew install --cask wine-stable
```

### İkon bulunamadı hatası
`electron/resources/` klasörüne `icon.ico` ve `icon.icns` dosyalarını ekleyin.

## Dosya Yapısı

```
apps/pos/
├── electron/
│   ├── main.js          # Electron ana process
│   ├── preload.js       # Preload script
│   └── resources/
│       ├── icon.ico     # Windows ikonu
│       ├── icon.icns    # macOS ikonu
│       └── icons/       # Linux ikonları
├── dist/                # Web build çıktısı
├── electron-dist/       # Electron build çıktısı
│   ├── PIXPOS-Kasa-1.0.0-Setup.exe
│   ├── PIXPOS-Kasa-1.0.0-portable.exe
│   └── ...
└── package.json
```
