# 🟦 SQUARE (Block Inc.) İŞ MODELİ ANALİZİ
## Türkiye'nin Square'i Olmak İçin Yol Haritası

---

## 📊 SQUARE HAKKINDA GENEL BİLGİLER

| Metrik | Değer |
|--------|-------|
| **Kuruluş** | 2009 (Jack Dorsey) |
| **Şirket Adı** | Block, Inc. (2021'de Square'den değişti) |
| **Merkez** | San Francisco, CA |
| **Kullanıcı Sayısı** | 57 milyon kullanıcı, 4 milyon satıcı |
| **Yıllık İşlem Hacmi (GPV)** | $241 milyar (2024) |
| **Yıllık Brüt Kâr** | $8.89 milyar (2024, +18% YoY) |
| **Pazar Değeri** | ~$40 milyar |

---

## 🏗️ SQUARE EKOSİSTEMİ - İKİ ANA SÜTUN

### 1️⃣ SQUARE (İşletmeler İçin)
Küçük ve orta ölçekli işletmelere yönelik ticaret platformu.

### 2️⃣ CASH APP (Bireyler İçin)
Kişisel finans uygulaması (P2P ödemeler, yatırım, Bitcoin).

**Not:** Türkiye için öncelik SQUARE tarafı olmalı. Cash App benzeri uygulama ikinci fazda düşünülebilir.

---

## 💰 GELİR KAYNAKLARI (Revenue Streams)

### 1. İŞLEM KOMİSYONLARI (Transaction Fees) - %60
Square'in ana gelir kaynağı.

| İşlem Tipi | Komisyon |
|------------|----------|
| **Yüz yüze (Tap/Dip/Swipe)** | %2.6 + $0.10 |
| **Online işlemler** | %2.9 + $0.30 |
| **Manuel giriş (keyed-in)** | %3.5 + $0.15 |
| **Fatura ödemeleri** | %3.3 + $0.30 |
| **Afterpay (BNPL)** | %6 + $0.30 |

**Türkiye için:** Komisyon oranları %1.5-2.5 aralığında olmalı (rekabet ve düzenleme gereği).

---

### 2. YAZILIM ABONELİKLERİ (SaaS) - %25

| Ürün | Aylık Ücret | Özellikler |
|------|-------------|------------|
| **Square POS (Free)** | $0 | Temel satış, envanter |
| **Square Plus** | $29-69/ay | Gelişmiş özellikler |
| **Square Premium** | $79-149/ay | Tam özellik seti |
| **Square for Restaurants** | $60-165/ay | Restoran özel |
| **Square for Retail** | $60-89/ay | Perakende özel |
| **Square Appointments** | $0-69/ay | Randevu yönetimi |
| **Square Payroll** | $35/ay + $6/çalışan | Bordro |
| **Square Loyalty** | $45/ay | Sadakat programı |
| **Square Marketing** | $15/ay | E-posta/SMS pazarlama |
| **Square KDS** | $20-30/ay/cihaz | Mutfak ekranı |
| **Square Team Management** | $35/ay | Vardiya yönetimi |

---

### 3. DONANIM SATIŞLARI (Hardware) - %5

| Ürün | Fiyat | Açıklama |
|------|-------|----------|
| **Square Reader** | $0-59 | Mobil kart okuyucu |
| **Square Terminal** | $299 | All-in-one ödeme terminali |
| **Square Stand** | $149 | iPad standı + kart okuyucu |
| **Square Register** | $799 | Tam dokunmatik kasa |
| **Square Kiosk** | $399 | Self-servis kiosk |
| **Square Handheld** | $299 | Taşınabilir POS |
| **Mutfak Yazıcısı** | $279 | Termal yazıcı |
| **Kasa Çekmecesi** | $89 | Yazıcı bağlantılı |

**Strateji:** Donanım düşük marjla satılır, yazılım ve işlem komisyonlarıyla para kazanılır.

---

### 4. FİNANSAL HİZMETLER (Square Banking) - %10

#### Square Loans (İşletme Kredileri)
- **Tutar:** $300 - $250,000
- **Geri ödeme:** Günlük satışların %'si olarak otomatik kesinti
- **Süre:** Maksimum 18 ay
- **Faiz:** Sabit ücret (faiz yerine)
- **Uygunluk:** Sadece Square kullanan işletmeler (davet usulü)

