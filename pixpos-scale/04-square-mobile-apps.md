# Square Mobil Uygulamalar

**Kaynak:** App Store, Google Play  
**Tarih:** 17 Ocak 2026

---

## Ana Uygulama: Square Point of Sale (POS)

### App Store Bilgileri
| Bilgi | Değer |
|-------|-------|
| App Adı | Square Point of Sale (POS) |
| Geliştirici | Block, Inc. |
| App ID (iOS) | 335393788 |
| Package ID (Android) | com.squareup |
| Fiyat | Ücretsiz |
| iOS Link | https://apps.apple.com/us/app/square-point-of-sale-pos/id335393788 |
| Android Link | https://play.google.com/store/apps/details?id=com.squareup |

### Minimum Gereksinimler
| Platform | Gereksinim |
|----------|------------|
| iOS | iOS 15.0+ |
| Android | Android 7.0+ |

---

## Uygulama Açıklaması

> Square Point of Sale (POS) is the all-in-one payments processing app designed for any business. Whether you're a retail, a restaurant, or a service business, you'll have all the features you need to run your business at your fingertips.

---

## Sektöre Özel Modlar

### 1. Tüm İşletmeler (Genel)
- Ücretsiz POS sistemi
- Gerçek zamanlı raporlar (Dashboard)
- Envanter yönetimi

### 2. Restoranlar
- Hızlı sipariş girişi
- Sipariş hazır SMS bildirimi
- Kurs ve koltuk yönetimi (sadece iPad)
- Ön yetkilendirilmiş bar tabları (sadece iPad)

### 3. Perakende (Retail)
- Gelişmiş envanter araçları
- Çok kanallı satış (multichannel)
- Müşteri profilleri

### 4. Güzellik (Beauty)
- 7/24 online rezervasyon
- No-show koruması
- Otomatik randevu hatırlatmaları

### 5. Hizmetler (Services)
- Faturalar ve teklifler
- Sözleşmeler
- Proje yönetimi

---

## Kabul Edilen Ödeme Yöntemleri

| Yöntem | Destekleniyor |
|--------|---------------|
| Kredi kartları (tüm markalar) | ✅ |
| Banka kartları | ✅ |
| Nakit | ✅ |
| Dijital cüzdanlar (Apple Pay, Google Pay, Samsung Pay) | ✅ |
| QR kod | ✅ |
| Payment links | ✅ |
| Cash App Pay | ✅ |
| Tap to Pay on iPhone | ✅ |
| Tap to Pay on Android | ✅ |
| Hediye kartları | ✅ |

---

## Temel Özellikler

### Ödeme İşleme
- Yüz yüze ödeme
- Online ödeme
- Telefon ile ödeme
- Offline ödeme (24 saat içinde sync)

### İşletme Yönetimi
- Envanter yönetimi
- Otomatik stok yenileme
- Müşteri etkileşimi
- Kapsamlı raporlar
- Personel yönetimi

### Entegrasyonlar
- Square Dashboard (web)
- Square Hardware (Register, Terminal, Reader, vb.)
- Üçüncü parti aksesuarlar

---

## Diğer Square Uygulamaları

| Uygulama | Açıklama | Package ID |
|----------|----------|------------|
| **Square for Restaurants** | Restoran özel POS | - |
| **Square Appointments** | Randevu yönetimi | com.squareup.apos |
| **Square Dashboard** | Web dashboard mobil | - |
| **Square Point of Sale Beta** | Beta sürüm | com.squareup.beta |

---

## App İndirme ve Kurulum Akışı

### Web Dashboard'dan
1. "Download the App" adımı
2. Modal açılır:
   - QR kod (onelink.me yönlendirmesi)
   - Telefon/email ile link gönderme
   - "Download from App Store instead" direkt link
3. X ile kapatılabilir (skip)

### Mobil App Onboarding

**Adım 1: Sign In**
- Email + şifre girişi

**Adım 2: Two-Step Verification**
| Seçenek | Açıklama |
|---------|----------|
| Authentication app | Google Authenticator, Authy vb. |
| Text message | SMS ile kod |
| "Remind me" | Şimdilik atla |

