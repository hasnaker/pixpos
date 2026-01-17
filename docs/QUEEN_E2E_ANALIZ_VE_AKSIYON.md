# Queen Waffle - E2E Sistem Analizi ve Aksiyon Planı

**Tarih:** 17 Ocak 2026  
**Kritiklik:** 🔴 YÜKSEK - Veri kaybı %0 garantisi gerekli

---

## 🎯 Queen Waffle Donanım Envanteri

| Cihaz | Adet | Kullanım | Uygulama |
|-------|------|----------|----------|
| 2 Ekranlı PC | 1 | Kasa | POS + Customer Display |
| Ingenico POS Cihazı | 1 | Kart ödemesi | OKC Entegrasyonu |
| Garson Tableti | 3 | Sipariş alma | Waiter App |
| Yazıcı | 3 | Mutfak + Fiş | Printer Integration |

---

## 📊 Mevcut Sistem Durumu

### ✅ Çalışan Özellikler

| Özellik | POS | Boss | Waiter | Kitchen | QR Menu |
|---------|-----|------|--------|---------|---------|
| Masa planı | ✅ | - | ✅ | - | - |
| Sipariş alma | ✅ | - | ✅ | - | - |
| Mutfağa gönder | ✅ | - | ✅ | ✅ | - |
| Sipariş hazır | - | - | - | ✅ | - |
| Ödeme (nakit) | ✅ | - | - | - | - |
| Ödeme (kart) | ⚠️ | - | - | - | - |
| Fiş yazdırma | ⚠️ | - | - | - | - |
| Ürün yönetimi | - | ✅ | - | - | - |
| Kategori yönetimi | - | ✅ | - | - | - |
| Masa yönetimi | - | ✅ | - | - | - |
| Raporlar | - | ✅ | - | - | - |
| Menü görüntüleme | - | - | - | - | ✅ |
| WebSocket sync | ✅ | ✅ | ✅ | ✅ | - |

### ⚠️ Sorunlu/Eksik Özellikler

| Sorun | Açıklama | Öncelik |
|-------|----------|---------|
| Yazıcı hatası | Test print hata veriyor | 🔴 Kritik |
| OKC/iyzico hatası | Kart ödeme çalışmıyor | 🔴 Kritik |
| Kullanıcı girişi | PIN ile giriş yok | 🟡 Önemli |
| Boss mobil | Telefon uyumlu değil | 🟡 Önemli |
| Müşteri ekranı | Display ayrı URL'de | 🟢 Normal |

---

## 🔧 Yazıcı Entegrasyonu Analizi

### Mevcut Yapı

```typescript
// apps/api/src/entities/printer.entity.ts
interface Printer {
  id: string;
  name: string;
  type: 'kitchen' | 'receipt';
  connectionType: 'tcp' | 'usb';
  ipAddress: string | null;
  port: number; // default 9100
  isActive: boolean;
}
```

### Queen'in 3 Yazıcısı İçin Yapılandırma

| Yazıcı | Tür | Bağlantı | IP/Port | Kullanım |
|--------|-----|----------|---------|----------|
| Yazıcı 1 | kitchen | tcp | 192.168.X.X:9100 | Mutfak siparişleri |
| Yazıcı 2 | kitchen | tcp | 192.168.X.X:9100 | Bar/İçecek |
| Yazıcı 3 | receipt | tcp/usb | 192.168.X.X:9100 | Kasa fişi |

### Yazıcı Hata Nedenleri (Olası)

1. **IP adresi yanlış** - Yazıcı IP'si değişmiş olabilir
2. **Port kapalı** - Firewall 9100 portunu engelliyor
3. **Yazıcı kapalı** - Fiziksel olarak kapalı
4. **Ağ sorunu** - Yazıcı farklı subnet'te
5. **USB sürücü** - USB yazıcı için sürücü eksik

### Çözüm Adımları

```bash
# 1. Yazıcı IP'sini bul (müşterinin ağında)
ping 192.168.1.100  # Örnek IP

# 2. Port açık mı kontrol et
telnet 192.168.1.100 9100

# 3. Test print gönder
echo "Test" | nc 192.168.1.100 9100
```

---

## 💳 OKC/iyzico Entegrasyonu Analizi

### Mevcut Yapı

```typescript
// apps/api/src/modules/okc/
// Ingenico POS cihazı entegrasyonu
```

### Ingenico Entegrasyon Gereksinimleri

