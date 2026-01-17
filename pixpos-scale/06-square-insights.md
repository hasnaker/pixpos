# Square İş Modeli ve Stratejik Çıkarımlar

**Amaç:** PIXPOS'un "Türkiye'nin Square'i" olması için kopyalanacak stratejiler  
**Tarih:** 17 Ocak 2026

---

## 1. İŞ MODELİ

### Gelir Kaynakları

| Kaynak | Açıklama | Square Oranı |
|--------|----------|--------------|
| **İşlem Ücreti** | Her ödemeden komisyon | %2.6 + $0.10 (yüz yüze) |
| **Online İşlem** | E-ticaret ödemeleri | %2.9 + $0.30 |
| **Manuel Giriş** | Kart numarası ile | %3.5 + $0.15 |
| **Fatura** | Invoice ödemeleri | %3.3 + $0.30 |
| **Donanım Satışı** | Register, Terminal, Reader | $59 - $799 |
| **Abonelik (Plus)** | Gelişmiş özellikler | $60/ay |
| **Abonelik (Premium)** | Enterprise | Custom |

### Freemium Stratejisi

```
FREE TIER:
├── POS yazılımı (sınırsız)
├── Online mağaza
├── Faturalama
├── Temel raporlar
├── Tüm add-ons
└── Müşteri desteği

PLUS TIER ($60/ay):
├── Gelişmiş raporlar
├── 24/7 destek
├── Kurs yönetimi (restoran)
├── Düşük işlem ücreti (%2.5)
└── Öncelikli özellikler

PREMIUM TIER (Custom):
├── $250K+ yıllık işlem
├── En düşük işlem ücreti (%2.4)
├── Dedicated account manager
└── Özel entegrasyonlar
```

### PIXPOS için Fiyatlandırma Önerisi

| Plan | Fiyat | İşlem Ücreti | Hedef |
|------|-------|--------------|-------|
| Free | ₺0 | %2.5 + ₺0.50 | Küçük işletme |
| Plus | ₺500/ay | %2.0 + ₺0.40 | Orta işletme |
| Premium | Custom | %1.5 + ₺0.30 | Zincir/Enterprise |

---

## 2. PAZARLAMA TAKTİKLERİ

### 2.1 Referral Program (Viral Growth)

**Square Modeli:**
- Referans gönderen: ₺1,000 ücretsiz işlem
- Yeni kullanıcı: ₺1,000 ücretsiz işlem
- 180 gün içinde kullanılmalı
- KYC (kimlik doğrulama) gerekli

**Neden Etkili:**
- İki taraflı ödül (win-win)
- Ücretsiz işlem = gerçek para değeri
- KYC ile sahte hesap önleme
- Süre limiti ile aciliyet yaratma

**PIXPOS için:**
```
Referans Programı:
- Gönderen: ₺500 ücretsiz işlem
- Yeni kullanıcı: ₺500 ücretsiz işlem
- 90 gün geçerlilik
- Minimum 1 işlem yapılmış olmalı
```

### 2.2 Gamification (Setup Progress)

**Square Modeli:**
- "You're 83% set up" progress bar
- Adım adım checklist
- Her adım tamamlandığında görsel feedback
- "Congratulations! You're all set" kutlama

**Psikolojik Etki:**
- Tamamlama dürtüsü (completion bias)
- Küçük kazanımlar = dopamin
- Kullanıcı bağlılığı artışı

**PIXPOS için:**
```
Onboarding Checklist:
□ Hesap oluştur (10%)
□ İşletme bilgileri (20%)
□ Logo yükle (30%)
□ İlk ürünü ekle (50%)
□ Vergi ayarla (60%)
□ Yazıcı bağla (70%)
□ İlk satışı yap (100%) 🎉
```

### 2.3 Empty States (Boş Ekran Tasarımı)

**Square Modeli:**
Her boş ekranda:
1. Açıklayıcı ikon
2. Başlık (ne yapılacak)
3. Açıklama (neden önemli)
4. CTA butonu (nasıl başlanır)
5. "Learn more" linki

**Örnek:**
```
[📋 İkon]
"No items yet"
"Create items to speed up checkout and track inventory."
[Create an item] [Import items]
Learn more about items →
```

### 2.4 Suggest a Feature (Feedback Loop)

**Square Modeli:**
- Support menüsünde "Suggest a feature"
- Kullanıcı önerileri toplama
- Roadmap'e input
- Kullanıcı bağlılığı