**Adım 3: Select Location**
- Hesaptaki lokasyonlar listelenir
- Cihazın bağlı olacağı lokasyonu seç

**Adım 4: Set Device Permissions**
| İzin | Açıklama | Zorunlu |
|------|----------|---------|
| Microphone access | Lightning connector ile kart okuma | Optional |
| Location services | Ödeme güvenliği için konum | Önerilen |
| Push notifications | Hesap bildirimleri | Optional |
| Bluetooth | Square Reader bağlantısı | Optional |
| Local network access | Yazıcı keşfi ve bağlantısı | Optional |

**Adım 5: [Next]** → Ana ekrana geç

---

## App Ana Ekran (Checkout)

### Üst Tab Bar
| Tab | Açıklama |
|-----|----------|
| **Keypad** | Manuel tutar girişi (numpad) |
| **Library** | Ürün kütüphanesi ve kategoriler |
| **Favorites** | Sık kullanılan ürünler |

### Keypad Modu
- Büyük tutar gösterimi (₺0,00)
- [+ Note] - İşleme not ekle
- Numpad (1-9, 0, C, +)
- C = Clear (sil)
- + = Ürün ekle

### Library Modu
**Kategoriler:**
| İkon | Kategori | Açıklama |
|------|----------|----------|
| 📋 | Items | Ürünler |
| 💎 | Rewards | Sadakat ödülleri |
| 🏷️ | Discounts | İndirimler |
| 📅 | Services | Hizmetler |

**Önerilen Ürünler (Suggested):**
- Donation (Bağış)
- Water (Su)
- T-Shirt
- Shipping (Kargo)

[Create item] - Yeni ürün oluştur

### Favorites Modu
**Başlık:** "Arrange your favorites"
**Açıklama:** "Press and hold anywhere on the grid to begin adding items"

- 2 sütunlu grid layout
- Boş kutucuklar (placeholder)
- Basılı tut → Ürün ekle
- Sürükle-bırak ile düzenleme
- Hızlı erişim için sık satılan ürünler

### Alt Navigation Bar
| İkon | Tab | Açıklama |
|------|-----|----------|
| 🔲 | Checkout | Ana satış ekranı |
| ⇄ | Transactions | İşlem geçmişi |
| 🔔 | Notifications | Bildirimler (badge) |
| ☰ | More | Diğer menüler |

### Ana CTA
[Charge ₺X,XX] - Ödeme al butonu (siyah, tam genişlik)

---

## More Menüsü

**Başlık:** More
**Alt başlık:** [lokasyon adı] (örn: queenana)

### Mode Seçimi
| Mod | Açıklama |
|-----|----------|
| **Standard mode** | Genel POS, esnek kurulum |
| Restaurant mode | Restoran özel |
| Retail mode | Perakende özel |
| Beauty mode | Güzellik/kuaför özel |
| Services mode | Hizmet sektörü özel |

### Menü Öğeleri
| İkon | Menü | Açıklama |
|------|------|----------|
| 📋 | Orders | Sipariş yönetimi |
| 📊 | Reports | Satış raporları |
| 🏷️ | Items | Ürün yönetimi |
| 👥 | Customers | Müşteri yönetimi |
| 🧩 | Add-ons | Eklenti mağazası |
| 🎯 | Referrals | Referans programı |
| ❓ | Support | Yardım ve destek |
| ⚙️ | Settings | Uygulama ayarları |

### Alt Aksiyonlar
- [Customize] - POS özelleştirme
- "Sign out [İşletme Adı]" - Hesaptan çıkış
- "Switch location" - Başka lokasyona geç

---

## POS Modları Detay

### Mode Sistemi
Square'de modlar sabit preset değil, **özelleştirilebilir profiller**:
- Aynı mod tipinde birden fazla profil oluşturulabilir
- Her profil farklı ayarlarla yapılandırılabilir
- Cihaz bazlı mod ataması yapılabilir

### Switch Mode (Bottom Sheet)
| Öğe | Açıklama |
|-----|----------|
| Mod listesi | Oluşturulan modlar |
| "Active on X device" | Kaç cihazda aktif |
| [+] butonu | Yeni mod ekle |
| [Done] | Kapat |

