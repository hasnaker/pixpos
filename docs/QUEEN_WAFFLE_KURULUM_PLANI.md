# Queen Waffle - Uzaktan Kurulum Planı

**Tarih:** 17 Ocak 2026  
**Müşteri:** Queen Waffle & Coffee, Kayseri  
**Durum:** Canlıya alma bekleniyor

---

## ✅ Sistem Durumu

| Servis | URL | Durum |
|--------|-----|-------|
| POS | https://queen.pixpos.cloud/pos | ✅ Çalışıyor (Web bloklu, EXE hazır) |
| Boss Panel | https://queen.pixpos.cloud/boss | ✅ Çalışıyor |
| Garson Tablet | https://queen.pixpos.cloud/waiter | ✅ Çalışıyor (Web bloklu, APK hazır) |
| Mutfak Ekranı | https://queen.pixpos.cloud/kitchen | ✅ Çalışıyor |
| Müşteri Ekranı | https://queen.pixpos.cloud/pos/display | ✅ Çalışıyor |
| QR Menü | https://queen.pixpos.site | ✅ Çalışıyor |
| API | https://api.pixpos.cloud | ✅ Çalışıyor |

### Mevcut Veri Durumu (API'de)
| Veri | Miktar | Durum |
|------|--------|-------|
| Kategoriler | 19 | ✅ Hazır |
| Ürünler | 140 | ✅ Hazır |
| Masalar | 41 | ✅ Hazır |
| Bölgeler | 3 | ✅ Hazır |
| Yazıcılar | 3 | ⚠️ Aynı IP (düzeltilmeli) |