**PIXPOS için:**
- In-app feedback butonu
- Upvote sistemi (en çok istenen özellikler)
- Public roadmap sayfası

### 2.5 Free Add-ons Stratejisi

**Square Modeli:**
Tüm eklentiler ücretsiz:
- Cash Management
- Email Marketing
- Gift Cards
- Team Management
- Payment Links
- Subscriptions

**Neden:**
- Daha fazla özellik = daha fazla kullanım
- Daha fazla kullanım = daha fazla işlem
- Daha fazla işlem = daha fazla komisyon

**Gerçek Gelir:** İşlem ücretinden

---

## 3. ÖZELLİKLER (Features)

### 3.1 AI Entegrasyonu

**Square'de:**
- OpenAI ile ürün açıklaması oluşturma
- "Generate description" butonu
- Birkaç kelime gir → AI açıklama üretir

**PIXPOS için:**
```javascript
// Bedrock Claude ile ürün açıklaması
const generateDescription = async (productName, keywords) => {
  const prompt = `${productName} için kısa, çekici bir ürün açıklaması yaz. 
  Anahtar kelimeler: ${keywords}`;
  return await bedrock.invoke(prompt);
};
```

### 3.2 Auto Create (Barkod ile Ürün Oluşturma)

**Square'de:**
- Kamera ile barkod tara
- Square veritabanından ürün bilgisi çek
- İsim, açıklama, görsel otomatik doldur

**PIXPOS için:**
- Trendyol/Hepsiburada API entegrasyonu
- GS1 Türkiye veritabanı
- Kendi ürün veritabanı oluşturma

### 3.3 Image Library (Merkezi Görsel Yönetimi)

**Square'de:**
- Tüm görseller tek yerde
- Drag & drop upload
- Otomatik boyut optimizasyonu
- Ürünlere görsel atama

**PIXPOS için:**
- S3 bucket (zaten var)
- CloudFront CDN (zaten var)
- Görsel kütüphanesi UI gerekli

### 3.4 Multi-Channel (Çok Kanallı Satış)

**Square'de:**
- Aynı ürün: POS + Online + Kiosk
- Kanal bazlı fiyatlandırma
- Kanal bazlı stok
- Tek envanter yönetimi

**PIXPOS için:**
```
Kanallar:
├── POS (kasada)
├── QR Menü (masada)
├── Online Sipariş (web)
├── Kiosk (self-servis)
└── Getir/Yemeksepeti (entegrasyon)
```

### 3.5 Subscription Plans (Abonelik Satışı)

**Square'de:**
- Recurring billing
- Aylık/haftalık/yıllık
- Otomatik yenileme
- İptal/dondurma

**PIXPOS Kullanım Alanları:**
- Kahve aboneliği (ayda 30 kahve)
- VIP üyelik (indirimli fiyatlar)
- Kurumsal anlaşmalar

### 3.6 Modifiers vs Options

**Fark:**
| Özellik | Modifiers | Options |
|---------|-----------|---------|
| Amaç | Özelleştirme | Varyasyon |
| Stok | Etkilemez | Ayrı stok |
| SKU | Aynı | Farklı |
| Örnek | Ekstra sos | Kırmızı/Mavi |

### 3.7 Tax Rules (Vergi Kuralları)

**Square'de:**
- Koşullu vergi muafiyeti
- Fiyat bazlı kurallar
- Miktar bazlı kurallar
- Lokasyon bazlı vergiler

**Örnek:**
```
Kural: "Küçük Alışveriş Muafiyeti"
Koşul: Toplam < ₺50
Sonuç: KDV muaf
```

### 3.8 Location Cloning

**Square'de:**
- Yeni şube açarken mevcut lokasyondan kopyala
- Ürünler, modifiers, vergiler, ayarlar
- Tek tıkla şube çoğaltma

**PIXPOS için:**
```sql
-- Lokasyon klonlama
INSERT INTO products (location_id, name, price, ...)
SELECT new_location_id, name, price, ...
FROM products
WHERE location_id = source_location_id;
```

---

## 4. UX/UI PATTERNLERİ

### 4.1 Mode Sistemi

**Square'de:**
- Tek uygulama, farklı modlar
- Standard, Restaurant, Retail, Beauty, Services
- Mod değiştirme kolay
- Özelleştirilebilir mod profilleri

**PIXPOS için:**
```
Modlar:
├── Restoran Modu (masa yönetimi, mutfak)
├── Kafe Modu (hızlı satış, sıra)
├── Bar Modu (tab sistemi)
├── Perakende Modu (barkod, stok)
└── Hizmet Modu (randevu, süre)
```