### Set up mode (Yeni Mod)
| Alan | Açıklama |
|------|----------|
| Mode name | Benzersiz isim (örn: "Sabah Vardiyası") |

**Mode settings:**
| Seçenek | Açıklama |
|---------|----------|
| Copy current settings | Mevcut mod ayarlarını kopyala |
| Use mode default | Varsayılan ayarları kullan |

### Kullanım Senaryoları
- "Sabah Vardiyası" - Kahvaltı menüsü aktif
- "Akşam Vardiyası" - Akşam yemeği menüsü
- "Hafta Sonu" - Brunch menüsü
- "Happy Hour" - İndirimli içecekler

### Standard Mode (Ücretsiz)
- Hızlı ödeme alma
- Esnek kurulum
- Tezgah veya mobil kullanım
- Temel POS özellikleri

---

## Orders (Siparişler)

### Üst Bar
- "All orders ▼" - Kategori seçimi
- [Actions] - Toplu işlemler

### Filtreler
- 🔍 Arama
- Status chip: Active / Completed / Cancelled
- ≡ Gelişmiş filtreler

### Sipariş Kategorileri
| İkon | Kategori | Açıklama |
|------|----------|----------|
| 📋 | All orders | Tüm siparişler |
| 🏪 | In store | Mağaza içi (yüz yüze) |
| 🧑‍💻 | Self-serve | Kiosk siparişleri |
| 🛍️ | Pickup | Gel-al siparişleri |
| 🚗 | Delivery | Teslimat siparişleri |
| 📦 | Shipments | Kargo siparişleri |
| ••• | Other | Diğer türler |

---

## Reports (Raporlar)

### Reports Ana Menü
| Menü | Açıklama |
|------|----------|
| Sales | Satış raporları |
| Disputes | İtiraz/anlaşmazlık raporları |

### Disputes (İtirazlar)
**Boş Durum:**
> "You have no disputes, but it doesn't hurt to be prepared. Learn about how to prevent disputes at our Support Center."

- Chargeback/itiraz yönetimi
- Support Center'a link

### Referral Banner
- "Get free processing!"
- Referans gönder → Ücretsiz işlem ücreti kazan

### Sales Report

**Üst Bar:**
- ← Geri
- 📤 Paylaş (export) → Email / Cancel
- 📈 Grafik görünümü (karşılaştırma)

**Tarih Seçimi:**
- Tıklanabilir tarih (takvim açar)
- Karşılaştırma: "vs previous [gün]"
- Cihaz filtresi: "All Devices"

**Karşılaştırma Seçenekleri (📈 butonu):**
| Seçenek | Açıklama |
|---------|----------|
| Same Day Previous Week | Geçen haftanın aynı günü ile karşılaştır |
| Same Day Previous Year | Geçen yılın aynı günü ile karşılaştır |
| Yesterday | Dün ile karşılaştır |

**Dönem Tabları:**
| Tab | Dönem |
|-----|-------|
| 1D | 1 Gün |
| 1W | 1 Hafta |
| 1M | 1 Ay |
| 3M | 3 Ay |
| 1Y | 1 Yıl |

**Sales Summary Metrikleri:**
| Metrik | Açıklama |
|--------|----------|
| Gross Sales | Brüt satış |
| Net Sales | Net satış |
| Sales | Satış adedi |
| Average Sale | Ortalama satış tutarı |
| Returns | İadeler |
| Discounts & Comps | İndirimler ve ikramlar |

---

## Items (Ürün Yönetimi)

### Items Ana Menü
| Menü | Açıklama |
|------|----------|
| All Items | Tüm ürünler listesi |
| All Services | Tüm hizmetler listesi |
| Categories | Kategori yönetimi |
| Modifiers | Modifiye grupları (ekstralar, seçenekler) |
| Discounts | İndirim tanımları |
| Options | Ürün seçenekleri (boyut, renk vb.) |
| Units | Ölçü birimleri (adet, kg, lt vb.) |

### All Items
- 🔍 Arama
- [Create Item] butonu
- Liste görünümü: + Item Name | Fiyat

