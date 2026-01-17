# 🚀 MEGA POS - MVP TASK LİSTESİ
## Bir Kafeye Verildiğinde OLMAZSA OLMAZ Özellikler

---

## 📋 KULLANICI ROLLERİ

| Rol | Yetki | Cihaz |
|-----|-------|-------|
| **BOSS (Patron)** | Root - Her şeyi görür/yapar | Web Panel + Mobil |
| **Kasa** | Satış, ödeme, gün sonu | POS Terminal |
| **Mutfak** | Sipariş görme, hazır işaretleme | Tablet (KDS) |
| **Garson** | Sipariş alma, masa yönetimi | Tablet/Telefon |
| **Müşteri** | QR menü, sipariş | Kendi telefonu |

---

## 🎯 MVP PHASE 1: TEMEL SİSTEM (Hafta 1-4)

### 1.1 Kimlik Doğrulama ve Yetkilendirme

| # | Task | Öncelik | Süre |
|---|------|---------|------|
| 1.1.1 | Boss hesabı oluşturma (root yetki) | P0 | 2 gün |
| 1.1.2 | Personel hesabı oluşturma (rol bazlı) | P0 | 2 gün |
| 1.1.3 | PIN/Şifre ile giriş sistemi | P0 | 1 gün |
| 1.1.4 | Rol bazlı yetkilendirme (RBAC) | P0 | 2 gün |
| 1.1.5 | Oturum yönetimi (token) | P0 | 1 gün |
| 1.1.6 | Cihaz kaydı ve tanıma | P0 | 1 gün |

### 1.2 Ürün/Menü Yönetimi (BOSS Paneli)

| # | Task | Öncelik | Süre |
|---|------|---------|------|
| 1.2.1 | Kategori oluşturma (İçecekler, Yiyecekler, Tatlılar) | P0 | 1 gün |
| 1.2.2 | Ürün ekleme (isim, fiyat, açıklama) | P0 | 2 gün |
| 1.2.3 | Ürün görseli yükleme | P0 | 1 gün |
| 1.2.4 | Ürün seçenekleri (boyut: S/M/L, şeker: az/normal/çok) | P0 | 2 gün |
| 1.2.5 | Ekstra malzeme tanımlama (+şanti, +shot) | P0 | 1 gün |
| 1.2.6 | Fiyat güncelleme | P0 | 0.5 gün |
| 1.2.7 | Ürün aktif/pasif yapma | P0 | 0.5 gün |
| 1.2.8 | Ürün sıralama (drag & drop) | P1 | 1 gün |

### 1.3 QR Menü (Müşteri Tarafı)

| # | Task | Öncelik | Süre |
|---|------|---------|------|
| 1.3.1 | QR kod oluşturma (masa bazlı) | P0 | 1 gün |
| 1.3.2 | Mobil uyumlu menü sayfası | P0 | 2 gün |
| 1.3.3 | Kategorileri listeleme | P0 | 0.5 gün |
| 1.3.4 | Ürünleri görsel ile listeleme | P0 | 1 gün |
| 1.3.5 | Ürün detay sayfası (seçenekler, ekstralar) | P0 | 1 gün |
| 1.3.6 | Sepete ekleme | P0 | 1 gün |
| 1.3.7 | Sepet görüntüleme ve düzenleme | P0 | 1 gün |
| 1.3.8 | Sipariş notu ekleme | P0 | 0.5 gün |
| 1.3.9 | Sipariş gönderme | P0 | 1 gün |
| 1.3.10 | Sipariş onay ekranı | P0 | 0.5 gün |

---

## 🎯 MVP PHASE 2: SİPARİŞ YÖNETİMİ (Hafta 5-8)

### 2.1 Sipariş Akışı