### 4.2 Quick Actions

**Square'de:**
- Dashboard'da hızlı erişim
- "Add an item", "Take payment"
- Sık kullanılan işlemler ön planda

### 4.3 Search Everywhere

**Square'de:**
- Her ekranda arama
- Global search (tüm sistemde)
- Ayarlarda arama
- Ürünlerde arama

### 4.4 Inline Editing

**Square'de:**
- Tabloda direkt düzenleme
- Modal açmadan değişiklik
- Hızlı güncelleme

### 4.5 Bulk Actions

**Square'de:**
- CSV import/export
- Toplu ürün güncelleme
- Toplu fiyat değişikliği

---

## 5. TEKNİK ALTYAPI

### 5.1 Offline Capability

**Square'de:**
- İnternet kesilse de ödeme al
- 24 saat içinde sync
- Local storage + queue

**PIXPOS için:**
```javascript
// Service Worker + IndexedDB
const offlineQueue = [];

const processPayment = async (payment) => {
  if (navigator.onLine) {
    return await api.processPayment(payment);
  } else {
    offlineQueue.push(payment);
    await saveToIndexedDB(payment);
    return { status: 'queued', syncRequired: true };
  }
};
```

### 5.2 Real-time Sync

**Square'de:**
- Tüm cihazlara anlık sync
- Vergi değişikliği → tüm POS'lara
- Ürün güncelleme → anında yansıma

**PIXPOS için:**
- WebSocket (zaten var)
- Event-driven architecture
- Optimistic updates

### 5.3 System Status Page

**Square'de:**
- Servis durumu sayfası
- Uptime monitoring
- Incident history
- Maintenance bildirimleri

**PIXPOS için:**
- status.pixpos.cloud
- AWS CloudWatch entegrasyonu
- Statuspage.io veya benzeri

---

## 6. AÇIK KAYNAK KÜTÜPHANELER

Square'in kullandığı ve PIXPOS'ta kullanılabilecek:

| Kütüphane | Amaç | Alternatif |
|-----------|------|------------|
| Protobuf | API iletişimi | JSON (mevcut) |
| Branch | Deep linking | Firebase Dynamic Links |
| SocketScan SDK | Barkod tarayıcı | ZXing, QuaggaJS |

---

## 7. YASAL & UYUMLULUK

### 7.1 KYC (Know Your Customer)

**Square'de:**
- Ödül almak için kimlik doğrulama
- İşletme doğrulama
- Banka hesabı doğrulama

**PIXPOS için:**
- TC Kimlik doğrulama (Mernis)
- Vergi levhası doğrulama
- IBAN doğrulama

### 7.2 GDPR / KVKK

**Square'de:**
- Information Requests menüsü
- Veri silme talepleri
- Veri export

**PIXPOS için:**
- KVKK uyumlu veri yönetimi
- Müşteri veri silme endpoint'i
- Veri taşınabilirlik

### 7.3 PCI DSS

**Square'de:**
- Security Compliance Version: 1.0
- End-to-end encryption
- Tokenization

**PIXPOS için:**
- Kart bilgisi saklamama
- Payment gateway kullanımı (iyzico, PayTR)
- SSL/TLS zorunlu

---

## 8. ROADMAP ÖNERİSİ

### Faz 1 (Mevcut - Q1 2026)
- ✅ Temel POS
- ✅ Mutfak ekranı
- ✅ QR Menü
- ✅ Multi-location (temel)

### Faz 2 (Q2 2026)
- [ ] Referral program
- [ ] Setup progress gamification
- [ ] AI ürün açıklaması
- [ ] Image library

### Faz 3 (Q3 2026)
- [ ] Online sipariş
- [ ] Payment links
- [ ] Subscription plans
- [ ] Email marketing

### Faz 4 (Q4 2026)
- [ ] Kiosk modu
- [ ] Offline payments
- [ ] Gift cards
- [ ] Advanced reporting

---

## 9. KPI'LAR

Square'in takip ettiği metrikler:

| Metrik | Açıklama |
|--------|----------|
| GMV | Gross Merchandise Volume |
| Take Rate | İşlem ücreti oranı |
| MAU | Monthly Active Users |
| Churn Rate | Müşteri kaybı |
| NPS | Net Promoter Score |
| ARPU | Average Revenue Per User |

**PIXPOS için hedefler:**
- GMV: ₺10M/ay (2026 sonu)
- MAU: 500 işletme
- Churn: <%5/ay
- NPS: >50