### Create Item Formu
**Görsel:**
- Ürün görseli placeholder
- [Edit POS tile] - POS'ta görünecek karo düzenleme

**Details:**
| Alan | Özellik |
|------|---------|
| Name | Text + [📷 Auto create] (kamera ile barkod/ürün tanıma) |

**Auto create Özelliği:**
- Kamera ile barkod tarama (tam ekran kamera + tarama çerçevesi)
- Barkod numarası veya marka adı ile arama
- Square ürün veritabanından otomatik bilgi çekme (isim, açıklama, görsel)
- Bulunamazsa manuel giriş
- 🔄 Ön/arka kamera değiştirme
- [Search] butonu ile manuel arama
- Açıklama: "Scan a barcode or search by name..."
| Description | Rich text editor (B, I, U, strikethrough, lists, link) |

**AI Özelliği (OpenAI):**
- [✨ Generate description] - AI ile otomatik açıklama oluştur
- **Powered by OpenAI**
- Birkaç anahtar kelime gir → AI açıklama üretir
- Beğenmezsen düzenle ve yeniden oluştur
- Kullanıcı içerikten sorumlu (Square değil)
- OpenAI TOS ve Square TOS kabul gerekli

**Taxes:**
- Uygulanan vergi sayısı
- [Edit] ile düzenleme

**Categorization:**
- Categories: Kategori seçimi [Edit]

**Options:**
> "Add a custom set of options to an item to create variations. For example, a size option set creates variations small, medium, and large."
- [Add options] butonu

**Price and Inventory:**
| Alan | Açıklama |
|------|----------|
| SKU | Stok kodu |
| GTIN | Global Trade Item Number (barkod) |
| Unit | Per Item, Per Kg, Per Lt vb. (dropdown) |
| Price | Fiyat |
| Stock on hand | [Manage Stock] linki |

**Variations:**
- [Create variation] - Boyut, renk vb. varyasyonlar

**Modifiers:**
> "Add a custom set of modifiers to have customizable options for an item at checkout, such as toppings, add-ons, or special requests."
- Ekstralar, eklentiler, özel istekler

**Online:**
| Alan | Değer |
|------|-------|
| Site visibility | Visible / Hidden [Edit] |
| Fulfillment settings | Pickup, Delivery, Shipping ayarları (item oluşturduktan sonra aktif) |

---

## Customers (Müşteri Yönetimi)

**Üst Bar:**
- 🔍 Search (müşteri arama)
- ••• Menü

**Menü Seçenekleri:**
| Seçenek | Açıklama |
|---------|----------|
| Create customer | Yeni müşteri oluştur |
| Manage groups | Müşteri grupları yönet (VIP, Sadık, vb.) |
| Merge customers | Duplicate müşterileri birleştir |

**Not:** "Rehberden aktar" özelliği de var - telefon rehberinden müşteri import etme

---

## Add-ons (Eklenti Mağazası)

**Başlık:** All add-ons ▼ (kategori filtresi)

**Works with (Uyumluluk Filtresi):**
- Square Point of Sale
- Square for Retail
- Square for Appointments
- Square Invoices
- Square for Restaurants

### Tüm Eklentiler
| İkon | Eklenti | Açıklama | Fiyat |
|------|---------|----------|-------|
| 💳 | Cash Management | Nakit satış takibi ve kasa yönetimi | Free |
| ✉️ | Email Marketing | Mailing list ve email kampanyaları | Free plan |
| 🎁 | Gift Cards | Hediye kartı satışı (yükleme ücreti var) | Free |
| 📋 | Open Tickets | Siparişi kaydet, düzenle, sonra tamamla | Free |
| $→ | Payment Links | Online ödeme linkleri | Free |
| 👥 | Team Management | Vardiya planlama, personel yönetimi | Free plan |
| 🔄 | Subscriptions | Abonelik satışı, recurring revenue | Free |

### Eklenti Detayları

**Cash Management:**
- Kasa açılış/kapanış tutarı takibi
- Gün sonu beklenen tutar hesaplama
- Drawer history (kasa geçmişi)
- Otomatik gün sonu raporu (email)
- Nakit akış hesap verebilirliği

