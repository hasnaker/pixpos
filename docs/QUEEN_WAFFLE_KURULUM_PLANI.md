# Queen Waffle - Uzaktan Kurulum Planı

**Tarih:** 17 Ocak 2026  
**Müşteri:** Queen Waffle & Coffee, Kayseri  
**Durum:** Canlıya alma bekleniyor

---

## ✅ Sistem Durumu

| Servis | URL | Durum |
|--------|-----|-------|
| POS | https://queen.pixpos.cloud/pos | ✅ Çalışıyor |
| Boss Panel | https://queen.pixpos.cloud/boss | ✅ Çalışıyor |
| Garson Tablet | https://queen.pixpos.cloud/waiter | ✅ Çalışıyor |
| Mutfak Ekranı | https://queen.pixpos.cloud/kitchen | ✅ Çalışıyor |
| Müşteri Ekranı | https://queen.pixpos.cloud/pos/display | ✅ Çalışıyor |
| QR Menü | https://queen.pixpos.site | ✅ Çalışıyor |
| API | https://api.pixpos.cloud | ✅ Çalışıyor |

---

## 🎯 Kurulum Öncesi Checklist

### Müşteriden Alınacak Bilgiler

| Bilgi | Durum | Not |
|-------|-------|-----|
| İşletme adı | ⬜ | Queen Waffle & Coffee |
| Logo (PNG, şeffaf arka plan) | ⬜ | Fiş ve QR menü için |
| Adres | ⬜ | Fiş için |
| Telefon | ⬜ | Fiş için |
| Vergi No | ⬜ | Fiş için |
| Çalışma saatleri | ⬜ | QR menü için |
| Sosyal medya linkleri | ⬜ | QR menü için |

### Menü Bilgileri

| Bilgi | Durum | Not |
|-------|-------|-----|
| Kategori listesi | ⬜ | Waffle, Kahve, İçecek, vb. |
| Ürün listesi (isim + fiyat) | ⬜ | Excel veya liste |
| Ürün görselleri | ⬜ | Opsiyonel ama önerilir |
| Ürün açıklamaları | ⬜ | QR menü için |

### Fiziksel Düzen

| Bilgi | Durum | Not |
|-------|-------|-----|
| Bölge sayısı | ⬜ | Salon, Teras, Bahçe? |
| Her bölgedeki masa sayısı | ⬜ | Örn: Salon 10, Teras 5 |
| Masa numaralandırma | ⬜ | 1'den mi başlıyor? |

### Donanım

| Cihaz | Durum | Not |
|-------|-------|-----|
| Kasa bilgisayarı | ⬜ | Windows PC/Laptop? |
| Garson tableti | ⬜ | Android tablet? |
| Mutfak ekranı | ⬜ | TV/Monitor? |
| Müşteri ekranı | ⬜ | İkinci monitör? |
| Yazıcı | ⬜ | Marka/model? USB/Network? |
| İnternet | ⬜ | WiFi stabil mi? |

---

## 📋 Kurulum Adımları

### Aşama 1: Veri Girişi (Boss Panel) - 30 dk

**URL:** https://queen.pixpos.cloud/boss

1. **Kategoriler Oluştur**
   - Waffle
   - Kahve
   - Soğuk İçecekler
   - Sıcak İçecekler
   - Tatlılar
   - (Müşterinin menüsüne göre)

2. **Ürünleri Ekle**
   - Her kategori için ürünler
   - Fiyatlar
   - Görseller (varsa)
   - Açıklamalar (QR menü için)

3. **Bölgeler Oluştur**
   - Salon
   - Teras
   - Bahçe
   - (Müşterinin düzenine göre)

4. **Masaları Ekle**
   - Her bölge için masa sayısı
   - Masa numaraları

5. **Ayarları Yapılandır**
   - İşletme bilgileri
   - Logo yükle
   - Fiş ayarları
   - Vergi oranı (%10 KDV)

---

### Aşama 2: Kasa Kurulumu (POS) - 15 dk

**Müşterinin kasasında yapılacaklar:**

1. **Chrome'da Aç**
   ```
   https://queen.pixpos.cloud/pos
   ```

2. **Kısayol Oluştur**
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

1. **APK İndir**
   - APK linkini WhatsApp ile gönder
   - Veya QR kod ile indir

2. **Kurulum**
   - "Bilinmeyen kaynaklardan yükle" izni ver
   - APK'yı kur

3. **Giriş**
   - Uygulama açılınca otomatik bağlanır
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

| Aşama | Süre |
|-------|------|
| Veri girişi (Boss) | 30 dk |
| Kasa kurulumu | 15 dk |
| Tablet kurulumu | 10 dk |
| Mutfak ekranı | 5 dk |
| QR menü | 10 dk |
| Test | 15 dk |
| **TOPLAM** | **~1.5 saat** |

---

## 📞 Kurulum Günü Akışı

### Hazırlık (Kurulumdan Önce)
1. ⬜ Müşteriden menü bilgilerini al
2. ⬜ Boss Panel'de kategorileri oluştur
3. ⬜ Ürünleri ekle
4. ⬜ Bölge ve masaları ayarla

### Uzaktan Bağlantı (Müşteri ile)
1. ⬜ AnyDesk/TeamViewer ile bağlan
2. ⬜ POS kısayolu oluştur
3. ⬜ Yazıcı ayarla
4. ⬜ Müşteri ekranı ayarla
5. ⬜ Test siparişi yap
6. ⬜ Müşteriyi eğit (10-15 dk)

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