### Build Durumu
| Artifact | Boyut | İndirme |
|----------|-------|---------|
| Windows EXE | ~122 MB | [GitHub Actions](https://github.com/hasnaker/pixpos/actions) |
| Android APK | ~3.5 MB | [GitHub Actions](https://github.com/hasnaker/pixpos/actions) |

---

## 🎯 Kurulum Öncesi Checklist

### Müşteriden Alınacak Bilgiler

| Bilgi | Durum | Not |
|-------|-------|-----|
| İşletme adı | ✅ | Queen Waffle & Coffee |
| Logo (PNG, şeffaf arka plan) | ⬜ | Fiş ve QR menü için |
| Adres | ⬜ | Fiş için |
| Telefon | ⬜ | Fiş için |
| Vergi No | ⬜ | Fiş için |
| Çalışma saatleri | ⬜ | QR menü için |
| Sosyal medya linkleri | ⬜ | QR menü için |

### Menü Bilgileri

| Bilgi | Durum | Not |
|-------|-------|-----|
| Kategori listesi | ✅ | 19 kategori girildi |
| Ürün listesi (isim + fiyat) | ✅ | 140 ürün girildi |
| Ürün görselleri | ⬜ | Opsiyonel ama önerilir |
| Ürün açıklamaları | ⬜ | QR menü için |

### Fiziksel Düzen

| Bilgi | Durum | Not |
|-------|-------|-----|
| Bölge sayısı | ✅ | 3 bölge (Salon, Teras, Bahçe?) |
| Her bölgedeki masa sayısı | ✅ | Toplam 41 masa |
| Masa numaralandırma | ✅ | Girildi |

### Donanım

| Cihaz | Durum | Not |
|-------|-------|-----|
| Kasa bilgisayarı | ⬜ | Windows PC/Laptop? |
| Garson tableti | ⬜ | Android tablet? |
| Mutfak ekranı | ⬜ | TV/Monitor? |
| Müşteri ekranı | ⬜ | İkinci monitör? |
| Yazıcı | ⚠️ | 3 yazıcı tanımlı ama hepsi aynı IP |
| İnternet | ⬜ | WiFi stabil mi? |

### Yazıcı IP Düzeltmesi Gerekli
Mevcut durumda 3 yazıcı tanımlı ama hepsi `192.168.1.188` IP'sine sahip.
Müşteriden gerçek yazıcı IP'lerini almak gerekiyor:
- Kasa yazıcısı IP: ?
- Mutfak yazıcısı IP: ?
- Bar yazıcısı IP: ?

---

## 📋 Kurulum Adımları

### Aşama 1: Veri Girişi (Boss Panel) - ✅ TAMAMLANDI

**URL:** https://queen.pixpos.cloud/boss

Veri girişi tamamlandı:
- ✅ 19 Kategori oluşturuldu
- ✅ 140 Ürün eklendi
- ✅ 3 Bölge oluşturuldu
- ✅ 41 Masa eklendi

**Kalan işler:**
- ⬜ İşletme bilgileri (logo, adres, telefon, vergi no)
- ⬜ Fiş ayarları
- ⬜ Yazıcı IP'leri düzeltilmeli

---

### Aşama 2: Kasa Kurulumu (POS) - 15 dk

**Müşterinin kasasında yapılacaklar:**

1. **Windows EXE İndir** ✅
   - GitHub Actions'tan indir: https://github.com/hasnaker/pixpos/actions
   - "Build POS EXE" workflow → Artifacts → PIXPOS-Windows
   - EXE boyutu: ~122 MB
   - Kurulum: PIXPOS-Kasa-1.0.0-Setup.exe çalıştır

2. **Alternatif: Chrome'da Aç**
   ```
   https://queen.pixpos.cloud/pos
   ```
   - Chrome menü > "Kısayol oluştur"
   - "Pencere olarak aç" seç
   - Masaüstüne ekle

3. **Tam Ekran Ayarı**
   - F11 ile tam ekran
   - Veya Chrome ayarlarından

4. **Müşteri Ekranı (İkinci Monitör)**
   ```
   https://queen.pixpos.cloud/pos/display
   ```
   - İkinci monitörde aç
   - Tam ekran yap

5. **Yazıcı Bağlantısı**
   - Yazıcı USB ile bağlı mı kontrol
   - Test fişi yazdır

---

### Aşama 3: Garson Tablet Kurulumu - 10 dk

**Android Tablet:**

1. **APK İndir** ✅
   - GitHub Actions'tan indir: https://github.com/hasnaker/pixpos/actions
   - "Build Waiter APK" workflow → Artifacts → PIXPOS-Waiter-APK
   - APK boyutu: ~3.5 MB

2. **Kurulum**
   - "Bilinmeyen kaynaklardan yükle" izni ver
   - APK'yı kur

3. **Giriş**
   - Uygulama açılınca otomatik bağlanır (queen.pixpos.cloud/waiter)
   - Test siparişi ver

**Alternatif (Web):**
```
https://queen.pixpos.cloud/waiter
```
- Chrome'da aç
- Ana ekrana ekle

---

### Aşama 4: Mutfak Ekranı Kurulumu - 5 dk

**TV/Monitor:**

1. **Chrome'da Aç**
   ```
   https://queen.pixpos.cloud/kitchen
   ```

2. **Tam Ekran**
   - F11 ile tam ekran

3. **Ses Ayarı**
   - Yeni sipariş sesi açık mı kontrol

---

### Aşama 5: QR Menü Kurulumu - 10 dk

1. **QR Kod Oluştur**
   ```
   URL: https://queen.pixpos.site
   ```
   - QR kod generator ile oluştur
   - Veya Boss Panel'den indir

2. **QR Kodları Yazdır**
   - Her masa için ayrı QR (opsiyonel)
   - Veya tek genel QR

3. **Masalara Yerleştir**
   - Masa standı veya yapıştırma

---

## 🧪 Test Senaryoları

### Test 1: Temel Sipariş Akışı
1. ⬜ POS'tan masa seç
2. ⬜ Ürün ekle
3. ⬜ Mutfağa gönder
4. ⬜ Mutfak ekranında görünsün
5. ⬜ Mutfakta "Hazır" işaretle
6. ⬜ POS'ta bildirim gelsin
7. ⬜ Ödeme al
8. ⬜ Fiş yazdır

### Test 2: Garson Tablet
1. ⬜ Tablet'ten masa seç
2. ⬜ Sipariş al
3. ⬜ Mutfağa gönder
4. ⬜ POS'ta görünsün

### Test 3: QR Menü
1. ⬜ QR kodu tara
2. ⬜ Menü açılsın
3. ⬜ Kategoriler görünsün
4. ⬜ Ürün detayı açılsın

### Test 4: Müşteri Ekranı
1. ⬜ Sipariş eklenince görünsün
2. ⬜ Toplam güncellensin

---

## 🔧 Sorun Giderme

### Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| Sayfa açılmıyor | İnternet bağlantısını kontrol et |
| Yazıcı çalışmıyor | USB bağlantısını kontrol et, sürücü kur |
| Mutfak ekranı güncellenmiyor | Sayfayı yenile (F5) |
| Ses gelmiyor | Tarayıcı ses izni ver |
| Tablet bağlanmıyor | WiFi aynı ağda mı kontrol et |

### Destek İletişimi

| Kanal | Bilgi |
|-------|-------|
| WhatsApp | [Numara] |
| Telefon | [Numara] |
| E-posta | [E-posta] |

---

## 📱 Uzaktan Bağlantı Seçenekleri

### AnyDesk (Önerilen)
1. Müşteri AnyDesk indirir: https://anydesk.com
2. AnyDesk ID'sini paylaşır
3. Biz bağlanıp kurulumu yaparız

### TeamViewer
1. Müşteri TeamViewer indirir
2. ID ve şifreyi paylaşır
3. Biz bağlanırız

### Chrome Remote Desktop
1. Müşteri Chrome eklentisini kurar
2. Erişim kodu paylaşır
3. Biz bağlanırız

---

## ⏱️ Tahmini Süre

| Aşama | Süre | Durum |
|-------|------|-------|
| Veri girişi (Boss) | 30 dk | ✅ Tamamlandı |
| Kasa kurulumu (EXE) | 15 dk | ⬜ Bekliyor |
| Tablet kurulumu (APK) | 10 dk | ⬜ Bekliyor |
| Mutfak ekranı | 5 dk | ⬜ Bekliyor |
| QR menü | 10 dk | ⬜ Bekliyor |
| Test | 15 dk | ⬜ Bekliyor |
| **KALAN TOPLAM** | **~55 dk** | |

---

## 📞 Kurulum Günü Akışı

### Hazırlık (Kurulumdan Önce) - ✅ TAMAMLANDI
1. ✅ Müşteriden menü bilgilerini al
2. ✅ Boss Panel'de kategorileri oluştur (19 kategori)
3. ✅ Ürünleri ekle (140 ürün)
4. ✅ Bölge ve masaları ayarla (3 bölge, 41 masa)
5. ✅ EXE ve APK build'leri hazır

### Müşteriden Alınacaklar (Kurulum Öncesi)
1. ⬜ Logo (PNG, şeffaf arka plan)
2. ⬜ Adres, telefon, vergi no
3. ⬜ Yazıcı IP adresleri (kasa, mutfak, bar)
4. ⬜ Donanım bilgisi (PC, tablet, TV)

### Uzaktan Bağlantı (Müşteri ile)
1. ⬜ AnyDesk/TeamViewer ile bağlan
2. ⬜ EXE'yi indir ve kur (veya Chrome kısayolu)
3. ⬜ Yazıcı IP'lerini düzelt
4. ⬜ Müşteri ekranı ayarla
5. ⬜ APK'yı tablet'e kur
6. ⬜ Mutfak ekranını aç
7. ⬜ Test siparişi yap
8. ⬜ Müşteriyi eğit (10-15 dk)

### Sonrası
1. ⬜ WhatsApp destek grubu oluştur
2. ⬜ İlk gün takip et
3. ⬜ Sorunları not al

---

## 📝 Eğitim Konuları

### Kasiyer Eğitimi (10 dk)
- Masa seçme
- Ürün ekleme
- Sipariş gönderme
- Ödeme alma
- Fiş yazdırma
- Masa taşıma
- Hesap bölme

### Garson Eğitimi (5 dk)
- Tablet kullanımı
- Masa seçme
- Sipariş alma
- Mutfağa gönderme

### Yönetici Eğitimi (10 dk)
- Boss Panel'e giriş
- Ürün ekleme/düzenleme
- Fiyat değiştirme
- Rapor görüntüleme

---

**Hazırlayan:** Kiro  
**Tarih:** 17 Ocak 2026