| # | Task | Öncelik | Süre |
|---|------|---------|------|
| 2.1.1 | Sipariş oluşturma (QR'dan gelen) | P0 | 1 gün |
| 2.1.2 | Sipariş oluşturma (garson tablet'ten) | P0 | 1 gün |
| 2.1.3 | Sipariş oluşturma (kasa'dan) | P0 | 1 gün |
| 2.1.4 | Sipariş durumları (Yeni → Hazırlanıyor → Hazır → Teslim) | P0 | 1 gün |
| 2.1.5 | Sipariş bildirimi (ses + görsel) | P0 | 1 gün |
| 2.1.6 | Sipariş detayı görüntüleme | P0 | 0.5 gün |
| 2.1.7 | Sipariş düzenleme (ürün ekle/çıkar) | P0 | 1 gün |
| 2.1.8 | Sipariş iptali | P0 | 0.5 gün |

### 2.2 Mutfak Ekranı (KDS)

| # | Task | Öncelik | Süre |
|---|------|---------|------|
| 2.2.1 | Yeni siparişleri listeleme | P0 | 1 gün |
| 2.2.2 | Sipariş kartı görünümü (masa, ürünler, notlar) | P0 | 1 gün |
| 2.2.3 | Kronolojik sıralama | P0 | 0.5 gün |
| 2.2.4 | Renk kodları (yeni=kırmızı, hazırlanıyor=sarı, hazır=yeşil) | P0 | 0.5 gün |
| 2.2.5 | "Hazırlanıyor" işaretleme | P0 | 0.5 gün |
| 2.2.6 | "Hazır" işaretleme | P0 | 0.5 gün |
| 2.2.7 | Sesli bildirim (yeni sipariş) | P0 | 0.5 gün |
| 2.2.8 | Bekleme süresi gösterimi | P1 | 1 gün |
| 2.2.9 | Acil sipariş işaretleme | P1 | 0.5 gün |

### 2.3 Garson Tablet Uygulaması

| # | Task | Öncelik | Süre |
|---|------|---------|------|
| 2.3.1 | PIN ile giriş | P0 | 0.5 gün |
| 2.3.2 | Masa listesi görünümü | P0 | 1 gün |
| 2.3.3 | Masa seçip sipariş alma | P0 | 1 gün |
| 2.3.4 | Görsel menüden ürün seçme | P0 | 1 gün |
| 2.3.5 | Seçenek ve ekstra belirleme | P0 | 1 gün |
| 2.3.6 | Sipariş notu ekleme | P0 | 0.5 gün |
| 2.3.7 | Siparişi mutfağa gönderme | P0 | 0.5 gün |
| 2.3.8 | Mevcut siparişleri görme | P0 | 0.5 gün |
| 2.3.9 | Masanın hesabını görme | P0 | 0.5 gün |

---

## 🎯 MVP PHASE 3: KASA VE ÖDEME (Hafta 9-10)

### 3.1 Kasa Ekranı

| # | Task | Öncelik | Süre |
|---|------|---------|------|
| 3.1.1 | Açık masaları listeleme | P0 | 0.5 gün |
| 3.1.2 | Masa hesabını görüntüleme | P0 | 0.5 gün |
| 3.1.3 | Hızlı satış (masasız) | P0 | 1 gün |
| 3.1.4 | Ödeme alma (nakit) | P0 | 1 gün |
| 3.1.5 | Ödeme alma (kredi kartı) | P0 | 1 gün |
| 3.1.6 | Bölünmüş ödeme (split) | P1 | 1 gün |
| 3.1.7 | İndirim uygulama (% veya tutar) | P0 | 0.5 gün |
| 3.1.8 | Fiş yazdırma | P0 | 1 gün |
| 3.1.9 | Adisyon yazdırma | P0 | 0.5 gün |
| 3.1.10 | Gün sonu Z raporu | P0 | 1 gün |

### 3.2 Masa Yönetimi

| # | Task | Öncelik | Süre |
|---|------|---------|------|
| 3.2.1 | Masa tanımlama (isim, kapasite) | P0 | 1 gün |
| 3.2.2 | Salon/bölge tanımlama | P1 | 0.5 gün |
| 3.2.3 | Masa durumu (boş/dolu/hesap bekliyor) | P0 | 0.5 gün |
| 3.2.4 | Masa açma | P0 | 0.5 gün |
| 3.2.5 | Masa kapatma (ödeme sonrası) | P0 | 0.5 gün |
| 3.2.6 | Masa taşıma | P1 | 1 gün |
| 3.2.7 | Masa birleştirme | P1 | 1 gün |

---

## 🎯 MVP PHASE 4: BOSS PANELİ (Hafta 11-12)

### 4.1 Dashboard

| # | Task | Öncelik | Süre |
|---|------|---------|------|
| 4.1.1 | Günlük ciro özeti | P0 | 1 gün |
| 4.1.2 | Bugünkü sipariş sayısı | P0 | 0.5 gün |
| 4.1.3 | Açık masa sayısı | P0 | 0.5 gün |
| 4.1.4 | En çok satan ürünler (bugün) | P0 | 1 gün |
| 4.1.5 | Anlık durum (canlı) | P0 | 1 gün |

### 4.2 Raporlar

| # | Task | Öncelik | Süre |
|---|------|---------|------|
| 4.2.1 | Günlük satış raporu | P0 | 1 gün |
| 4.2.2 | Haftalık satış raporu | P0 | 0.5 gün |
| 4.2.3 | Aylık satış raporu | P0 | 0.5 gün |
| 4.2.4 | Ürün bazlı satış raporu | P0 | 1 gün |
| 4.2.5 | Kategori bazlı satış raporu | P1 | 0.5 gün |
| 4.2.6 | Ödeme yöntemi dağılımı | P0 | 0.5 gün |
| 4.2.7 | Saat bazlı yoğunluk | P1 | 1 gün |
| 4.2.8 | Rapor PDF/Excel export | P1 | 1 gün |

### 4.3 Personel Yönetimi

| # | Task | Öncelik | Süre |
|---|------|---------|------|
| 4.3.1 | Personel ekleme | P0 | 0.5 gün |
| 4.3.2 | Rol atama (kasa/garson/mutfak) | P0 | 0.5 gün |
| 4.3.3 | PIN belirleme | P0 | 0.5 gün |
| 4.3.4 | Personel aktif/pasif | P0 | 0.5 gün |
| 4.3.5 | Personel bazlı satış raporu | P1 | 1 gün |

### 4.4 Ayarlar

| # | Task | Öncelik | Süre |
|---|------|---------|------|
| 4.4.1 | İşletme bilgileri (isim, adres, logo) | P0 | 0.5 gün |
| 4.4.2 | Vergi oranı ayarı | P0 | 0.5 gün |
| 4.4.3 | Para birimi ayarı | P0 | 0.5 gün |
| 4.4.4 | Fiş şablonu düzenleme | P1 | 1 gün |
| 4.4.5 | Yazıcı ayarları | P0 | 1 gün |

---

## 🎯 MVP PHASE 5: SENKRONIZASYON (Hafta 13-14)

### 5.1 Real-time Senkronizasyon

| # | Task | Öncelik | Süre |
|---|------|---------|------|
| 5.1.1 | WebSocket altyapısı | P0 | 2 gün |
| 5.1.2 | Sipariş anlık güncelleme (tüm cihazlar) | P0 | 2 gün |
| 5.1.3 | Masa durumu anlık güncelleme | P0 | 1 gün |
| 5.1.4 | Menü değişikliği anlık yansıma | P0 | 1 gün |
| 5.1.5 | Stok durumu anlık güncelleme | P1 | 1 gün |
| 5.1.6 | Bağlantı kopması durumu yönetimi | P0 | 1 gün |
| 5.1.7 | Offline mod (temel işlemler) | P1 | 3 gün |
| 5.1.8 | Offline → Online senkronizasyon | P1 | 2 gün |

---

## 📊 MVP ÖZET

| Phase | Süre | Task Sayısı | Öncelik |
|-------|------|-------------|---------|
| Phase 1: Temel Sistem | 4 hafta | 24 task | P0 |
| Phase 2: Sipariş Yönetimi | 4 hafta | 27 task | P0 |
| Phase 3: Kasa ve Ödeme | 2 hafta | 17 task | P0 |
| Phase 4: Boss Paneli | 2 hafta | 22 task | P0 |
| Phase 5: Senkronizasyon | 2 hafta | 8 task | P0 |
| **TOPLAM MVP** | **14 hafta** | **98 task** | **P0** |

---

## 🛠️ TEKNİK ALTYAPI (Paralel Çalışma)

### Backend Altyapı

| # | Task | Süre |
|---|------|------|
| T.1 | AWS hesap yapılandırması | 1 gün |
| T.2 | VPC ve network kurulumu | 1 gün |
| T.3 | RDS PostgreSQL kurulumu | 1 gün |
| T.4 | ElastiCache Redis kurulumu | 0.5 gün |
| T.5 | S3 bucket (görseller için) | 0.5 gün |
| T.6 | CloudFront CDN | 0.5 gün |
| T.7 | ECS/EKS cluster kurulumu | 2 gün |
| T.8 | CI/CD pipeline (GitHub Actions) | 1 gün |
| T.9 | Staging ortamı | 1 gün |
| T.10 | Production ortamı | 1 gün |

### Veritabanı Şeması

| # | Task | Süre |
|---|------|------|
| DB.1 | Tenant (işletme) tablosu | 0.5 gün |
| DB.2 | User (kullanıcı) tablosu | 0.5 gün |
| DB.3 | Role ve Permission tabloları | 0.5 gün |
| DB.4 | Category (kategori) tablosu | 0.5 gün |
| DB.5 | Product (ürün) tablosu | 0.5 gün |
| DB.6 | ProductOption (seçenek) tablosu | 0.5 gün |
| DB.7 | Table (masa) tablosu | 0.5 gün |
| DB.8 | Order (sipariş) tablosu | 0.5 gün |
| DB.9 | OrderItem (sipariş kalemi) tablosu | 0.5 gün |
| DB.10 | Payment (ödeme) tablosu | 0.5 gün |
| DB.11 | DailySummary (gün sonu) tablosu | 0.5 gün |

---

## 🎨 MVP EKRAN LİSTESİ

### Boss Web Paneli
1. Login sayfası
2. Dashboard (ana sayfa)
3. Ürün yönetimi (liste + ekleme/düzenleme)
4. Kategori yönetimi
5. Masa yönetimi
6. Personel yönetimi
7. Raporlar (satış, ürün, personel)
8. Ayarlar
9. Canlı sipariş takibi

### Kasa Uygulaması (Tablet/PC)
1. PIN giriş
2. Masa görünümü
3. Hızlı satış ekranı
4. Sipariş detay
5. Ödeme ekranı
6. Gün sonu raporu

### Garson Tablet
1. PIN giriş
2. Masa listesi
3. Sipariş alma ekranı
4. Menü görünümü
5. Sepet/sipariş özeti
6. Aktif siparişler

### Mutfak Ekranı (KDS)
1. PIN giriş
2. Sipariş listesi (kartlar)
3. Sipariş detay modal

### QR Menü (Müşteri - Web)
1. Menü ana sayfa
2. Kategori sayfası
3. Ürün detay
4. Sepet
5. Sipariş onay
6. Sipariş takip

---

## 📱 CİHAZ UYUMLULUK

| Uygulama | Platform | Min. Gereksinim |
|----------|----------|-----------------|
| Boss Panel | Web | Chrome/Safari/Firefox |
| Kasa | Web (Tablet/PC) | 10" tablet veya PC |
| Garson | Web (Tablet) | 8" tablet |
| Mutfak KDS | Web (Tablet) | 10" tablet |
| QR Menü | Mobile Web | Herhangi bir telefon |

---

## 🚦 MVP SONRASI ROADMAP

### Phase 6: Stok Yönetimi (Hafta 15-18)
- Hammadde tanımlama
- Reçete oluşturma
- Otomatik stok düşümü
- Stok uyarıları
- Stok sayımı

### Phase 7: Paket Servis (Hafta 19-22)
- Paket sipariş alma
- Müşteri adresi kayıt
- Kurye atama
- Teslimat takibi
- Caller ID entegrasyonu

### Phase 8: Sadakat & CRM (Hafta 23-26)
- Müşteri kaydı
- Puan sistemi
- Kampanya yönetimi
- SMS/Push bildirim

### Phase 9: Çoklu Şube (Hafta 27-30)
- Şube tanımlama
- Merkezi menü yönetimi
- Konsolide raporlar
- Şube karşılaştırma

### Phase 10: Entegrasyonlar (Hafta 31-36)
- Yemek platformları (Getir, Trendyol, vb.)
- Muhasebe yazılımları
- E-fatura/E-arşiv
- Ödeme sistemleri

### Phase 11: AI Özellikleri (Hafta 37-44)
- Talep tahmini
- Akıllı stok önerisi
- Müşteri segmentasyonu
- Chatbot

### Phase 12: İleri Özellikler (Hafta 45-52)
- Rezervasyon sistemi
- Self-servis kiosk
- Dijital menuboard
- Franchise yönetimi

---

## ⚡ HEMEN BAŞLAMAK İÇİN

### Bu Hafta Yapılacaklar:

1. **AWS Altyapı** - Hesap yapılandırması, temel servisler
2. **Veritabanı** - Şema tasarımı ve migration'lar
3. **Backend** - NestJS proje kurulumu, auth modülü
4. **Frontend** - Next.js proje kurulumu, UI kit seçimi

### Senden İhtiyacım Olan:
- [ ] AWS hesap bilgileri (hangi region kullanacağız?)
- [ ] Domain adı (varsa)
- [ ] Logo ve marka renkleri
- [ ] Örnek menü (test için)

---

*Oluşturulma: 12 Ocak 2026*