| Gereksinim | Durum | Not |
|------------|-------|-----|
| iyzico API Key | ⬜ | Müşteriden alınacak |
| iyzico Secret Key | ⬜ | Müşteriden alınacak |
| Merchant ID | ⬜ | iyzico'dan alınacak |
| Ingenico Terminal ID | ⬜ | Cihaz üzerinde |
| Test modu | ⬜ | Önce test modunda dene |

### Hata Nedenleri (Olası)

1. **API anahtarları eksik** - iyzico credentials girilmemiş
2. **Terminal bağlı değil** - Ingenico cihazı bağlı değil
3. **Sandbox/Production** - Yanlış ortam seçili
4. **Sertifika sorunu** - SSL sertifikası

---

## 👥 Kullanıcı Yönetimi

### Mevcut Yapı

```typescript
// apps/api/src/entities/user.entity.ts
interface User {
  id: string;
  name: string;
  pin: string; // Hashed (bcrypt)
  role: 'admin' | 'manager' | 'cashier' | 'waiter';
  isActive: boolean;
  lastLoginAt: Date | null;
  avatarUrl: string | null;
}
```

### Queen İçin Kullanıcılar

| Kullanıcı | Rol | PIN | Cihaz |
|-----------|-----|-----|-------|
| Patron | admin | XXXX | Boss Panel |
| Kasiyer 1 | cashier | XXXX | POS |
| Garson 1 | waiter | XXXX | Tablet 1 |
| Garson 2 | waiter | XXXX | Tablet 2 |
| Garson 3 | waiter | XXXX | Tablet 3 |

### Eksik: PIN ile Giriş

POS ve Waiter uygulamalarında PIN ile giriş ekranı var mı kontrol edilmeli.

---

## 📱 Boss Panel Mobil Uyumluluk

### Mevcut Durum

Boss Panel web uygulaması, responsive tasarım eksik olabilir.

### Çözüm Seçenekleri

1. **Responsive CSS** - TailwindCSS ile mobil breakpoint'ler
2. **PWA** - Progressive Web App olarak kurulum
3. **Ayrı mobil app** - React Native/Capacitor (gelecek)

### Hızlı Çözüm (MVP için)

```css
/* Mobil için minimum düzeltmeler */
@media (max-width: 768px) {
  .sidebar { display: none; }
  .main-content { width: 100%; }
  .table-responsive { overflow-x: auto; }
}
```

---

## 🖥️ Müşteri Ekranı (Customer Display)

### Mevcut Yapı

```
POS: https://queen.pixpos.cloud/pos
Display: https://queen.pixpos.cloud/pos/display
```

### Kurulum

1. Ana ekranda POS açık
2. İkinci monitörde `/pos/display` açık
3. WebSocket ile senkronize

### Kontrol Edilecekler

- [ ] İkinci monitör algılanıyor mu?
- [ ] Display sayfası açılıyor mu?
- [ ] Sipariş eklenince güncelliyor mu?

---

## 🔄 Veri Güvenliği ve Migrasyon Stratejisi

### 🔴 KRİTİK: Veri Kaybı %0 Garantisi

Sistem büyüdüğünde Queen'in verileri korunmalı.

### Mevcut Veritabanı Yapısı

```sql
-- Mevcut tablolar (organization_id YOK)
categories, products, tables, zones, orders, 
order_items, payments, users, printers, settings
```

### Multi-tenant Migrasyon Planı

```sql
-- Faz 1: organization_id ekleme (BREAKING CHANGE YOK)
ALTER TABLE categories ADD COLUMN organization_id UUID;
ALTER TABLE products ADD COLUMN organization_id UUID;
ALTER TABLE tables ADD COLUMN organization_id UUID;
-- ... tüm tablolar

-- Faz 2: Queen için organization oluştur
INSERT INTO organizations (id, name, slug) 
VALUES ('queen-uuid', 'Queen Waffle', 'queen');

-- Faz 3: Mevcut verileri Queen'e ata
UPDATE categories SET organization_id = 'queen-uuid';
UPDATE products SET organization_id = 'queen-uuid';
-- ... tüm tablolar

-- Faz 4: NOT NULL constraint ekle
ALTER TABLE categories ALTER COLUMN organization_id SET NOT NULL;
```

### Migrasyon Sırası

1. **Şimdi:** Queen'i mevcut yapıyla kur
2. **1 ay içinde:** organization_id ekle (nullable)
3. **Migrasyon:** Mevcut verileri Queen org'a ata
4. **Sonra:** NOT NULL yap, yeni müşteriler ekle

### Veri Yedekleme