**Email Marketing:**
- Mailing list oluşturma
- Email kampanyaları gönderme
- Müşteri segmentasyonu
- Kampanya performans raporları

**Gift Cards:**
- Fiziksel/dijital hediye kartı satışı
- Kart yükleme (load fee uygulanır)
- Bakiye sorgulama
- Kısmi kullanım desteği

**Open Tickets:**
- Siparişi kaydet, sonra tamamla
- Birden fazla açık sipariş
- Sipariş düzenleme
- Bar tab mantığı

**Payment Links:**
- Paylaşılabilir ödeme linki oluştur
- SMS/Email/WhatsApp ile gönder
- QR kod olarak paylaş
- Online ödeme al

**Subscriptions:**
- Recurring (tekrarlayan) ödeme planları
- Aylık/haftalık/yıllık abonelikler
- Otomatik faturalama
- Abonelik yönetimi

**Team Management:**
- Personel ekleme
- Vardiya planlama (scheduling)
- Saat takibi (time tracking)
- Bordro entegrasyonu (Payroll)

### Ürün Bazlı Eklenti Uyumluluğu
| Eklenti | POS | Retail | Appointments | Invoices | Restaurants |
|---------|-----|--------|--------------|----------|-------------|
| Cash Management | ✅ | ✅ | ✅ | - | - |
| Email Marketing | ✅ | ✅ | - | ✅ | - |
| Gift Cards | ✅ | ✅ | ✅ | ✅ | - |
| Open Tickets | ✅ | ✅ | ✅ | - | - |
| Payment Links | ✅ | ✅ | ✅ | ✅ | ✅ |
| Subscriptions | - | - | ✅ | - | - |
| Team Management | ✅ | ✅ | - | - | - |

---

## Referrals (Referans Programı)

**Başlık:** "Share Square, get rewarded"

**Açıklama:**
> "When someone signs up for Square using your referral link and starts processing payments, you'll both receive a reward of your choice, like free processing on ₺1.000 in sales."

**Ödül:** Her iki taraf da ₺1.000 satışta ücretsiz işlem ücreti

**Menü:**
| Seçenek | Açıklama |
|---------|----------|
| Send referral | Referans linki gönder |
| Your rewards | Kazanılan ödüller |

**Your rewards:**
- CURRENT OFFERS: "Process ₺1,000 for free"
- "Save on card processing fees for up to ₺1,000 in sales within the first 180 days"
- [Refer] butonu

**Kimlik Doğrulama (KYC):**
- Ödül almak için kimlik doğrulama gerekli
- "Verify your identity to be eligible for rewards"

**QR Kod:** Sağ üstte QR kod ile paylaşım

### All Services
- 🔍 Search All Services
- [Create Service] butonu
- **Boş durum:** "Start building your services library. Tap Create Service to begin."

### Categories
- [Create] butonu (sağ üst)
- **Boş durum açıklaması:**
  > "Categories help organize your items, determine how customers navigate your online store, report on item sales and route items to specific printers."
- [Create category] butonu

**Kategori Kullanım Alanları:**
- Ürün organizasyonu
- Online mağaza navigasyonu
- Satış raporlama
- Yazıcı yönlendirme (mutfak/bar yazıcısı)

---

## Support (Destek)

### Support Ana Menü
| Menü | Açıklama |
|------|----------|
| Get help | Yardım al |
| Tutorials and tours | Eğitim videoları ve turlar |
| Setup guide | Kurulum rehberi (onboarding) |
| Suggest a feature | Özellik öner (kullanıcı feedback) |
| About | Uygulama hakkında (versiyon vb.) |
| Legal | Yasal bilgiler (ToS, Privacy) |

### Get Help Ekranı

**LEARN MORE:**
| Seçenek | Açıklama |
|---------|----------|
| Visit our Support Center | Destek merkezi - makale arama ve konular |
| System status | Square servislerinin durumu (uptime monitoring) |

**FREQUENTLY ASKED QUESTIONS:**
| Soru | Açıklama |
|------|----------|
| View recent and next deposits | Para transferleri görüntüle |
| View sales & fees | Satış ve ücretleri gör |
| Troubleshoot your Point of Sale | POS sorun giderme rehberi |

