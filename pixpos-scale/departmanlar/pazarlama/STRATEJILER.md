# Pazarlama Ekibi - Stratejiler ve Kampanyalar

Square'in pazarlama taktikleri ve PIXPOS adaptasyonu.

---

## 🎯 Square Pazarlama Taktikleri

### 1. Referral Program (Viral Growth)

**Square Modeli:**
```
Referans gönderen → ₺1,000 ücretsiz işlem
Yeni kullanıcı    → ₺1,000 ücretsiz işlem
Süre: 180 gün içinde kullanılmalı
Koşul: KYC (kimlik doğrulama) gerekli
```

**Neden Etkili:**
- İki taraflı ödül (win-win)
- Gerçek para değeri
- Organik büyüme
- Düşük CAC (Customer Acquisition Cost)

**PIXPOS için Adaptasyon:**
```
Referans gönderen → ₺500 ücretsiz işlem
Yeni kullanıcı    → ₺500 ücretsiz işlem
Süre: 90 gün
Koşul: En az 1 işlem yapılmış olmalı
```

**Hesaplama:**
- Ortalama işlem: ₺100
- İşlem ücreti: %2.5 = ₺2.50
- ₺500 ücretsiz = 200 işlem = ₺500 maliyet
- Yeni müşteri LTV: ₺10,000+ (yıllık)
- ROI: 20x

---

### 2. Gamification (Setup Progress)

**Square Modeli:**
- "You're 83% set up" progress bar
- Adım adım checklist
- Görsel feedback
- Kutlama ekranı

**Psikolojik Etki:**
- Tamamlama dürtüsü (Zeigarnik effect)
- Küçük kazanımlar = dopamin
- Kullanıcı bağlılığı artışı

**PIXPOS için Adaptasyon:**
```
Onboarding Checklist:
□ Hesap oluştur (10%)
□ İşletme bilgileri (20%)
□ Logo yükle (30%)
□ İlk ürünü ekle (50%)
□ Vergi ayarla (60%)
□ Yazıcı bağla (70%)
□ Test satışı yap (85%)
□ İlk gerçek satış (100%) 🎉

Ödül: %100 tamamlayanlara 1 ay Plus ücretsiz
```

---

### 3. Free Add-ons Stratejisi

**Square Modeli:**
Tüm eklentiler ücretsiz:
- Cash Management
- Email Marketing
- Gift Cards
- Team Management
- Payment Links
- Subscriptions

**Mantık:**
```
Daha fazla özellik
    ↓
Daha fazla kullanım
    ↓
Daha fazla işlem
    ↓
Daha fazla komisyon
```

**PIXPOS için:**
- Tüm özellikler Free tier'da
- Plus tier: Gelişmiş raporlar, öncelikli destek
- Premium tier: Özel entegrasyonlar, düşük komisyon

---

### 4. Empty States (Yönlendirici Tasarım)

**Square Modeli:**
Her boş ekranda:
1. Açıklayıcı ikon
2. Başlık
3. Açıklama
4. CTA butonu
5. Learn more linki

**Örnek:**
```
[📋 İkon]
"Henüz ürün yok"
"Ürün ekleyerek kasada hızlı satış yapın."
[Ürün Ekle] [İçe Aktar]
Ürünler hakkında daha fazla bilgi →
```

---

### 5. Content Marketing

**Square'in İçerik Stratejisi:**
- Blog (iş ipuçları)
- YouTube (eğitim videoları)
- Webinarlar
- E-kitaplar
- Podcast

**PIXPOS için İçerik Planı:**

| Kanal | İçerik Türü | Sıklık |
|-------|-------------|--------|
| Blog | İşletme ipuçları | Haftalık |
| YouTube | Ürün tanıtım, eğitim | 2 haftalık |
| Instagram | Müşteri hikayeleri | Günlük |
| LinkedIn | B2B içerik | Haftalık |
| E-posta | Newsletter | Haftalık |

**İçerik Konuları:**
- "Kafe açmak isteyenler için 10 ipucu"
- "POS sistemi nasıl seçilir?"
- "Stok yönetimi rehberi"
- "Müşteri sadakati nasıl artırılır?"
- "Vergi hesaplama rehberi"

---

### 6. Sektör Bazlı Release Sayfaları (Şeffaflık Stratejisi)

**Kaynak:** squareup.com/us/en/releases