#### Square Checking (İşletme Hesabı)
- Aylık ücret yok
- Anında para transferi
- Square Debit Card
- FDIC sigortalı ($250,000'a kadar)

#### Square Savings (Tasarruf Hesabı)
- %1.00 APY (yıllık getiri)
- Minimum bakiye yok
- FDIC sigortalı ($2,500,000'a kadar)

#### Instant Deposit (Anında Transfer)
- Normal: Ertesi iş günü (ücretsiz)
- Anında: %1.75 komisyon

---

## 🍽️ SQUARE FOR RESTAURANTS - DETAYLİ ANALİZ

PIXPOS için en kritik segment.

### Özellikler:

#### Sipariş Yönetimi
- Masa yönetimi ve plan
- Sipariş alma (dine-in, takeout, delivery)
- Sipariş bölme/birleştirme
- Kurs yönetimi (starter, main, dessert)
- Modifier'lar ve özelleştirmeler

#### Mutfak (KDS)
- Dijital mutfak ekranı
- Sipariş routing (bar, mutfak, tatlı)
- Hazırlık süreleri takibi
- Sesli bildirimler

#### Personel
- Vardiya planlama
- Saat takibi (clock in/out)
- Bahşiş yönetimi
- Performans raporları

#### Müşteri
- Sadakat programı
- Dijital makbuzlar
- Online sipariş
- QR menü

#### Entegrasyonlar
- DoorDash, Uber Eats, Grubhub
- Yelp, Google
- Muhasebe yazılımları

### Fiyatlandırma:
| Plan | Aylık | Özellikler |
|------|-------|------------|
| Free | $0 | Temel POS |
| Plus | $60 | + KDS, gelişmiş raporlar |
| Premium | $165 | + Çoklu lokasyon, API |

---

## 🔌 API & ENTEGRASYONLAR

Square'in güçlü yanlarından biri açık API'ler:

- **Payments API** - Ödeme işlemleri
- **Catalog API** - Ürün/hizmet kataloğu
- **Orders API** - Sipariş yönetimi
- **Customers API** - Müşteri profilleri
- **Inventory API** - Stok yönetimi
- **Locations API** - Çoklu lokasyon
- **Team API** - Personel yönetimi
- **Loyalty API** - Sadakat programı
- **Bookings API** - Randevu sistemi
- **In-App Payments SDK** - Mobil uygulama entegrasyonu

---

## 📈 SQUARE'İN BÜYÜME STRATEJİSİ

### 1. Land & Expand
- Ücretsiz başlangıç (Free tier)
- Kullanıcı büyüdükçe ücretli özelliklere geçiş
- Cross-sell (POS → Payroll → Loans)

### 2. Ecosystem Lock-in
- Tüm araçlar entegre
- Veri tek yerde
- Geçiş maliyeti yüksek

### 3. Hardware as Gateway
- Düşük maliyetli donanım
- Yazılım ve işlem geliri

### 4. Data-Driven Lending
- İşlem verisiyle kredi riski değerlendirme
- Otomatik geri ödeme (satışlardan kesinti)

### 5. Vertical Solutions
- Restoran, perakende, hizmet sektörü için özel çözümler

---

## 🇹🇷 TÜRKİYE İÇİN PIXPOS STRATEJİSİ

### Faz 1: Temel POS (Şu an)
- [x] Masa yönetimi
- [x] Sipariş alma
- [x] Mutfak ekranı (KDS)
- [x] Garson tablet
- [x] QR menü
- [ ] Multi-tenant SaaS yapısı ⚠️ KRİTİK

### Faz 2: Ödeme Entegrasyonu
- [ ] iyzico/PayTR/Param entegrasyonu
- [ ] Sanal POS
- [ ] Temassız ödeme (NFC)
- [ ] QR ile ödeme

### Faz 3: Finansal Hizmetler
- [ ] İşletme kredileri (banka ortaklığı)
- [ ] Anında ödeme
- [ ] Fatura yönetimi

### Faz 4: Ekosistem
- [ ] Bordro/maaş yönetimi
- [ ] Sadakat programı
- [ ] Pazarlama araçları
- [ ] Muhasebe entegrasyonu (Logo, Mikro, Paraşüt)

### Faz 5: Marketplace
- [ ] Yemeksepeti/Getir entegrasyonu
- [ ] Tedarikçi marketplace
- [ ] B2B sipariş

---

## 💵 PIXPOS FİYATLANDIRMA ÖNERİSİ

### Yazılım Planları

| Plan | Aylık | Hedef |
|------|-------|-------|
| **Başlangıç** | ₺0 | Tek lokasyon, temel özellikler |
| **Profesyonel** | ₺499 | KDS, raporlar, 3 kullanıcı |
| **İşletme** | ₺999 | Çoklu lokasyon, API, sınırsız kullanıcı |
| **Kurumsal** | Özel | Zincirler, özel geliştirme |

### İşlem Komisyonları

| İşlem Tipi | Komisyon |
|------------|----------|
| Yüz yüze | %1.79 + ₺0.30 |
| Online | %2.49 + ₺0.50 |
| QR ödeme | %1.49 + ₺0.20 |

### Donanım

| Ürün | Fiyat |
|------|-------|
| PIXPOS Reader | ₺299 |
| PIXPOS Terminal | ₺1,999 |
| PIXPOS Stand (iPad) | ₺999 |
| PIXPOS Register | ₺4,999 |
| Mutfak Yazıcısı | ₺1,499 |

---

## 🎯 KRİTİK BAŞARI FAKTÖRLERİ

1. **Multi-tenant Altyapı** - Her müşteri izole, ölçeklenebilir
2. **Ödeme Entegrasyonu** - Türk bankaları ve ödeme kuruluşları
3. **Yasal Uyumluluk** - e-Fatura, e-Arşiv, ÖKC entegrasyonu
4. **Yerelleştirme** - Türk işletme ihtiyaçlarına uygun
5. **Destek** - 7/24 Türkçe destek
6. **Fiyatlandırma** - Türkiye ekonomisine uygun

---

## 📚 KAYNAKLAR

- [Square Pricing](https://squareup.com/us/en/pricing)
- [Square Hardware](https://squareup.com/us/en/hardware)
- [Square for Restaurants](https://squareup.com/us/en/point-of-sale/restaurants)
- [Block Investor Relations](https://investors.block.xyz)
- [Square Developer](https://developer.squareup.com)

---

*Bu analiz PIXPOS'un Türkiye'nin Square'i olma vizyonu için hazırlanmıştır.*
*Tarih: Ocak 2026*