### Tutorials and Tours
- In-app eğitim videoları ve interaktif turlar
- **Not:** Bazı bölgelerde içerik boş olabilir

### Suggest a Feature
- Kullanıcı feedback toplama
- Özellik talepleri gönderme

### About (Uygulama Hakkında)

**Application Bilgileri:**
| Bilgi | Değer | Açıklama |
|-------|-------|----------|
| Version | 6.90so | Uygulama sürümü |
| SPoC Version | SPOC1.1 | Square Point of Commerce - internal platform versiyonu |
| Security Compliance Version | 1.0 | Güvenlik uyumluluk sürümü (PCI DSS vb.) |

**Kullanılan Açık Kaynak Kütüphaneler:**

Square'in iOS uygulamasında kullandığı kütüphaneler ve ne işe yaradıkları:

**BSD 3-Clause License:**
| Kütüphane | Geliştirici | Ne İşe Yarar |
|-----------|-------------|--------------|
| FBSnapshotTestCase | Facebook | UI snapshot testing - ekran görüntüsü karşılaştırmalı test |
| Objective-Zip | Gianluca Bertani | ZIP dosya sıkıştırma/açma |
| PartitionAlloc | Google | Bellek yönetimi optimizasyonu |
| Protobuf | Google | Protocol Buffers - API iletişimi için veri serileştirme |

**General License:**
| Kütüphane | Geliştirici | Ne İşe Yarar |
|-----------|-------------|--------------|
| SocketScan SDK | Socket Mobile | Harici barkod tarayıcı cihaz entegrasyonu |

**MIT License:**
| Kütüphane | Geliştirici | Ne İşe Yarar |
|-----------|-------------|--------------|
| Branch | Branch Metrics | Deep linking - uygulama içi link yönlendirme, attribution |
| OHHTTPStubs | Olivier Halligon | HTTP request mocking - test için sahte API yanıtları |
| Placement | Sam Pettersson | UI element yerleşim yardımcısı |
| SMPageControl | Jerry Jones | Sayfa göstergesi (pagination dots) UI komponenti |

**PIXPOS için Teknoloji Notları:**
- **Protobuf** yerine biz JSON/REST kullanıyoruz (daha basit)
- **Branch** benzeri deep linking için Firebase Dynamic Links veya Adjust kullanılabilir
- **SocketScan SDK** - Zebra, Honeywell gibi endüstriyel barkod tarayıcılar için
- **Snapshot testing** - UI regresyon testleri için önemli

### Legal (Yasal)
- Terms of Service (Kullanım Şartları)
- Privacy Policy (Gizlilik Politikası)
- Licenses (Açık kaynak lisansları)

---

## Settings (Ayarlar)

### Üst Kısım
- 🔍 **Search** - Ayarlarda arama
- **[Mod Adı]** - "Active on X device" - Aktif mod ve cihaz sayısı

### Settings Ana Menü
| Kategori | Açıklama |
|----------|----------|
| Checkout | Ödeme ekranı ayarları |
| Hardware | Donanım bağlantıları |
| Security | Güvenlik ayarları |
| Account | Hesap bilgileri |
| Customers | Müşteri ayarları |
| Information Requests | Bilgi talepleri (GDPR vb.) |
| Orders | Sipariş ayarları |
| **Add-ons** | Eklenti yönetimi (+) |

---

### Checkout Ayarları