**Square Modeli:**
Square, yeni özellikleri sektör bazlı ayrı sayfalarda duyuruyor:
- `/releases` - Ana sayfa (tüm sektörler)
- `/releases/food-and-beverage` - Restoran/kafe
- `/releases/retail` - Perakende
- `/releases/beauty` - Güzellik salonu
- `/releases/services` - Hizmet sektörü

**Sayfa Yapısı:**
```
┌─────────────────────────────────────────────────────────────┐
│  HERO: "Build the [X] everyone wants to come back to"       │
│  Alt başlık: Değer önerisi                                  │
├─────────────────────────────────────────────────────────────┤
│  FEATURED FEATURE (Büyük görsel + açıklama + CTA)           │
├─────────────────────────────────────────────────────────────┤
│  CUSTOMER TESTIMONIAL                                       │
│  "Gerçek müşteri yorumu" - İsim, Unvan, Şirket, Lokasyon   │
├─────────────────────────────────────────────────────────────┤
│  FEATURE GRID (2-3 sütun, diğer özellikler)                │
├─────────────────────────────────────────────────────────────┤
│  "THERE'S MORE TO EXPLORE"                                  │
│  • Feature Log (geçmiş özellikler)                          │
│  • Roadmap (gelecek özellikler)                             │
│  • More for [sektör]                                        │
├─────────────────────────────────────────────────────────────┤
│  NEWSLETTER SIGNUP (Lead generation)                        │
│  • İsim, telefon, işletme adı                               │
│  • Sektör dropdown                                          │
│  • Yıllık ciro dropdown                                     │
├─────────────────────────────────────────────────────────────┤
│  FOOTER CTA: "Join the 4M+ businesses running with Square"  │
└─────────────────────────────────────────────────────────────┘
```

**Neden Etkili:**
1. **Sektöre Özel Dil:** Her sektörün terminolojisi kullanılır
2. **Hedefli Pazarlama:** Müşteri kendini görür
3. **Güven Oluşturma:** Gerçek müşteri testimonial'ları
4. **Şeffaflık:** Feature Log + Roadmap ile açıklık
5. **Lead Generation:** Newsletter formu ile veri toplama

**PIXPOS için Adaptasyon:**

**URL Yapısı:**
- `pixpos.com.tr/yenilikler` - Ana sayfa
- `pixpos.com.tr/yenilikler/restoran` - Restoran/kafe
- `pixpos.com.tr/yenilikler/perakende` - Perakende
- `pixpos.com.tr/yenilikler/guzellik` - Güzellik salonu
- `pixpos.com.tr/yenilikler/hizmet` - Hizmet sektörü

**Başlık Formatı:**
| Sektör | Başlık |
|--------|--------|
| Restoran | "Herkesin tekrar gelmek istediği restoranı kurun" |
| Perakende | "Mahallenizi şekillendiren mağazayı kurun" |
| Güzellik | "Müşterilerinizle güven inşa edin" |
| Hizmet | "Projeleri ve ödemeleri akıcı tutun" |

**Newsletter Form Alanları:**
| Alan | Tip | Amaç |
|------|-----|------|
| Ad Soyad | Text | Kişiselleştirme |
| Telefon | Phone | Satış takibi |
| İşletme Adı | Text | B2B segmentasyon |
| Sektör | Dropdown | Hedefli içerik |
| Yıllık Ciro | Dropdown | Müşteri değeri |

**Ciro Aralıkları (Türkiye için):**
- 0 - ₺100K
- ₺100K - ₺500K
- ₺500K - ₺1M
- ₺1M - ₺5M
- ₺5M - ₺10M
- ₺10M - ₺25M
- ₺25M - ₺50M
- ₺50M+

---

### 7. Feature Log & Roadmap (Şeffaflık)

**Square Modeli:**
- **Feature Log:** Geçmişte çıkan tüm özellikler
- **Roadmap:** Yakında gelecek özellikler + kullanıcı oylaması

**Neden Önemli:**
1. **Güven:** "Bu şirket sürekli geliştiriyor"
2. **Beklenti Yönetimi:** "X özelliği yakında geliyor"
3. **Kullanıcı Katılımı:** Oylama ile bağlılık
4. **Şeffaflık:** Açık iletişim

**PIXPOS için:**

