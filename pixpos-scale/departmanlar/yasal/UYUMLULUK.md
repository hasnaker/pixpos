# Yasal Ekibi - Uyumluluk ve Sözleşmeler

PIXPOS için yasal gereksinimler ve uyumluluk.

---

## 🇹🇷 Türkiye Yasal Gereksinimleri

### 1. KVKK (Kişisel Verilerin Korunması)

**Zorunlu Belgeler:**
| Belge | Açıklama | Durum |
|-------|----------|-------|
| Aydınlatma Metni | Veri işleme bildirimi | Gerekli |
| Açık Rıza Metni | Pazarlama izni | Gerekli |
| KVKK Politikası | Detaylı politika | Gerekli |
| VERBİS Kaydı | Veri sorumlusu kaydı | Gerekli |
| Veri İşleme Sözleşmesi | Alt işleyici sözleşmesi | Gerekli |

**Veri Kategorileri:**
| Kategori | Örnekler | Saklama Süresi |
|----------|----------|----------------|
| Kimlik | Ad, soyad, TC | Hesap aktif + 10 yıl |
| İletişim | Telefon, e-posta | Hesap aktif + 10 yıl |
| Finansal | Banka, kart | İşlem + 10 yıl |
| İşlem | Satış, ödeme | 10 yıl |
| Lokasyon | Adres | Hesap aktif |

**Veri Sahibi Hakları:**
- Bilgi edinme
- Düzeltme talep etme
- Silme talep etme
- İşlemeyi durdurma
- Veri taşınabilirliği
- İtiraz hakkı

---

### 2. Elektronik Ticaret (6563 Sayılı Kanun)

**Gereksinimler:**
| Gereksinim | Açıklama |
|------------|----------|
| Ticari İletişim | Pazarlama izni zorunlu |
| Sipariş Onayı | Elektronik onay |
| Cayma Hakkı | 14 gün (hizmetlerde farklı) |
| Bilgilendirme | Fiyat, vergi, teslimat |

---

### 3. Ödeme Hizmetleri (6493 Sayılı Kanun)

**BDDK Lisansı:**
| Lisans Türü | Gereksinim | PIXPOS |
|-------------|------------|--------|
| Ödeme Kuruluşu | Ödeme işleme | Gerekli değil* |
| Elektronik Para | E-para ihracı | Gerekli değil |

*PIXPOS ödeme işlemez, sadece POS yazılımı sağlar. Ödeme işleme iş ortağı (Iyzico, PayTR vb.) üzerinden yapılır.

---

### 4. Vergi Mevzuatı

**e-Fatura / e-Arşiv:**
| Gereksinim | Açıklama |
|------------|----------|
| e-Fatura | B2B zorunlu (belirli ciro üstü) |
| e-Arşiv | B2C zorunlu |
| GİB Entegrasyonu | Gelir İdaresi entegrasyonu |
| ÖKC | Ödeme kaydedici cihaz |

**ÖKC Uyumluluğu:**
- PIXPOS, ÖKC ile entegre çalışmalı
- Veya onaylı yazarkasa yazılımı olmalı
- GİB onayı gerekli

---

### 5. Tüketici Hakları

**Zorunlu Bilgiler:**
| Bilgi | Nerede |
|-------|--------|
| Satıcı bilgileri | Fiş, web sitesi |
| Fiyat (KDV dahil) | Menü, fiş |
| İade politikası | Fiş, web sitesi |
| Şikayet hattı | Fiş, web sitesi |

---

## 📄 Sözleşmeler

### 1. Kullanıcı Sözleşmesi (Terms of Service)

**İçerik:**
- Hizmet tanımı
- Kullanım koşulları
- Ücretlendirme
- Sorumluluk sınırları
- Fikri mülkiyet
- Fesih koşulları
- Uyuşmazlık çözümü

