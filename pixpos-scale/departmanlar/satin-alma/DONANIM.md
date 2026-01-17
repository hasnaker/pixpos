# Satın Alma Ekibi - Donanım ve Tedarik

Square donanım modeli ve Türkiye için tedarik stratejisi.

---

## 📊 Square Donanım Fiyatları (ABD)

| Cihaz | Fiyat (USD) | Fiyat (TRY)* | Taksit |
|-------|-------------|--------------|--------|
| Square Register | $799 | ~₺25,000 | $39/ay × 24 ay |
| Square Handheld | $399 | ~₺12,500 | $37/ay × 12 ay |
| Square Terminal | $299 | ~₺9,400 | $27/ay × 12 ay |
| Square Stand | $149 | ~₺4,700 | $14/ay × 12 ay |
| Square Kiosk | $149 | ~₺4,700 | $14/ay × 12 ay |
| Square Reader (NFC) | $59 | ~₺1,850 | - |
| Square Reader (Mag) | FREE | ÜCRETSİZ | - |

*1 USD = ~31.5 TRY (Ocak 2026)

---

## 🇹🇷 Türkiye için Donanım Stratejisi

### Seçenek 1: Mevcut Donanım Desteği (Önerilen - Faz 1)

Türkiye'de zaten yaygın olan donanımları destekle:

| Kategori | Marka/Model | Fiyat Aralığı |
|----------|-------------|---------------|
| **Tablet** | iPad, Samsung Tab | ₺15,000 - ₺30,000 |
| **Android Tablet** | Lenovo, Huawei | ₺5,000 - ₺15,000 |
| **Fiş Yazıcısı** | Epson TM-T20, Star TSP | ₺2,000 - ₺5,000 |
| **Kasa Çekmecesi** | Maken, Posiflex | ₺500 - ₺1,500 |
| **Barkod Okuyucu** | Honeywell, Zebra | ₺500 - ₺2,000 |
| **Müşteri Ekranı** | Posiflex, Partner | ₺1,500 - ₺4,000 |

**Avantajlar:**
- Hızlı başlangıç
- Düşük yatırım
- Mevcut tedarik zinciri
- Servis ağı hazır

---

### Seçenek 2: PIXPOS Branded Donanım (Faz 2-3)

Square gibi kendi markalı donanım:

| Cihaz | Hedef Fiyat | Tedarik |
|-------|-------------|---------|
| PIXPOS Register | ₺15,000 | Çin OEM |
| PIXPOS Terminal | ₺8,000 | Çin OEM |
| PIXPOS Stand | ₺3,000 | Çin OEM |
| PIXPOS Reader | ₺1,000 | Çin OEM |

**Potansiyel Tedarikçiler:**
- Sunmi (Çin) - POS terminalleri
- Telpo (Çin) - Android POS
- PAX (Çin) - Ödeme terminalleri
- Newland (Çin) - Barkod okuyucular

---

## 🖨️ Yazıcı Uyumluluğu

### Desteklenmesi Gereken Yazıcılar

**Termal Fiş Yazıcıları:**
| Marka | Model | Bağlantı | Fiyat |
|-------|-------|----------|-------|
| Epson | TM-T20III | USB, Ethernet | ₺3,500 |
| Epson | TM-T88VI | USB, Ethernet, BT | ₺5,000 |
| Star | TSP143III | USB, Ethernet | ₺3,000 |
| Star | mC-Print3 | USB, BT, WiFi | ₺4,500 |
| Bixolon | SRP-350III | USB, Ethernet | ₺2,500 |

**Mutfak Yazıcıları:**
| Marka | Model | Özellik | Fiyat |
|-------|-------|---------|-------|
| Epson | TM-T20III | Standart | ₺3,500 |
| Star | SP700 | Impact (gürültülü ortam) | ₺4,000 |

**Etiket Yazıcıları:**
| Marka | Model | Kullanım | Fiyat |
|-------|-------|----------|-------|
| Zebra | ZD220 | Barkod etiketi | ₺3,000 |
| Brother | QL-820NWB | Adres etiketi | ₺2,500 |

---

## 📱 Tablet Gereksinimleri

### Minimum Gereksinimler

| Özellik | Minimum | Önerilen |
|---------|---------|----------|
| İşletim Sistemi | iOS 15+ / Android 10+ | iOS 17+ / Android 13+ |
| RAM | 3 GB | 4+ GB |
| Depolama | 32 GB | 64+ GB |
| Ekran | 8 inç | 10+ inç |
| Bağlantı | WiFi | WiFi + LTE |
| Batarya | 5000 mAh | 7000+ mAh |

### Önerilen Modeller

