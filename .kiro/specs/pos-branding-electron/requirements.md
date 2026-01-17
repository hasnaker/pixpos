# PIXPOS - POS Branding & Electron Build Spec

## Özet

POS uygulaması için kurumsal kimlik güncellemesi ve Electron masaüstü uygulaması build süreci.

---

## Tamamlanan Özellikler

### 1. Splash Screen (✅ Tamamlandı)

**User Story:** POS açıldığında kullanıcı, PIXPOS kurumsal kimliğini yansıtan profesyonel bir açılış animasyonu görür.

**Acceptance Criteria:**
1. ✅ THE Splash_Screen SHALL PIXPOS kurumsal SVG logosunu gösterir (400x220px)
2. ✅ THE Splash_Screen SHALL "Bir işletme sistemi." sloganını gösterir
3. ✅ THE Splash_Screen SHALL 3 fazlı animasyon içerir:
   - Faz 1 (0-800ms): Logo görünür (scale + fade)
   - Faz 2 (800-2000ms): Slogan görünür (slide up + fade)
   - Faz 3 (2000-2500ms): Fade out
4. ✅ THE Splash_Screen SHALL loading spinner gösterir
5. ✅ THE Splash_Screen SHALL versiyon bilgisi gösterir ("PIXPOS v1.0 • POS Terminal")
6. ✅ THE Splash_Screen SHALL koyu tema (#0A0A0A) kullanır

**Dosya:** `apps/pos/src/components/SplashScreen.tsx`

---

### 2. Lock Screen Logo Güncellemesi (✅ Tamamlandı)

**User Story:** Kilit ekranında PIXPOS kurumsal logosu görünür.

**Acceptance Criteria:**
1. ✅ THE Lock_Screen SHALL ana ekranda büyük logo gösterir (320x180px)
2. ✅ THE Lock_Screen SHALL PIN ekranında orta boy logo gösterir (200x110px)
3. ✅ THE Lock_Screen SHALL kullanıcı panelinde küçük logo gösterir (140x80px)
4. ✅ THE Logo SHALL kurumsal SVG formatında olur (KURUMSAL KİMLİK/logo-icon.svg kaynak)
5. ✅ THE Lock_Screen SHALL manuel "PIXPOS" yazısı yerine sadece SVG logo kullanır

**Dosya:** `apps/pos/src/pages/LockScreen.tsx`

---

### 3. Customer Display Logo (✅ Tamamlandı)

**User Story:** Müşteri ekranında (ikinci monitör) işletme logosu veya PIXPOS logosu görünür.

**Acceptance Criteria:**
1. ✅ THE Customer_Display SHALL idle durumda logo gösterir (320x180px)
2. ✅ THE Customer_Display SHALL önce tenant/işletme logosunu kontrol eder (settings.logoUrl)
3. ✅ WHEN tenant logosu yoksa, THE System SHALL PIXPOS kurumsal logosunu gösterir
4. ✅ THE Customer_Display SHALL "Hoş Geldiniz" mesajı gösterir
5. ✅ THE Customer_Display SHALL aktif sipariş varken sipariş detaylarını gösterir

**Dosya:** `apps/pos/src/pages/CustomerDisplay.tsx`

---

### 4. Electron Build Yapılandırması (✅ Tamamlandı)

**User Story:** POS uygulaması macOS/Windows/Linux için masaüstü uygulaması olarak paketlenir.

**Acceptance Criteria:**
1. ✅ THE Electron_Config SHALL ES Module uyumlu olur (.cjs uzantısı)
2. ✅ THE Main_Process SHALL production'da local dist dosyalarını yükler
3. ✅ THE Main_Process SHALL development'ta localhost:3003 yükler
4. ✅ THE Customer_Display SHALL ikinci monitörde tam ekran açılır
5. ✅ THE Printer_Discovery SHALL ağdaki yazıcıları tarar (port 9100)
6. ✅ THE Test_Print SHALL ESC/POS protokolü ile test fişi yazdırır
7. ✅ THE Menu SHALL Türkçe menü öğeleri içerir

**Dosyalar:**
- `apps/pos/electron/main.cjs`
- `apps/pos/electron/preload.cjs`
- `apps/pos/package.json`

---

## Build Komutları

### macOS DMG Build
```bash
cd apps/pos
pnpm build
pnpm electron:build:mac
```

**Çıktı:** `apps/pos/electron-dist/PIXPOS-Kasa-1.0.0.dmg`

### Windows Installer Build
```bash
cd apps/pos
pnpm build
pnpm electron:build:win
```

**Çıktı:** `apps/pos/electron-dist/PIXPOS-Kasa-1.0.0-Setup.exe`

---

## Test Senaryoları

### Test 1: Splash Screen
1. DMG'yi aç ve uygulamayı çalıştır
2. PIXPOS logosu animasyonlu şekilde görünmeli
3. "Bir işletme sistemi." sloganı görünmeli
4. 2.5 saniye sonra kilit ekranına geçmeli

### Test 2: Lock Screen
1. Kilit ekranında büyük PIXPOS logosu görünmeli
2. Kullanıcı seçince PIN ekranında orta boy logo görünmeli
3. Kullanıcı panelinde küçük logo görünmeli

### Test 3: Customer Display
1. Menüden "Müşteri Ekranı Aç" (Cmd+D) seç
2. İkinci monitör varsa tam ekran açılmalı
3. PIXPOS logosu ve "Hoş Geldiniz" görünmeli

### Test 4: Yazıcı Ayarları
1. Ayarlar > Yazıcılar'a git
2. "Yazıcı Tara" ile ağdaki yazıcıları bul
3. "Test Yazdır" ile test fişi çıkar

---

## Bilinen Sorunlar

1. **Socket import warning:** CustomerDisplay.tsx'te `Socket` tipi import edilmiş ama kullanılmıyor (minor)

---

## Sonraki Adımlar

- [ ] Windows build test edilecek
- [ ] Linux AppImage build test edilecek
- [ ] Auto-update mekanizması eklenecek
- [ ] Code signing (macOS notarization, Windows signing)