```bash
# Günlük otomatik yedek
pg_dump -h mega-pos-db.xxx.rds.amazonaws.com \
  -U megapos_user -d megapos \
  -F c -f backup_$(date +%Y%m%d).dump

# S3'e yükle
aws s3 cp backup_*.dump s3://pixpos-backups/queen/
```

---

## ✅ E2E Test Senaryoları (Queen için)

### Senaryo 1: Temel Sipariş Akışı

```
1. [POS] Masa 5'e tıkla
2. [POS] 2x Waffle, 1x Kahve ekle
3. [POS] "Mutfağa Gönder" tıkla
4. [Kitchen] Sipariş kartı görünsün
5. [Kitchen] "Hazır" tıkla
6. [POS] Bildirim gelsin
7. [POS] Ödeme al (nakit)
8. [Printer] Fiş yazdır
9. [POS] Masa boşalsın
```

### Senaryo 2: Garson Tablet Akışı

```
1. [Waiter] PIN ile giriş
2. [Waiter] Masa 3'e tıkla
3. [Waiter] 3x Çay ekle
4. [Waiter] "Gönder" tıkla
5. [Kitchen] Sipariş görünsün
6. [POS] Masa 3 dolu görünsün
```

### Senaryo 3: Kart Ödeme (OKC)

```
1. [POS] Masa seç, ödeme ekranına git
2. [POS] "Kart" seç
3. [Ingenico] Kart okut
4. [iyzico] İşlem onayla
5. [POS] Başarılı mesajı
6. [Printer] Fiş yazdır
```

### Senaryo 4: Hesap Bölme

```
1. [POS] Masa 7 (4 kişi, ₺400)
2. [POS] "Böl" tıkla
3. [POS] 2 kişiye böl (₺200 + ₺200)
4. [POS] İlk kişi nakit öde
5. [POS] İkinci kişi kart öde
6. [Printer] 2 ayrı fiş
```

---

## 🚀 Aksiyon Planı (Öncelik Sırasına Göre)

### 🔴 Bugün Yapılacaklar

| # | Aksiyon | Süre | Sorumlu |
|---|---------|------|---------|
| 1 | Yazıcı IP'lerini öğren | 10 dk | Müşteri |
| 2 | Yazıcı bağlantısını test et | 15 dk | Sen |
| 3 | iyzico credentials al | 5 dk | Müşteri |
| 4 | OKC entegrasyonunu test et | 20 dk | Sen |
| 5 | Kullanıcıları oluştur | 10 dk | Sen |
| 6 | E2E test yap | 30 dk | Sen |

### 🟡 Bu Hafta Yapılacaklar

| # | Aksiyon | Süre |
|---|---------|------|
| 1 | Boss Panel mobil düzeltmeleri | 2 saat |
| 2 | PIN ile giriş ekranı | 2 saat |
| 3 | Otomatik yedekleme kurulumu | 1 saat |
| 4 | Müşteri eğitimi | 1 saat |

### 🟢 1 Ay İçinde Yapılacaklar

| # | Aksiyon |
|---|---------|
| 1 | Multi-tenant altyapı (organization_id) |
| 2 | Queen verilerini migrate et |
| 3 | Yeni müşteri onboarding flow |

---

## 📞 Müşteriden Alınacak Bilgiler

### Hemen Şimdi

- [ ] Yazıcı 1 IP adresi: _______________
- [ ] Yazıcı 2 IP adresi: _______________
- [ ] Yazıcı 3 IP adresi: _______________
- [ ] Ingenico Terminal ID: _______________
- [ ] iyzico API Key: _______________
- [ ] iyzico Secret Key: _______________

### Kullanıcılar

- [ ] Patron adı: _______________
- [ ] Kasiyer adı: _______________
- [ ] Garson 1 adı: _______________
- [ ] Garson 2 adı: _______________
- [ ] Garson 3 adı: _______________

---

## 🎨 Tasarım Notları

### Mevcut Tasarım Dili

- Siyah + Blue Dark tonlar
- Gradyanlar
- Modüler mimari
- Modern çizgiler
- Logo: Siyah

### Square Uyumu

Gelecekte Square ile birebir aynı tasarım dili:
- Apple Tahoe Dark Mode
- Glassmorphism
- Premium dark theme
- Touch-first design

**Not:** MVP için mevcut tasarım yeterli. Scale aşamasında Square tasarımına geçilecek.

---

**Hazırlayan:** Kiro  
**Tarih:** 17 Ocak 2026