**Feature Log Sayfası:**
```
pixpos.com.tr/ozellik-gunlugu

┌─────────────────────────────────────────────────────────────┐
│  Özellik Günlüğü                                            │
│  PIXPOS'a eklenen tüm yenilikler                            │
├─────────────────────────────────────────────────────────────┤
│  Filtre: [Tümü] [Restoran] [Perakende] [Güzellik] [Hizmet] │
├─────────────────────────────────────────────────────────────┤
│  Ocak 2026                                                  │
│  ├─ 🆕 Çoklu Lokasyon Desteği                              │
│  ├─ 🆕 Gelişmiş Raporlama                                  │
│  └─ ✨ KDS İyileştirmeleri                                 │
│                                                             │
│  Aralık 2025                                                │
│  ├─ 🆕 QR Menü                                             │
│  └─ ✨ Garson Tablet Uygulaması                            │
└─────────────────────────────────────────────────────────────┘
```

**Roadmap Sayfası:**
```
pixpos.com.tr/yol-haritasi

┌─────────────────────────────────────────────────────────────┐
│  Yol Haritası                                               │
│  Üzerinde çalıştığımız özellikler                           │
├─────────────────────────────────────────────────────────────┤
│  🔜 Yakında                                                 │
│  ├─ Yemeksepeti Entegrasyonu (⬆️ 234 oy)                   │
│  ├─ Getir Entegrasyonu (⬆️ 189 oy)                         │
│  └─ AI Destekli Raporlar (⬆️ 156 oy)                       │
│                                                             │
│  🔨 Geliştirmede                                            │
│  ├─ Kiosk Modu                                              │
│  └─ Offline Ödeme                                           │
│                                                             │
│  💭 Değerlendirmede                                         │
│  ├─ Bitcoin Ödemeleri (⬆️ 45 oy)                           │
│  └─ Franchise Yönetimi (⬆️ 38 oy)                          │
│                                                             │
│  [Özellik Öner] butonu                                      │
└─────────────────────────────────────────────────────────────┘
```

**Oylama Sistemi:**
- Giriş yapmış kullanıcılar oy verebilir
- Her kullanıcı her özelliğe 1 oy
- Yüksek oylu özellikler öncelik kazanır
- Kullanıcı katılımı ve bağlılık artışı

---

### 8. Müşteri Testimonial Stratejisi

**Square Modeli:**
Her release sayfasında gerçek müşteri yorumları:
```
"For the first time, I feel like I have control over my purchasing decisions."
— Carlo DiCicco, Co-owner & GM, DiCicco's Italian Restaurant, Fresno, CA
```

**Format:**
- Alıntı (spesifik, ölçülebilir sonuç)
- İsim
- Unvan
- Şirket adı
- Lokasyon

**PIXPOS için Testimonial Toplama:**

| Aşama | Aksiyon |
|-------|---------|
| 1. Pilot | Queen Waffle'dan ilk testimonial |
| 2. Erken Kullanıcılar | İlk 10 müşteriden yorum |
| 3. Sektör Bazlı | Her sektörden 3-5 testimonial |
| 4. Sürekli | Otomatik feedback toplama |

**Testimonial Şablonu:**
```
"[Spesifik sonuç/fayda]. [Önceki durum vs şimdi]. [PIXPOS ile değişen şey]."
— [İsim], [Unvan], [İşletme Adı], [Şehir]
```

**Örnek:**
```
"Günde 2 saat harcadığım stok takibini artık 10 dakikada yapıyorum. 
PIXPOS'un otomatik raporları sayesinde hangi ürünün ne zaman biteceğini 
önceden görüyorum."
— Ahmet Yılmaz, Kurucu, Queen Waffle, Kayseri
```

---

## 📊 Kampanya Fikirleri

### Lansman Kampanyası

**"İlk 100 İşletme"**
```
Hedef: İlk 100 işletmeyi kazanmak
Teklif: 
- 3 ay ücretsiz Plus
- Ücretsiz kurulum
- Ücretsiz eğitim
- %50 indirimli donanım

Süre: 30 gün
Kanal: LinkedIn, Instagram, Google Ads
```

### Sektör Kampanyaları

**"Kafe Paketi"**
```
Hedef: Kafeler
Teklif:
- Özel kafe modu
- Kahve aboneliği özelliği
- Sadakat programı
- 1 ay ücretsiz

Kanal: Instagram, kafe grupları
```