**General:**
| Ayar | Seçenekler | Açıklama |
|------|------------|----------|
| Quick amounts | On/Off | Hızlı tutar butonları (₺10, ₺20, ₺50 gibi preset'ler) |
| Sales taxes | X active | Aktif vergi kuralları sayısı |
| Order tickets | Manual/Auto | Sipariş fişi yazdırma modu |
| Payment | → | Ödeme yöntemleri ayarları |
| Customer management | On/Off | Checkout'ta müşteri ekleme/seçme |

**Quick Amounts Detay:**
- Keypad'de hızlı tutar butonları göster
- Özelleştirilebilir tutarlar (₺5, ₺10, ₺20, ₺50, ₺100)
- Bahşiş veya bağış için kullanışlı

**Order Tickets:**
- **Manual:** Kullanıcı "Print" butonuna basınca yazdır
- **Auto:** Her sipariş otomatik yazdırılsın

**Payment Alt Ayarları:**
- Kabul edilen ödeme yöntemleri
- Nakit ödeme açık/kapalı
- Tip (bahşiş) ayarları
- Signature (imza) gereksinimleri

**Customer Management:**
- Checkout'ta müşteri profili ekleme
- Mevcut müşteri seçme
- Sadakat puanı uygulama

---

### Hardware Ayarları

| Ayar | Açıklama |
|------|----------|
| Card readers | Square Reader, Terminal bağlantısı |
| Printers | Fiş yazıcısı (Bluetooth/WiFi/USB) |
| Cash drawers | Kasa çekmecesi bağlantısı |
| Barcode scanners | Barkod okuyucu |
| Customer displays | Müşteri ekranı |
| Kitchen printers | Mutfak yazıcısı |

**Yazıcı Ayarları:**
- Yazıcı keşfi (auto-discover)
- Manuel IP girişi
- Test yazdırma
- Varsayılan yazıcı seçimi
- Kategori bazlı yazıcı yönlendirme (mutfak/bar)

---

### Security Ayarları

| Ayar | Açıklama |
|------|----------|
| Passcode | Uygulama kilidi (4-6 haneli PIN) |
| Team permissions | Personel yetkileri |
| Require passcode | Her işlemde PIN sor |
| Auto-lock | Otomatik kilitleme süresi |
| Biometric unlock | Face ID / Touch ID |

**Passcode Kullanım Alanları:**
- Uygulama açılışı
- İade işlemleri
- İndirim uygulama
- Rapor görüntüleme
- Ayar değişiklikleri

---

### Account Ayarları

| Ayar | Açıklama |
|------|----------|
| Business name | İşletme adı |
| Business type | İşletme türü |
| Business address | Adres |
| Contact info | İletişim bilgileri |
| Bank account | Banka hesabı (para transferi için) |
| Tax ID | Vergi numarası |

---

### Customers Ayarları

| Ayar | Açıklama |
|------|----------|
| Customer directory | Müşteri dizini açık/kapalı |
| Collect customer info | Hangi bilgileri topla (email, telefon, adres) |
| Marketing consent | Pazarlama izni iste |
| Loyalty program | Sadakat programı ayarları |

---

### Information Requests

GDPR ve veri gizliliği talepleri:
- Müşteri veri silme talepleri
- Veri export talepleri
- Consent yönetimi

---

### Orders Ayarları

| Ayar | Açıklama |
|------|----------|
| Order numbering | Sipariş numaralama (günlük reset, sürekli) |
| Order types | Sipariş türleri (Dine-in, Takeout, Delivery) |
| Fulfillment | Teslim yöntemleri |
| Prep time | Hazırlık süresi varsayılanı |
| Auto-accept | Otomatik sipariş kabul |

---

### Add-ons Yönetimi

Aktif eklentilerin ayarları:
- Cash Management
- Gift Cards
- Team Management
- Email Marketing
- vb.

Her eklentinin kendi ayar sayfası var.

---

## İletişim Bilgileri

- **Telefon:** 1-855-700-6000
- **Adres:** Block, Inc., 1955 Broadway, Suite 600, Oakland, CA 94612

---

## Kısıtlamalar

- Bazı özellikler sadece ABD'de mevcut
- Square Bitcoin: NY ve ABD dışı satıcılara sunulmuyor
- iPad özel özellikler: Kurs yönetimi, bar tabları

---

## PIXPOS için Notlar

✅ Bizde var:
- iOS uygulaması (QR Menü)
- Android uygulaması (Garson Tablet - Capacitor)

❌ Eksik (Square'de var):
- Tek birleşik POS uygulaması (tüm modlar)
- Tap to Pay (iPhone/Android)
- Offline ödeme
- Sektöre özel modlar (tek uygulamada)
- SMS ile app link gönderme
- QR kod ile app indirme yönlendirmesi
- Beta program
- Cash App Pay entegrasyonu
