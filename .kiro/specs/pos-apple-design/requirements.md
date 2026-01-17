# PIXPOS - Kapsamlı POS Sistemi Gereksinimleri

## Vizyon

Steve Jobs: "İlk Mac'lerin kasasının içi bile önemliydi. En çok iç tasarıma uğraştık - halbuki görülmüyordu."

PIXPOS, görünen her pikselinde ve görünmeyen her detayında mükemmelliği hedefler. Zarif, minimal ama asla boş değil. Her dokunuş, her geçiş, her mikro-etkileşim düşünülmüş. Apple'dan ilham alan ama özgün bir kimlik.

---

## Sistem Mimarisi

### Uygulamalar

| Uygulama | Port | Kullanıcı | Cihaz | Açıklama |
|----------|------|-----------|-------|----------|
| **API** | 3001 | - | Server | NestJS Backend |
| **POS Kasa** | 3003 | Kasiyer | Çift ekranlı PC | Ana satış terminali |
| **Garson Tablet** | 3004 | Garson | Tablet/Mobil | Sipariş alma |
| **Mutfak (KDS)** | 3005 | Şef/Aşçı | TV/Monitor | Sipariş hazırlama |
| **Boss Panel** | 3002 | Yönetici | Web | Yönetim paneli |
| **QR Menü** | 3006 | Müşteri | Telefon | Dijital menü |

### Veri Akışı

```
Garson Tablet ──┐
                ├──→ API ──→ PostgreSQL
POS Kasa ───────┤      │
                │      ├──→ WebSocket ──→ Tüm Cihazlar (Real-time)
QR Menü ────────┘      │
                       └──→ Yazıcılar (ESC/POS)
```

---

## Glossary

- **POS_Terminal**: Kasada sürekli açık duran çift ekranlı PC
- **Lock_Screen**: Hareketsizlikte aktif olan kilit ekranı
- **Dwell_Time**: Masanın açık olduğu süre
- **KDS**: Kitchen Display System - Mutfak ekranı
- **PAVO**: Yasal ödeme entegrasyonu (ÖKC)
- **ESC/POS**: Termal yazıcı protokolü
- **Floor/Area**: Salon, Teras, Bahçe gibi bölümler

---

# BÖLÜM 1: POS KASA EKRANI

## 1.1 Kilit Ekranı (Lock Screen)

**User Story:** Kasiyer, güvenli ve zarif bir kilit ekranıyla karşılanır.

### Acceptance Criteria

1. WHEN POS_Terminal 10 dakika (ayarlanabilir) hareketsiz kaldığında, THE System SHALL kilit ekranını aktif eder
2. THE Lock_Screen SHALL Apple kilit ekranı kalitesinde, modern ve zarif tasarıma sahip olur
3. THE Lock_Screen SHALL aşağıdaki hızlı erişim butonlarını içerir:
   - ✅ Hızlı Satış (aktif)
   - ✅ Raporlar (aktif)
   - ✅ Ayarlar (aktif)
   - ⏳ Cariler ("Yakında - v2.0" badge)
   - ⏳ Paket Servis ("Yakında - v2.1" badge)
4. THE Lock_Screen SHALL kullanıcı listesi gösterir (Kasiyer/Garson isimleri)
5. WHEN kullanıcı seçildiğinde, THE System SHALL PIN giriş alanı gösterir
6. WHEN doğru PIN girildiğinde, THE System SHALL smooth animasyonla ana ekrana geçer
7. WHEN yanlış PIN girildiğinde, THE System SHALL shake animasyonu ve kırmızı uyarı gösterir
8. THE Lock_Screen SHALL canlı saat ve tarih gösterir
9. THE Lock_Screen SHALL işletme logosu ve adını gösterir

### Ayarlar

- Kilit süresi: 5dk / 10dk / 15dk / 30dk / Kapalı
- PIN uzunluğu: 4-6 haneli
- Otomatik kilit: Açık/Kapalı

---

## 1.2 Ana Ekran - Masa Planı

**User Story:** Kasiyer, tüm masaları bir bakışta görür ve hızlıca işlem yapar.

### Acceptance Criteria

1. THE Ana_Ekran SHALL 3 sütunlu layout kullanır:
   - Sol: İnce sidebar (68px) - Quick actions
   - Orta: Masa grid
   - Sağ: Geniş panel (280px) - Detay/Özet
