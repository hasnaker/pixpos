# 🗺️ MEGA POS - PROJE HARİTASI VE ENTEGRASYON STRATEJİSİ

## 🎯 Genel Bakış

Bu döküman, Mega POS ekosistemindeki **mevcut projeler** ve **yeni geliştirilecek projeler**i net bir şekilde tanımlar.

---

## ✅ MEVCUT HSD PROJELERİ (API Entegrasyonu)

### 1. 👥 İnsan Kaynakları Yazılımı
**Durum:** Mevcut, çalışıyor
**Entegrasyon:** API ile bağlanacak
**Mega POS'a Sağladığı:**
- Personel bilgileri
- İzin/devamsızlık kayıtları
- Performans verileri
- Disiplin işlemleri

**API Endpoint Örnekleri:**
```typescript
GET  /api/hr/employees          // Personel listesi
GET  /api/hr/employees/:id      // Personel detayı
GET  /api/hr/leaves             // İzin kayıtları
GET  /api/hr/performance/:id    // Performans verileri
POST /api/hr/attendance         // Devam kaydı
```

**Mega POS'tan Gönderilecek:**
- Çalışma saatleri (vardiya)
- Satış performansı (garson/kasiyer)
- Müşteri memnuniyeti skorları

---

### 2. 🧾 Muhasebe Yazılımı
**Durum:** Mevcut, çalışıyor
**Entegrasyon:** API ile bağlanacak
**Mega POS'a Sağladığı:**
- Hesap planı
- Cari hesaplar
- Bütçe bilgileri
- Mali raporlar

**API Endpoint Örnekleri:**
```typescript
GET  /api/accounting/accounts        // Hesap planı
POST /api/accounting/entries         // Muhasebe kaydı
GET  /api/accounting/suppliers       // Tedarikçi listesi
POST /api/accounting/invoices        // Fatura kaydı
GET  /api/accounting/reports/pl      // Kâr-zarar
```

**Mega POS'tan Gönderilecek:**
- Satış kayıtları (gelir)
- Gider kayıtları
- Stok hareketleri
- Kasa hareketleri
- Tedarikçi ödemeleri

---

### 3. ⏰ PDKS Yazılımı
**Durum:** Mevcut, çalışıyor
**Entegrasyon:** API ile bağlanacak
**Mega POS'a Sağladığı:**
- Giriş/çıkış kayıtları
- Mesai süreleri
- Geç gelme/erken çıkış
- Vardiya bilgileri

**API Endpoint Örnekleri:**
```typescript
GET  /api/pdks/attendance/:employeeId/:date  // Devam kaydı
GET  /api/pdks/shifts                        // Vardiya listesi
POST /api/pdks/checkin                       // Giriş kaydı
POST /api/pdks/checkout                      // Çıkış kaydı
GET  /api/pdks/overtime/:employeeId          // Mesai fazlası
```