**Önemli Maddeler:**
```
1. Hizmet Kapsamı
   - POS yazılımı lisansı
   - Bulut depolama
   - Teknik destek
   
2. Ücretlendirme
   - İşlem komisyonu: %X
   - Aylık ücret: ₺X (Plus/Premium)
   - Donanım: Ayrı fiyatlandırma
   
3. Sorumluluk Sınırı
   - Maksimum: Son 12 ay ödenen tutar
   - Dolaylı zararlar hariç
   
4. Fesih
   - 30 gün önceden bildirim
   - Veri dışa aktarma hakkı
```

---

### 2. Gizlilik Politikası (Privacy Policy)

**İçerik:**
- Toplanan veriler
- Kullanım amaçları
- Paylaşım koşulları
- Saklama süreleri
- Güvenlik önlemleri
- Kullanıcı hakları
- İletişim bilgileri

---

### 3. Veri İşleme Sözleşmesi (DPA)

**Alt İşleyiciler:**
| Şirket | Hizmet | Lokasyon |
|--------|--------|----------|
| AWS | Bulut altyapı | Frankfurt |
| Iyzico | Ödeme işleme | Türkiye |
| SendGrid | E-posta | ABD |
| Twilio | SMS | ABD |

**Veri Transferi:**
- AB: GDPR uyumlu
- ABD: SCCs (Standard Contractual Clauses)
- Türkiye: KVKK uyumlu

---

### 4. İş Ortağı Sözleşmeleri

**Ödeme Ortağı (Iyzico/PayTR):**
- Komisyon paylaşımı
- Teknik entegrasyon
- Destek sorumlulukları
- SLA

**Donanım Tedarikçisi:**
- Garanti koşulları
- İade politikası
- Teknik destek
- Fiyatlandırma

---

## 🔒 Güvenlik Uyumluluğu

### PCI DSS

**Gereksinim:**
- Kart verisi işlenmiyorsa: SAQ A
- Kart verisi işleniyorsa: SAQ D

**PIXPOS Yaklaşımı:**
- Kart verisi PIXPOS'ta saklanmaz
- Ödeme ortağı (Iyzico) PCI DSS uyumlu
- Tokenization kullanılır

---

### ISO 27001

**Hedef:** Q4 2026 sertifikasyon

**Gereksinimler:**
- Bilgi güvenliği politikası
- Risk değerlendirmesi
- Erişim kontrolü
- Şifreleme
- İş sürekliliği
- Denetim

---

## 📋 Uyumluluk Checklist

### Lansman Öncesi (Zorunlu)

- [ ] KVKK Aydınlatma Metni
- [ ] KVKK Açık Rıza Metni
- [ ] Kullanıcı Sözleşmesi
- [ ] Gizlilik Politikası
- [ ] Çerez Politikası
- [ ] VERBİS Kaydı
- [ ] Ödeme ortağı sözleşmesi
- [ ] e-Arşiv entegrasyonu

### Lansman Sonrası (6 ay içinde)

- [ ] ISO 27001 hazırlık
- [ ] PCI DSS SAQ
- [ ] Penetrasyon testi
- [ ] KVKK denetimi
- [ ] Sigorta (siber güvenlik)

---

## ⚖️ Risk Değerlendirmesi

### Yasal Riskler

| Risk | Olasılık | Etki | Önlem |
|------|----------|------|-------|
| KVKK ihlali | Orta | Yüksek | Uyumluluk programı |
| Veri sızıntısı | Düşük | Çok Yüksek | Güvenlik önlemleri |
| Sözleşme ihtilafı | Orta | Orta | Net sözleşmeler |
| Vergi uyumsuzluğu | Düşük | Yüksek | Muhasebe danışmanlığı |

---

## 📞 Yasal Danışmanlar

### Gerekli Uzmanlıklar

| Alan | Gereksinim |
|------|------------|
| Teknoloji Hukuku | KVKK, e-ticaret |
| Finans Hukuku | Ödeme hizmetleri |
| Vergi Hukuku | e-Fatura, ÖKC |
| Fikri Mülkiyet | Marka, patent |

---

**Son Güncelleme:** 17 Ocak 2026