**iOS (Premium):**
| Model | Fiyat | Özellik |
|-------|-------|---------|
| iPad 10. nesil | ₺18,000 | 10.9", A14 |
| iPad Air M2 | ₺28,000 | 10.9", M2 |
| iPad Pro 11" | ₺40,000 | 11", M4 |

**Android (Ekonomik):**
| Model | Fiyat | Özellik |
|-------|-------|---------|
| Samsung Tab A9+ | ₺8,000 | 11", Snapdragon |
| Lenovo Tab M10 | ₺5,000 | 10.1", MediaTek |
| Xiaomi Pad 6 | ₺10,000 | 11", Snapdragon |

---

## 💳 Ödeme Terminalleri

### Türkiye'de Yaygın Terminaller

| Marka | Model | Bağlantı | Fiyat |
|-------|-------|----------|-------|
| Ingenico | Move 5000 | 4G, WiFi, BT | ₺3,000 |
| Verifone | V240m | 4G, WiFi | ₺2,500 |
| PAX | A920 | 4G, WiFi, BT | ₺4,000 |
| Sunmi | P2 | 4G, WiFi | ₺3,500 |

**Not:** Türkiye'de ödeme terminalleri bankalar tarafından sağlanır. PIXPOS entegrasyonu için banka API'leri kullanılmalı.

---

## 🏭 OEM Tedarikçiler

### Çin Tedarikçiler

| Firma | Ürünler | Minimum Sipariş | İletişim |
|-------|---------|-----------------|----------|
| Sunmi | Android POS, Yazıcı | 100 adet | sunmi.com |
| Telpo | Tablet POS, Kiosk | 50 adet | telpo.com |
| Rongta | Yazıcılar | 100 adet | rongtatech.com |
| Newland | Barkod okuyucu | 100 adet | newlandaidc.com |

### Türkiye Distribütörler

| Firma | Ürünler | Şehir |
|-------|---------|-------|
| Posiflex Türkiye | POS donanım | İstanbul |
| Datalogic Türkiye | Barkod | İstanbul |
| Epson Türkiye | Yazıcı | İstanbul |
| Star Micronics | Yazıcı | İstanbul |

---

## 📦 Paket Önerileri

### Başlangıç Paketi (₺10,000)

| Ürün | Fiyat |
|------|-------|
| Android Tablet (Lenovo Tab M10) | ₺5,000 |
| Termal Yazıcı (Bixolon) | ₺2,500 |
| Kasa Çekmecesi | ₺1,000 |
| Tablet Standı | ₺500 |
| Kurulum + Eğitim | ₺1,000 |
| **TOPLAM** | **₺10,000** |

### Standart Paket (₺20,000)

| Ürün | Fiyat |
|------|-------|
| iPad 10. nesil | ₺18,000 |
| Epson TM-T20III | ₺3,500 |
| Kasa Çekmecesi | ₺1,000 |
| iPad Standı (Square Stand benzeri) | ₺2,000 |
| Barkod Okuyucu | ₺1,000 |
| Kurulum + Eğitim | ₺1,500 |
| **TOPLAM** | **₺27,000** → **₺20,000** (paket indirimi) |

### Premium Paket (₺40,000)

| Ürün | Fiyat |
|------|-------|
| iPad Pro 11" | ₺40,000 |
| Epson TM-T88VI | ₺5,000 |
| Kasa Çekmecesi (Premium) | ₺1,500 |
| iPad Standı (Premium) | ₺3,000 |
| Barkod Okuyucu (Kablosuz) | ₺2,000 |
| Müşteri Ekranı | ₺3,000 |
| Mutfak Yazıcısı | ₺3,500 |
| Kurulum + Eğitim | ₺2,000 |
| **TOPLAM** | **₺60,000** → **₺40,000** (paket indirimi) |

---

## 💰 Taksit Modeli

Square'in taksit modeli:
- APR: %15
- Süreler: 3, 6, 12, 24 ay

**PIXPOS için öneri:**
- Banka taksiti (0-12 ay)
- Kiralama modeli (aylık ₺500-1,500)
- Leasing (24-36 ay)

---

## 📋 Tedarik Checklist

### Faz 1 (Mevcut)
- [x] Yazıcı entegrasyonu (Epson, Star)
- [ ] Kasa çekmecesi entegrasyonu
- [ ] Barkod okuyucu entegrasyonu
- [ ] Müşteri ekranı entegrasyonu

### Faz 2 (Q2 2026)
- [ ] Tablet standı tedarik anlaşması
- [ ] Paket fiyatlandırma
- [ ] E-ticaret satış sayfası

### Faz 3 (Q4 2026)
- [ ] OEM donanım görüşmeleri
- [ ] PIXPOS branded ürünler
- [ ] Garanti programı

---

**Son Güncelleme:** 17 Ocak 2026