**"Restoran Paketi"**
```
Hedef: Restoranlar
Teklif:
- Masa yönetimi
- Mutfak ekranı
- QR menü
- Getir/Yemeksepeti entegrasyonu

Kanal: LinkedIn, restoran dernekleri
```

### Sezonsal Kampanyalar

| Dönem | Kampanya | Teklif |
|-------|----------|--------|
| Ocak | Yeni Yıl, Yeni Sistem | %20 indirim |
| Nisan | Ramazan | Restoran özel |
| Haziran | Yaz Sezonu | Teras/bahçe özel |
| Eylül | Okul Açılışı | Kantin/büfe özel |
| Kasım | Black Friday | %50 indirim |
| Aralık | Yılbaşı | Hediye kartı özel |

---

## 🎁 Sadakat Programı

### İşletme Sadakati

**Tier Sistemi:**
```
Bronze (0-₺50K işlem/ay):
- Standart destek
- Temel raporlar

Silver (₺50K-₺200K işlem/ay):
- Öncelikli destek
- Gelişmiş raporlar
- %0.1 komisyon indirimi

Gold (₺200K+ işlem/ay):
- Dedicated account manager
- Özel entegrasyonlar
- %0.2 komisyon indirimi
- Ücretsiz donanım yükseltme
```

---

## 📈 Metrikler ve KPI'lar

### Takip Edilecek Metrikler

| Metrik | Hedef (Q2 2026) |
|--------|-----------------|
| Yeni kayıt | 500/ay |
| Aktivasyon oranı | %60 |
| Referral oranı | %20 |
| Churn rate | <%5/ay |
| NPS | >50 |
| CAC | <₺500 |
| LTV | >₺10,000 |
| LTV/CAC | >20x |

### Funnel Metrikleri

```
Ziyaretçi → Kayıt: %5
Kayıt → Aktivasyon: %60
Aktivasyon → İlk Satış: %80
İlk Satış → Aylık Aktif: %70
Aylık Aktif → Referral: %20
```

---

## 📱 Sosyal Medya Stratejisi

### Platform Stratejileri

**Instagram:**
- Hedef: Kafe/restoran sahipleri
- İçerik: Görsel ağırlıklı, müşteri hikayeleri
- Hashtag: #pixpos #kasasistemi #kafeyonetimi

**LinkedIn:**
- Hedef: İşletme sahipleri, yöneticiler
- İçerik: B2B, iş ipuçları, case study
- Grup: Türkiye Girişimciler, HoReCa

**YouTube:**
- Hedef: Eğitim arayanlar
- İçerik: Tutorial, ürün tanıtım
- SEO: "POS sistemi", "kasa programı"

**TikTok:**
- Hedef: Genç girişimciler
- İçerik: Kısa ipuçları, behind the scenes
- Trend: İşletme hikayeleri

---

## 🤝 Ortaklıklar

### Potansiyel Ortaklar

| Ortak | Tür | Fayda |
|-------|-----|-------|
| Muhasebe yazılımları | Entegrasyon | Çapraz satış |
| Banka/Fintech | Ödeme | Komisyon paylaşımı |
| Donanım distribütörleri | Satış | Paket satış |
| İşletme dernekleri | Referans | Güvenilirlik |
| Franchise zincirleri | Kurumsal | Toplu satış |

### Influencer Marketing

| Kategori | Hedef Influencer |
|----------|------------------|
| Girişimcilik | İş dünyası influencer'ları |
| Gastronomi | Şefler, food blogger'lar |
| Teknoloji | Tech reviewer'lar |

---

## 📋 Pazarlama Checklist

### Faz 1 (Q1 2026)
- [ ] Landing page
- [ ] Sosyal medya hesapları
- [ ] Blog kurulumu
- [ ] İlk 10 blog yazısı
- [ ] Referral program altyapısı

### Faz 2 (Q2 2026)
- [ ] Referral program lansmanı
- [ ] İlk 100 işletme kampanyası
- [ ] YouTube kanalı
- [ ] E-posta otomasyonu
- [ ] Google Ads

### Faz 3 (Q3-Q4 2026)
- [ ] Sektör kampanyaları
- [ ] Ortaklık anlaşmaları
- [ ] Influencer kampanyaları
- [ ] Offline etkinlikler

---

**Son Güncelleme:** 17 Ocak 2026