**Mega POS'tan Gönderilecek:**
- Vardiya planlaması
- Çalışma saatleri (POS'tan giriş/çıkış)
- Performans verileri

---

### 4. 🧠 Clinisyn (Psikoloji Platformu)
**Durum:** Mevcut, çalışıyor (6M APA makalesi)
**Entegrasyon:** API ile bağlanacak
**Mega POS'a Sağladığı:**
- Psikolojik ürün önerisi
- Müşteri profil analizi
- Personel psikolojik değerlendirme

**API Endpoint Örnekleri:**
```typescript
POST /api/clinisyn/recommend-product    // Ürün önerisi
POST /api/clinisyn/analyze-customer     // Müşteri analizi
POST /api/clinisyn/assess-employee      // Personel değerlendirme
GET  /api/clinisyn/psychological-tests  // Ölçek listesi
```

**Kullanım Senaryosu:**
```
Müşteri QR menüde ürün seçiyor
↓
Mega POS kısa anket gösterir (5 soru)
↓
Clinisyn API'ye gönderir
↓
Psikolojik profil + ürün önerisi döner
↓
"Size özel: Çikolatalı Waffle (Dopamin artırıcı)"
```

**Mega POS'tan Gönderilecek:**
- Müşteri sipariş geçmişi
- Tercih verileri
- Anket cevapları

---

### 5. 📄 Evraktar (Dijital Evrak Yönetimi)
**Durum:** Mevcut, çalışıyor
**Entegrasyon:** API ile bağlanacak
**Mega POS'a Sağladığı:**
- İşe giriş evrakları
- Tutanak üretimi (geç gelme, disiplin)
- İmzalı belge sistemi
- Dijital arşiv

**API Endpoint Örnekleri:**
```typescript
POST /api/evraktar/generate-document    // Belge oluştur
POST /api/evraktar/sign-document        // Belge imzala
GET  /api/evraktar/documents/:id        // Belge getir
GET  /api/evraktar/archive              // Arşiv listesi
POST /api/evraktar/upload               // Belge yükle
```

**Kullanım Senaryosu:**
```
Personel geç geldi (PDKS'den tespit)
↓
Mega POS Evraktar'a istek gönderir
↓
Evraktar tutanak oluşturur
↓
Personel mobil uygulamadan imzalar
↓
Otomatik arşivlenir
```

**Mega POS'tan Gönderilecek:**
- Personel bilgileri
- Olay detayları (geç gelme, disiplin)
- İmza talepleri

---

## 🆕 YENİ GELİŞTİRİLECEK PROJELER

### 1. ⚡ IoT Takip Sistemi (YENİ PROJE)
**Durum:** Geliştirilecek
**Neden Yeni Proje:** Mevcut HSD projelerinde yok
**Kapsam:**
- Elektrik tüketimi takibi
- Su tüketimi takibi
- Doğalgaz tüketimi takibi
- Makine bakım takibi
- Tedarikçi performans takibi

**Yaklaşım: Hibrit (Manuel + Otomatik)**

#### Seviye 1: Manuel Takip (₺0 donanım)
```
• Sayaç fotoğrafı + OCR
• Manuel sayı girişi
• Excel import
• Haftalık okuma
```

#### Seviye 2: Yarı Otomatik (₺5,000-15,000)
```
• Akıllı priz (TP-Link, Xiaomi)
• Basit sensörler
• Bluetooth/WiFi
• Günlük okuma
```

#### Seviye 3: Tam Otomatik (₺20,000-50,000)
```
• Schneider Electric PowerTag
• Profesyonel IoT sensörler
• LoRaWAN/Zigbee gateway
• Gerçek zamanlı (10 sn)
```

**Geliştirme Süresi:** 8 hafta
**Ekip:** 2 backend, 1 frontend, 1 IoT uzmanı

**API Endpoint Örnekleri:**
```typescript
POST /api/iot/reading/manual        // Manuel okuma kaydet
POST /api/iot/reading/ocr           // Fotoğraf yükle + OCR
GET  /api/iot/consumption/:type     // Tüketim verileri
GET  /api/iot/anomaly               // Anormallik tespiti
GET  /api/iot/forecast              // Tüketim tahmini
POST /api/iot/device/register       // IoT cihaz kaydet
```

---

### 2. 🤖 AI Agent Sistemi (YENİ PROJE)
**Durum:** Geliştirilecek
**Neden Yeni Proje:** Mevcut HSD projelerinde yok
**Kapsam:**
- Sesli yönetim asistanı
- Rezervasyon asistanı (Telefon + WhatsApp)
- Sosyal medya içerik üretimi
- Google yorumları otomatik yanıt
- Reklam optimizasyonu
- Satış tahmini (ML)

**Teknoloji Stack:**
```
• AWS Bedrock (Claude 3.5 Sonnet)
• AWS Transcribe (Türkçe STT)
• AWS Polly (Türkçe TTS)
• AWS SageMaker (ML modelleri)
• Twilio (Telefon)
• WhatsApp Business API
• Instagram Graph API
• Google Ads API
```

**Geliştirme Süresi:** 12 hafta
**Ekip:** 3 backend, 1 AI/ML uzmanı, 1 frontend

**API Endpoint Örnekleri:**
```typescript
POST /api/ai/voice/command          // Sesli komut işle
POST /api/ai/reservation/call       // Telefon rezervasyonu
POST /api/ai/social/generate-post   // Sosyal medya post
POST /api/ai/review/respond         // Yorum yanıtla
POST /api/ai/ads/optimize           // Reklam optimize et
GET  /api/ai/forecast/sales         // Satış tahmini
```

---

### 3. 📸 Gelişmiş Medya İşleme (YENİ PROJE)
**Durum:** Geliştirilecek
**Neden Yeni Proje:** Mevcut HSD projelerinde yok
**Kapsam:**
- Ürün fotoğraf optimizasyonu (AI)
- Video işleme (QR menü için)
- Otomatik arka plan kaldırma
- Görsel kalite artırma
- Video thumbnail oluşturma

**Teknoloji Stack:**
```
• AWS Rekognition (Görsel analiz)
• AWS Elemental (Video işleme)
• OpenCV (Görüntü işleme)
• FFmpeg (Video dönüştürme)
```

**Geliştirme Süresi:** 6 hafta
**Ekip:** 2 backend, 1 frontend

---

## 🔗 ENTEGRASYON MİMARİSİ

### Genel Akış

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MEGA POS (Merkez)                             │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    API GATEWAY                                │   │
│  │  (Authentication, Rate Limiting, Routing)                     │   │
│  └────────────────────────┬─────────────────────────────────────┘   │
│                           │                                          │
│         ┌─────────────────┼─────────────────┐                       │
│         ▼                 ▼                 ▼                       │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐               │
│  │   Mevcut    │   │    Yeni     │   │  Üçüncü     │               │
│  │  Projeler   │   │  Projeler   │   │   Taraf     │               │
│  └─────────────┘   └─────────────┘   └─────────────┘               │
└─────────────────────────────────────────────────────────────────────┘

MEVCUT PROJELER (API Entegrasyonu):
├── İK Yazılımı
├── Muhasebe Yazılımı
├── PDKS Yazılımı
├── Clinisyn (Psikoloji)
└── Evraktar (Dijital Evrak)

YENİ PROJELER (Geliştirilecek):
├── IoT Takip Sistemi
├── AI Agent Sistemi
└── Gelişmiş Medya İşleme

ÜÇÜNCÜ TARAF:
├── Getir, Yemeksepeti (Online sipariş)
├── Garanti BBVA, Yapı Kredi (POS)
├── Zirve, Logo, Mikro (Muhasebe)
├── Google Ads, Facebook Ads (Reklam)
└── WhatsApp Business, Instagram (İletişim)
```

---

## 📊 GELİŞTİRME ÖNCELİKLERİ

### Faz 1: MVP (14 Hafta) - Mevcut Projeler Entegrasyonu
```
Hafta 1-4:   Temel POS + QR Menü
Hafta 5-8:   Mutfak KDS + Masa Yönetimi
Hafta 9-12:  Stok + Raporlama
Hafta 13-14: Test + Queen Waffle Pilot

Entegrasyonlar:
✅ PDKS (Mesai takibi)
✅ Evraktar (Belge yönetimi)
```

### Faz 2: AI Agent (12 Hafta) - Yeni Proje
```
Hafta 15-18: Sesli yönetim + Rezervasyon
Hafta 19-22: Sosyal medya + Google yorumları
Hafta 23-26: Reklam optimizasyonu + ML

Entegrasyonlar:
✅ Clinisyn (Psikolojik öneriler)
```

### Faz 3: IoT Takip (8 Hafta) - Yeni Proje
```
Hafta 27-30: Manuel takip (OCR + Excel)
Hafta 31-34: Yarı otomatik (Akıllı priz)

Entegrasyonlar:
✅ Muhasebe (Gider kayıtları)
```

### Faz 4: Ölçekleme (Ongoing)
```
Hafta 35+:   Yeni müşteriler
             Yeni özellikler
             Optimizasyon

Entegrasyonlar:
✅ İK Yazılımı (Performans + Bordro)
✅ Tam otomatik IoT (Schneider)
```

---

## 💰 MALİYET TAHMİNİ

### Mevcut Projeler (API Entegrasyonu)
```
İK Yazılımı:        ₺0 (Mevcut)
Muhasebe:           ₺0 (Mevcut)
PDKS:               ₺0 (Mevcut)
Clinisyn:           ₺0 (Mevcut)
Evraktar:           ₺0 (Mevcut)
─────────────────────────
Entegrasyon Geliştirme: ₺50,000 (4 hafta, 2 dev)
```

### Yeni Projeler
```
IoT Takip:          ₺120,000 (8 hafta, 4 dev)
AI Agent:           ₺180,000 (12 hafta, 5 dev)
Medya İşleme:       ₺90,000 (6 hafta, 3 dev)
─────────────────────────
TOPLAM:             ₺390,000
```

### Donanım (Opsiyonel)
```
Manuel (Seviye 1):  ₺0
Yarı Otomatik:      ₺5,000-15,000
Tam Otomatik:       ₺20,000-50,000
```

---

## 🎯 BAŞARI KRİTERLERİ

### Mevcut Projeler Entegrasyonu
- ✅ API response time < 200ms
- ✅ Uptime > 99.9%
- ✅ Veri tutarlılığı %100
- ✅ Sıfır veri kaybı

### Yeni Projeler
- ✅ IoT: %95+ doğruluk (manuel), %99+ (otomatik)
- ✅ AI Agent: %90+ müşteri memnuniyeti
- ✅ Medya: %80+ kalite artışı

---

## 📞 PROJE SAHİPLERİ

### Mevcut Projeler
- **İK Yazılımı:** [Proje Sahibi]
- **Muhasebe:** [Proje Sahibi]
- **PDKS:** [Proje Sahibi]
- **Clinisyn:** [Proje Sahibi]
- **Evraktar:** [Proje Sahibi]

### Yeni Projeler
- **IoT Takip:** Mega POS Ekibi
- **AI Agent:** Mega POS Ekibi
- **Medya İşleme:** Mega POS Ekibi

---

**Özet:** 5 mevcut proje API ile entegre, 3 yeni proje geliştirilecek. Toplam maliyet: ₺440,000. Süre: 34 hafta.

---
*Son Güncelleme: 12 Ocak 2026*
*Versiyon: 1.0*