2. THE Masa_Grid SHALL tüm masaları gösterir (boş + dolu)
3. THE Masa_Kartları SHALL durum renklerine sahip olur:
   - Boş: Nötr gri (#F5F5F7)
   - Dolu/Aktif: Yeşil tint (#34C759)
   - Mutfakta: Turuncu tint (#FF9500)
   - Hazır: Mavi tint (#007AFF) + pulse animasyonu
4. THE Masa_Kartı SHALL aşağıdaki bilgileri gösterir:
   - Masa numarası (büyük, merkezi)
   - Dwell_Time (aktifse): "23dk" veya "1s 15dk"
   - Toplam tutar (aktifse): "₺205"
5. WHEN aktif masa yoksa, THE System SHALL "Aktif masa bulunmamaktadır" mesajı gösterir
6. THE Sağ_Panel SHALL aktif masaları liste halinde gösterir (hızlı erişim)
7. THE Sol_Sidebar SHALL alan/kat filtreleri içerir:
   - Tümü
   - Salon
   - Teras
   - Bahçe
   - Bar
   - (Kullanıcı tanımlı alanlar)

### Alan/Kat Yönetimi

- Yönetici yeni alan ekleyebilir (Boss Panel veya Ayarlar)
- Her alanın adı ve ikonu özelleştirilebilir
- Masalar alanlara atanabilir

---

## 1.3 Sipariş Detay Ekranı

**User Story:** Kasiyer, masanın tüm sipariş detaylarını görür ve yönetir.

### Acceptance Criteria

1. WHEN masaya tıklandığında, THE System SHALL sipariş detay ekranına geçer
2. THE Sipariş_Detay SHALL aşağıdaki bilgileri gösterir:
   - Masa numarası ve alan adı
   - Garson adı (varsa)
   - Açılış saati ve Dwell_Time
   - Sipariş kalemleri (ürün, adet, fiyat)
   - Ara toplam, KDV, indirim, genel toplam
3. THE Sipariş_Detay SHALL aşağıdaki işlemleri destekler:
   - ➕ Yeni ürün ekle
   - ✏️ Adet değiştir (+/-)
   - 🗑️ Ürün sil
   - 💰 İndirim uygula (% veya ₺)
   - ✂️ Sipariş böl
   - 🔗 Sipariş birleştir
   - 📝 Not ekle
4. WHEN "Mutfağa Gönder" tıklandığında, THE System SHALL siparişi mutfağa iletir
5. WHEN sipariş güncellendiğinde, THE System SHALL değişiklikleri real-time olarak mutfak ve diğer cihazlara iletir

---

## 1.4 Ödeme Ekranı

**User Story:** Kasiyer, hızlı ve hatasız ödeme alır.

### Acceptance Criteria

1. WHEN "Ödeme Al" tıklandığında, THE System SHALL ödeme ekranına geçer
2. THE Ödeme_Ekranı SHALL büyük, net toplam tutarı gösterir
3. THE Ödeme_Ekranı SHALL aşağıdaki ödeme yöntemlerini sunar:
   - 💵 Nakit → PAVO'ya gönderilir (yasal)
   - 💳 Kredi Kartı → PAVO'ya gönderilir (yasal)
   - 🌐 Online → PAVO'ya gönderilmez (vergi dışı)
   - 🔀 Çoklu Ödeme (split)
4. WHEN Nakit seçildiğinde, THE System SHALL numpad ile alınan tutarı ister
5. WHEN tutar girildiğinde, THE System SHALL para üstünü otomatik hesaplar
6. WHEN ödeme tamamlandığında, THE System SHALL:
   - Başarı animasyonu gösterir
   - Fiş yazdırır (ayara göre)
   - Masayı kapatır
   - Rapora işler (saat, süre, tutar, yöntem)
7. THE Ödeme_Ekranı SHALL "Fiş Yazdır" ve "E-Fatura" seçenekleri içerir

---

## 1.5 Header & Footer

### Header

1. THE Header SHALL 56px yüksekliğinde sabit olur
2. THE Header SHALL sol tarafta logo + işletme adı gösterir
3. THE Header SHALL ortada canlı saat gösterir (HH:MM)
4. THE Header SHALL sağ tarafta durum göstergeleri içerir:
   - İnternet bağlantısı (yeşil/kırmızı)
   - Sunucu bağlantısı
   - PAVO durumu
   - Yazıcı durumu
5. THE Header SHALL aktif kullanıcı bilgisini gösterir

### Footer

1. THE Footer SHALL 44px yüksekliğinde sabit olur
2. THE Footer SHALL sol tarafta versiyon numarası gösterir
3. THE Footer SHALL ortada durum mesajları gösterir
4. THE Footer SHALL sağ tarafta "Canlı Destek" butonu içerir
5. WHEN offline modda, THE Footer SHALL sarı uyarı bandı gösterir

---

# BÖLÜM 2: GARSON TABLETİ

## 2.1 Giriş Ekranı

**User Story:** Garson, hızlıca giriş yapar ve işe başlar.

### Acceptance Criteria

1. THE Giriş_Ekranı SHALL garson listesi gösterir (isim + soyisim)
2. WHEN garson seçildiğinde, THE System SHALL PIN giriş alanı gösterir
3. WHEN doğru PIN girildiğinde, THE System SHALL ana ekrana geçer
4. THE Giriş_Ekranı SHALL tablet-optimize tasarıma sahip olur

---

## 2.2 Masa Listesi

**User Story:** Garson, masaları görür ve sipariş almaya gider.

### Acceptance Criteria

1. THE Masa_Listesi SHALL tüm masaları grid formatında gösterir
2. THE Masa_Kartları SHALL durum renklerine sahip olur
3. THE Garson SHALL alan/kat filtreleyebilir
4. WHEN masaya tıklandığında, THE System SHALL sipariş ekranına geçer

---

## 2.3 Sipariş Alma

**User Story:** Garson, masada sipariş alır ve mutfağa gönderir.

### Acceptance Criteria

1. THE Sipariş_Ekranı SHALL kategori + ürün grid'i gösterir
2. THE Ürün_Kartları SHALL fotoğraf, isim, fiyat içerir
3. THE Garson SHALL ürün ekleyebilir, adet değiştirebilir
4. THE Garson SHALL müşteri notu ekleyebilir (alerji, tercih vs.)
5. WHEN "Mutfağa Gönder" tıklandığında, THE System SHALL:
   - Siparişi API'ye gönderir
   - Kasaya real-time düşürür
   - Mutfağa real-time düşürür
   - Yazıcıdan fiş çıkarır (ayara göre)
6. WHEN sipariş gönderildiğinde, THE System SHALL geri sayım başlatır (opsiyonel)
7. THE Garson SHALL siparişin geç kalıp kalmadığını görebilir

---

# BÖLÜM 3: MUTFAK EKRANI (KDS)

## 3.1 Sipariş Görüntüleme

**User Story:** Şef, siparişleri net şekilde görür ve hazırlar.

### Acceptance Criteria

1. THE Mutfak_Ekranı SHALL siparişleri ticket/fiş formatında gösterir
2. THE Sipariş_Kartları SHALL büyük, net, okunabilir olur (mutfak ortamı için)
3. THE Sipariş_Kartı SHALL aşağıdaki bilgileri içerir:
   - Masa numarası (büyük)
   - Sipariş kalemleri (ürün, adet, not)
   - Sipariş saati
   - Bekleme süresi (renk kodlu)
4. THE Bekleme_Süresi SHALL renk kodlarına sahip olur:
   - Yeşil: Normal sürede
   - Sarı: Uzuyor
   - Kırmızı: Geç kaldı
5. WHEN siparişe tıklandığında, THE System SHALL detay modalı açar
6. THE Mutfak_Ekranı SHALL sesli bildirim verir (yeni sipariş)

---

## 3.2 Durum Güncelleme

**User Story:** Şef, siparişi hazırladığında işaretler.

### Acceptance Criteria

1. THE Şef SHALL "Hazırlanıyor" durumuna geçirebilir
2. THE Şef SHALL "Hazır" durumuna geçirebilir
3. WHEN "Hazır" işaretlendiğinde, THE System SHALL:
   - Kasaya bildirim gönderir
   - Garson tabletine bildirim gönderir
4. THE Garson SHALL tabletten "Teslim Edildi" işaretleyebilir (opsiyonel)

---

## 3.3 Yazıcı Entegrasyonu

**User Story:** Mutfakta yazıcıdan sipariş fişi çıkar.

### Acceptance Criteria

1. THE System SHALL mutfak yazıcısı bağlantısını destekler
2. THE Yazıcı SHALL aynı ağda (WiFi/Ethernet) olur
3. WHEN yeni sipariş geldiğinde, THE System SHALL otomatik fiş yazdırır (ayara göre)
4. THE Fiş_Template SHALL 80mm genişliğinde olur
5. THE Fiş SHALL aşağıdaki bilgileri içerir:
   - Masa numarası (büyük)
   - Sipariş kalemleri
   - Notlar
   - Sipariş saati
   - Sipariş numarası

---

# BÖLÜM 4: BOSS PANEL (YÖNETİM)

## 4.1 Dashboard

**User Story:** Yönetici, işletmenin anlık durumunu görür.

### Acceptance Criteria

1. THE Dashboard SHALL anlık metrikleri gösterir:
   - Bugünkü ciro
   - Açık masa sayısı
   - Bekleyen sipariş sayısı
   - Ortalama hesap tutarı
2. THE Dashboard SHALL grafik/chart'lar içerir
3. THE Dashboard SHALL son aktiviteleri listeler

---

## 4.2 Ürün Yönetimi

**User Story:** Yönetici, ürünleri ve kategorileri yönetir.

### Acceptance Criteria

1. THE Yönetici SHALL ürün ekleyebilir/düzenleyebilir/silebilir
2. THE Ürün SHALL aşağıdaki bilgileri içerir:
   - İsim, açıklama, fiyat
   - Kategori
   - Fotoğraf
   - Barkod (opsiyonel)
   - KDV oranı
   - Aktif/Pasif durumu
3. THE Yönetici SHALL kategori ekleyebilir/düzenleyebilir/silebilir
4. THE Yönetici SHALL ürün sıralamasını değiştirebilir

---

## 4.3 Raporlar

**User Story:** Yönetici, detaylı raporlar alır.

### Acceptance Criteria

1. THE Raporlar SHALL aşağıdaki filtreleri destekler:
   - Tarih aralığı (bugün, bu hafta, bu ay, özel)
   - Saat aralığı
   - Ürün bazlı
   - Kategori bazlı
   - Garson bazlı
   - Ödeme yöntemi bazlı
2. THE Raporlar SHALL aşağıdaki metrikleri içerir:
   - Toplam ciro
   - Sipariş sayısı
   - Ortalama hesap
   - En çok satan ürünler
   - Saat bazlı dağılım
   - Gün bazlı dağılım
   - Mevsimsel trendler
3. THE Raporlar SHALL Excel/PDF export destekler

---

## 4.4 Ayarlar

**User Story:** Yönetici, sistem ayarlarını yapılandırır.

### Acceptance Criteria

1. THE Ayarlar SHALL aşağıdaki bölümleri içerir:
   - İşletme bilgileri
   - Kullanıcı yönetimi
   - Alan/Kat yönetimi
   - Masa yönetimi
   - Yazıcı ayarları
   - PAVO entegrasyonu
   - Kilit ekranı ayarları
   - Bildirim ayarları
2. THE Yazıcı_Ayarları SHALL:
   - Yazıcı ekleme (IP adresi)
   - Test yazdırma
   - Fiş template düzenleme
   - Otomatik yazdırma açık/kapalı

---

## 4.5 Barkod Sistemi

**User Story:** Yönetici, barkodlu satış aktif edebilir.

### Acceptance Criteria

1. THE Yönetici SHALL barkod sistemini aktif/pasif edebilir
2. WHEN barkod aktifse, THE POS SHALL barkod okuyucu desteği sağlar
3. THE Ürünler SHALL barkod numarası içerebilir
4. WHEN barkod okutulduğunda, THE System SHALL ürünü otomatik sepete ekler

---

# BÖLÜM 5: QR MENÜ

## 5.1 Menü Görüntüleme

**User Story:** Müşteri, QR kod okutarak menüyü görür.

### Acceptance Criteria

1. WHEN müşteri QR kod okuttuğunda, THE System SHALL menü sayfasını açar
2. THE Menü SHALL kategorileri ve ürünleri gösterir
3. THE Ürün_Kartı SHALL fotoğraf, isim, açıklama, fiyat içerir
4. THE Menü SHALL mobil-optimize, zarif tasarıma sahip olur
5. THE Menü SHALL işletme logosu ve adını gösterir

---

# BÖLÜM 6: YAZICI SİSTEMİ

## 6.1 Yazıcı Bağlantısı

### Acceptance Criteria

1. THE System SHALL ESC/POS protokolünü destekler
2. THE Yazıcılar SHALL aynı ağda (WiFi veya Ethernet) bağlanır
3. THE System SHALL birden fazla yazıcı destekler:
   - Kasa yazıcısı (müşteri fişi)
   - Mutfak yazıcısı (sipariş fişi)
4. THE Yazıcı_Durumu SHALL header'da gösterilir

---

## 6.2 Fiş Template'leri

### Kasa Fişi (80mm)

```
================================
        [İŞLETME LOGO]
        [İŞLETME ADI]
        [ADRES]
        [TELEFON]
================================
Tarih: DD.MM.YYYY    Saat: HH:MM
Masa: [MASA NO]      Fiş: #[NO]
Garson: [İSİM]
--------------------------------
[ÜRÜN ADI]
    [ADET] x [FİYAT]    [TOPLAM]
[ÜRÜN ADI]
    [ADET] x [FİYAT]    [TOPLAM]
--------------------------------
Ara Toplam:          [TUTAR]
KDV (%10):           [TUTAR]
İndirim:            -[TUTAR]
================================
TOPLAM:              [TUTAR]
================================
Ödeme: [NAKİT/KART/ONLİNE]
--------------------------------
    Bizi tercih ettiğiniz için
        teşekkür ederiz!
================================
```

### Mutfak Fişi (80mm)

```
================================
   *** YENİ SİPARİŞ ***
================================
MASA: [MASA NO]     [SAAT]
================================
[ADET]x [ÜRÜN ADI]
   > [NOT]
[ADET]x [ÜRÜN ADI]
   > [NOT]
================================
Garson: [İSİM]
Sipariş No: #[NO]
================================
```

---

# BÖLÜM 7: YAKINDA GELECEK ÖZELLİKLER

## Versiyon Planlaması

### v1.0 - MVP (Mevcut)
- ✅ POS Kasa temel işlevler
- ✅ Garson Tablet
- ✅ Mutfak Ekranı
- ✅ Boss Panel temel
- ✅ QR Menü temel
- ✅ Yazıcı entegrasyonu

### v1.1 - Yakında
- ⏳ Gelişmiş raporlar
- ⏳ Barkod sistemi
- ⏳ Stok takibi temel

### v2.0 - Planlanan
- ⏳ Cariler (müşteri kartı)
- ⏳ Sadakat programı
- ⏳ Çoklu şube desteği

### v2.1 - Planlanan
- ⏳ Paket Servis
- ⏳ Online sipariş
- ⏳ Entegrasyon API'leri

### v3.0 - Gelecek
- ⏳ AI destekli tahminler
- ⏳ Otomatik stok siparişi
- ⏳ Gelişmiş analitik

---

# BÖLÜM 8: TASARIM SİSTEMİ

## Renk Paleti - "Elegant Neutral"

Apple'dan ilham alan ama özgün bir palet:

```css
/* Ana Renkler */
--color-primary: #2563EB;      /* Royal Blue - Ana aksiyon */
--color-success: #10B981;      /* Emerald - Başarı, dolu */
--color-warning: #F59E0B;      /* Amber - Uyarı, mutfakta */
--color-danger: #EF4444;       /* Red - Hata, iptal */
--color-info: #3B82F6;         /* Blue - Bilgi, hazır */

/* Nötr Tonlar */
--color-white: #FFFFFF;
--color-gray-50: #F9FAFB;      /* Arka plan */
--color-gray-100: #F3F4F6;     /* Kart arka planı */
--color-gray-200: #E5E7EB;     /* Border */
--color-gray-300: #D1D5DB;     /* Disabled */
--color-gray-400: #9CA3AF;     /* Placeholder */
--color-gray-500: #6B7280;     /* İkincil metin */
--color-gray-600: #4B5563;     /* Metin */
--color-gray-700: #374151;     /* Başlık */
--color-gray-800: #1F2937;     /* Koyu metin */
--color-gray-900: #111827;     /* En koyu */

/* Durum Arka Planları (Subtle) */
--status-empty: #F9FAFB;
--status-occupied: rgba(16, 185, 129, 0.08);
--status-kitchen: rgba(245, 158, 11, 0.08);
--status-ready: rgba(59, 130, 246, 0.08);

/* Gölgeler */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
```

## Tipografi

```css
/* Font */
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Boyutlar */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

## Spacing & Radius

```css
/* Spacing */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */

/* Border Radius */
--radius-sm: 0.375rem; /* 6px */
--radius-md: 0.5rem;   /* 8px */
--radius-lg: 0.75rem;  /* 12px */
--radius-xl: 1rem;     /* 16px */
--radius-2xl: 1.5rem;  /* 24px */
--radius-full: 9999px;
```

## Animasyonlar

```css
/* Timing */
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;

/* Easing */
--ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

---

## Tasarım İlkeleri

1. **Beyaz Alan**: Nefes alan, ferah tasarım
2. **Hiyerarşi**: Önemli olan öne çıkar
3. **Tutarlılık**: Her ekran aynı dili konuşur
4. **Dokunmatik**: Min 44px touch target
5. **Erişilebilirlik**: WCAG AA uyumlu kontrastlar
6. **Performans**: 60fps animasyonlar
7. **Detay**: Görünmeyen yerlerde bile kalite
