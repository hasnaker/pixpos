# Square Web Dashboard

**Kaynak:** Square Dashboard (squareup.com)  
**Tarih:** 17 Ocak 2026

---

## Ana Menü (Sol Sidebar)

| İkon | Menü | Açıklama |
|------|------|----------|
| 🏠 | Home | Ana sayfa, performans dashboard |
| 🍽️ | Items & services | Ürün/hizmet yönetimi |
| 💳 | Payments & invoices | Ödemeler ve faturalar |
| 🌐 | Online | Online satış |
| 👥 | Customers | Müşteri yönetimi |
| 📊 | Reports | Raporlar |
| 👤 | Staff | Personel |
| ⚙️ | Settings | Ayarlar |

**Alt Kısım:**
- [Take payment] - Ana CTA butonu
- 🔔 Bildirimler
- 📱 Cihazlar
- ❓ Yardım

---

## Home (Ana Sayfa)

### Setup Progress
- "You're X% set up" - Kurulum ilerleme çubuğu

### Performance Dashboard

**Tarih Filtresi:**
- Date: [Tarih seçici]
- vs: Prior day / Prior week / Prior month / Prior year
- Checks: Open / Closed

**Metrikler:**
| Metrik | Açıklama |
|--------|----------|
| Net sales | Net satış (indirimler düşülmüş) |
| Transactions | İşlem sayısı |
| Gross sales | Brüt satış |
| Average sale | Ortalama satış tutarı |
| Labor % of net sales | İşçilik maliyeti oranı |
| Comps & discounts | İkramlar ve indirimler |
| Tips | Bahşişler |

**Grafik:**
- Saatlik satış grafiği
- Karşılaştırmalı görünüm (bugün vs dün)

### Locations Tablosu
| Sütun | Açıklama |
|-------|----------|
| Name | Lokasyon adı |
| Net sales | Net satış |
| Transactions | İşlem sayısı |
| Labor % | İşçilik oranı |

**Pagination:** Results per page: 10 | Page X of Y

### Quick Actions
- Add an item

---

## Items & Services

### Sol Alt Menü

**Items:**
| Menü | Açıklama |
|------|----------|
| Item library | Ürün kütüphanesi |
| Channel listings | Kanal listeleri (POS, Online, vb.) |
| Service library | Hizmet kütüphanesi |
| Image library | Görsel kütüphanesi |
| Modifiers | Modifiye grupları |
| Categories | Kategoriler |
| Discounts | İndirimler |
| Options | Seçenekler (boyut, renk) |
| Units | Ölçü birimleri |
| Custom attributes | Özel özellikler |

**Diğer:**
| Menü | Açıklama |
|------|----------|
| Settings | Ürün ayarları |
| Subscription plans | Abonelik planları |

---

### Item Library

**Başlık:** "Your item library"

**Açıklama:** 
> "Organize what you sell with the item library. Create items to help speed up checkout. View sales reports and track inventory."

**Aksiyonlar:**
| Buton | Açıklama |
|-------|----------|
| Download our template | CSV template indir (toplu import için) |
| Create an item | Yeni ürün oluştur |
| Import items | CSV'den toplu import |

**Quick create items:**
- Hızlı ürün ekleme alanı
- Sadece isim gir → [Save]
- Detaylar sonra düzenlenebilir

---

### Create Item (Ürün Oluşturma Formu)

**Başlık:** "Create item"

**Header Aksiyonlar:**
| Buton | Açıklama |
|-------|----------|
| ✕ | Kapat |
| [Provide feedback] | Geri bildirim ver |
| [Save] | Kaydet |

---

#### Temel Bilgiler

| Alan | Açıklama | Tip |
|------|----------|-----|
| Item type | Ürün türü (Physical good) | Dropdown |
| Name | Ürün adı (required) | Text input |
| Price | Fiyat | Number + ⋮⋮ menü |
| Customer-facing description | Müşteriye görünen açıklama | Textarea |

**Item Type Seçenekleri:**
| Tür | Açıklama |
|-----|----------|
| Physical good | Fiziksel ürün |
| Digital good | Dijital ürün |
| Service | Hizmet |

---

#### Görsel Yükleme

**Drag & Drop Alanı:**
> "Drop images here, browse files, or add from image library"

| Yöntem | Açıklama |
|--------|----------|
| Drag & drop | Sürükle bırak |
| Browse files | Dosya seç |
| Image library | Görsel kütüphanesinden ekle |

---

#### Taxes (Vergiler)

| Alan | Değer | Aksiyon |
|------|-------|---------|
| Sales Tax | (10%) | [Edit] |

---

#### Manage Inventory (Stok Yönetimi)

**Lokasyon Bazlı Stok:**

| Location | Availability | Aksiyon |
|----------|--------------|---------|
| Queen Waffle | Available | ⋮ menü |
| queenana | Available | ⋮ menü |

| Alan | Açıklama |
|------|----------|
| SKU | Stok kodu (opsiyonel) |

---

#### Categories (Sağ Panel)

**CTA:** [Create your first category]

---

#### Locations and Channels

**Başlık:** "Locations and channels"

**CTA:** [Edit POS tile]

| Kanal | Açıklama | Değer | Aksiyon |
|-------|----------|-------|---------|
| 📍 Locations | Sold at 2 of 2 | 2/2 lokasyon | [Edit] |
| 🏪 Points of sale | POS'ta satış | Toggle ON/OFF | - |
| ➕ Add channel | Yeni kanal ekle | - | Tıkla |

---

#### Add Unit Cost and Vendor `Upgrade`

**Açıklama:** Birim maliyet ve tedarikçi bilgisi (Plus özelliği)

---

#### Variations (Varyasyonlar)

**Başlık:** "Variations"

**Açıklama:**
> "Set prices and availability by variations such as sizes or colors."

**CTA:** [Add]

**Örnek Varyasyonlar:**
| Varyasyon | Örnekler |
|-----------|----------|
| Size | Small, Medium, Large |
| Color | Kırmızı, Mavi, Yeşil |
| Material | Pamuk, Polyester |

---

#### Modifiers

**Başlık:** "Modifiers"

**Açıklama:**
> "Allow customizations such as add-ons or special requests."

**CTA:** [Add] [Learn more]

---

#### Custom Attributes

**Başlık:** "Custom attributes"

**Açıklama:**
> "Track additional details for this item."

**CTA:** [Add] [Learn more]

---

#### Manage Checkout (Ödeme Yönetimi)

**Başlık:** "Manage checkout"

**Payment Links Bilgisi:**
> "Create and manage payment links in Payments & invoices > Payment links. Once links are created, you can copy the link from your Item Library."

---

**This item cannot be purchased on its own:**

**Açıklama:**
> "Recommended for tracking internal costs such as packing materials."

| Ayar | Açıklama | Toggle |
|------|----------|--------|
| Cannot be purchased on its own | Tek başına satılamaz | OFF |

**Kullanım:** Paketleme malzemesi, iç maliyet takibi

---

**Point of Sale:**

**Skip item details screen:**

**Açıklama:**
> "When this item is added to the cart, the first item variation along with any pre-selected modifiers will be applied."

| Ayar | Açıklama | Toggle |
|------|----------|--------|
| Skip item details screen | Ürün detay ekranını atla | OFF |

**Kullanım:** Hızlı satış için, varyasyon/modifier seçimi gerektirmeyen ürünler

---

#### Fulfill Orders (Sipariş Karşılama)

**Başlık:** "Fulfill orders"

| Alan | Değer | Birim |
|------|-------|-------|
| Shipping weight | 0.00 | kg |

---

#### Onboarding Tooltip

**Alt Köşe:**
> 💡 "Get to know the new item creation flow"

Yeni kullanıcılar için rehberlik

---

### Service Library

**Başlık:** "Your Service Library"

**Açıklama:**
> "Selling your time? Create and sell services with a duration."

**Aksiyonlar:**
- [Create service] - Yeni hizmet oluştur

**Hizmet vs Ürün Farkı:**
| Özellik | Item (Ürün) | Service (Hizmet) |
|---------|-------------|------------------|
| Satış türü | Fiziksel/dijital ürün | Süre bazlı |
| Stok | Var | Yok |
| Süre | Yok | Var (30dk, 1 saat vb.) |
| Randevu | Opsiyonel | Genellikle var |
| Örnek | Kahve, T-shirt | Saç kesimi, Masaj |

---

### Image Library

**Başlık:** "Image library"

**Açıklama:**
> "Manage all your item images. To upload, drag and drop images onto this page or upload directly from your device."

**Özellikler:**
- Drag & drop upload
- [Upload] butonu
- Merkezi görsel yönetimi
- Tüm ürün görselleri tek yerden
- Görsel boyutu otomatik optimize

---

### Modifiers

**Başlık:** "Your item modifiers"

**Açıklama:**
> "Modifiers make custom orders simple. Create modifiers that can be applied to an item for faster checkout."

**Aksiyonlar:**
- [Create a modifier] - Yeni modifier oluştur

**LEARN MORE:**
- "Item Modifiers" → Yardım dokümanı linki

**Modifier Örnekleri:**
| Kategori | Örnekler |
|----------|----------|
| Ekstralar | Şeker, süt, sos, peynir |
| Boyut | Small, Medium, Large |
| Pişirme | Az pişmiş, orta, iyi pişmiş |
| Eklentiler | Bacon ekle, avokado ekle |
| Tercihler | Buzsuz, ekstra sıcak |

**Modifier Yapısı:**
- Modifier Set (Grup): "Boyut Seçimi"
  - Modifier (Seçenek): Small (+₺0)
  - Modifier (Seçenek): Medium (+₺5)
  - Modifier (Seçenek): Large (+₺10)

---

### Categories

**Kullanım Alanları:**
- Ürün organizasyonu
- Online mağaza navigasyonu
- Satış raporlama (kategori bazlı)
- Yazıcı yönlendirme (mutfak/bar yazıcısı)

**Özellikler:**
- Hiyerarşik kategoriler (ana/alt)
- Kategori görseli
- Sıralama

---

### Discounts

**İndirim Türleri:**
| Tür | Açıklama |
|-----|----------|
| Percentage | Yüzde indirim (%10, %20) |
| Fixed amount | Sabit tutar (₺50 indirim) |
| Variable | Kasiyerin girdiği tutar |

**Uygulama Kapsamı:**
- Tüm sepete
- Belirli ürünlere
- Belirli kategorilere

---

### Options

**Açıklama:**
> "Add a custom set of options to an item to create variations. For example, a size option set creates variations small, medium, and large."

**Options vs Modifiers Farkı:**
| Özellik | Options | Modifiers |
|---------|---------|-----------|
| Amaç | Varyasyon oluşturma | Özelleştirme |
| Stok | Her varyasyonun ayrı stoğu | Stok etkilemez |
| SKU | Her varyasyonun ayrı SKU'su | SKU değişmez |
| Örnek | Kırmızı/Mavi T-shirt | Ekstra sos |

---

### Units

**Ölçü Birimleri:**
| Birim | Kullanım |
|-------|----------|
| Per Item | Adet bazlı (varsayılan) |
| Per Kg | Kilogram bazlı |
| Per Lt | Litre bazlı |
| Per Hour | Saat bazlı (hizmetler) |
| Per Meter | Metre bazlı |

---

### Custom Attributes

**Özel Özellikler:**
- Ürünlere ekstra bilgi alanları ekleme
- Raporlama için özel alanlar
- Örnek: Menşei, Alerjen bilgisi, Kalori

---

### Subscription Plans

**Üst Banner:**
- "Get your subscriptions business started"
- "Learn how to set up your first plan, make items subscribable, and start selling subscriptions to your customers."
- [Learn more] butonu

**Ana İçerik:**
- "Create your first plan"
- "Generate recurring revenue for your business by offering plans like memberships or a monthly service."
- [Create a plan] butonu

**Subscription Kullanım Alanları:**
| Sektör | Örnek |
|--------|-------|
| Fitness | Aylık üyelik |
| Kafe | Kahve aboneliği (ayda 30 kahve) |
| Güzellik | Aylık bakım paketi |
| Hizmet | Bakım sözleşmesi |
| SaaS | Yazılım aboneliği |

**Plan Özellikleri:**
- Recurring billing (tekrarlayan faturalama)
- Aylık/haftalık/yıllık dönemler
- Otomatik yenileme
- İptal/dondurma seçenekleri

---

---

## Device Management

**Konum:** Settings > Device Management

### Sol Alt Menü

| Menü | Açıklama |
|------|----------|
| Devices | Bağlı cihazların listesi |
| Device codes | QR/kod ile cihaz eşleştirme |
| Modes | POS modları (Restoran, Kafe, Perakende) |
| Printer profiles | Yazıcı profilleri |
| Kitchen displays | KDS cihaz yönetimi |
| Kiosk | Self-servis kiosk ayarları |
| App integrations | Üçüncü parti uygulama entegrasyonları |
| Release manager | Uygulama sürüm yönetimi |

---

### Devices

**Başlık:** "Your devices"

**Açıklama:**
> "View and manage all devices connected to your Square account."

**Cihaz Kartı Bilgileri:**
| Alan | Açıklama |
|------|----------|
| Device name | Cihaz adı (düzenlenebilir) |
| Device type | Tip (Square Terminal, iPad, Android) |
| Status | Durum (Online/Offline) |
| Last seen | Son görülme zamanı |
| Location | Bağlı lokasyon |
| Mode | Aktif mod |
| App version | Uygulama sürümü |
| Battery | Pil durumu (mobil cihazlar) |

**Aksiyonlar:**
| Buton | Açıklama |
|-------|----------|
| Rename | Cihaz adını değiştir |
| Change location | Lokasyon değiştir |
| Change mode | Mod değiştir |
| Unpair | Cihaz eşleşmesini kaldır |

---

### Device Codes

**Başlık:** "Device codes"

**Açıklama:**
> "Generate codes to pair new devices to your Square account."

**Kod Türleri:**
| Tür | Kullanım |
|-----|----------|
| QR Code | Kamera ile tara |
| 6-digit code | Manuel giriş |

**Kod Özellikleri:**
- Tek kullanımlık
- 15 dakika geçerli
- Lokasyon bazlı
- Mod seçilebilir

**Akış:**
```
1. [Generate code] tıkla
2. Lokasyon seç
3. Mod seç
4. QR kod veya 6 haneli kod gösterilir
5. Yeni cihazda kodu gir/tara
6. Cihaz otomatik eşleşir
```

---

### Modes

**Başlık:** "Point of sale modes"

**Açıklama:**
> "Modes let you customize the point of sale experience for different business types."

**Varsayılan Modlar:**
| Mod | Açıklama | Özellikler |
|-----|----------|------------|
| Standard | Genel perakende | Basit checkout |
| Restaurant | Restoran/kafe | Masa yönetimi, mutfak, bahşiş |
| Retail | Mağaza | Stok, barkod, varyasyon |
| Beauty | Güzellik salonu | Randevu, hizmet süresi |

**Mod Ayarları:**
| Ayar | Açıklama |
|------|----------|
| Name | Mod adı |
| Type | Mod tipi |
| Checkout flow | Ödeme akışı |
| Tipping | Bahşiş ayarları |
| Table management | Masa yönetimi (restoran) |
| Kitchen printing | Mutfak yazıcısı |
| Receipt settings | Fiş ayarları |

**Aksiyonlar:**
- [Create mode] - Yeni mod oluştur
- [Edit] - Mod düzenle
- [Duplicate] - Mod kopyala
- [Delete] - Mod sil

---

### Printer Profiles

**Başlık:** "Printer profiles"

**Açıklama:**
> "Create printer profiles to manage how receipts and kitchen tickets are printed."

---

#### Create Profile Ekranı

**Temel Bilgiler:**
| Alan | Açıklama |
|------|----------|
| Profile name | Profil adı (text input) |

---

**Printer Job Types:**
> "Select the items you want to print with this profile. All printers inheriting this profile will only print those items."

| İş Türü | Açıklama | Toggle |
|---------|----------|--------|
| Receipts | Fiş yazdırma - bills, reports, cash drawer açma | ON/OFF |
| In-person order tickets | Mağaza içi sipariş fişleri - checkout sonrası otomatik | ON/OFF |
| Online order tickets | Online sipariş fişleri - prep stations'a gönderim | ON/OFF |

---

**Receipts Ayarları:**
| Ayar | Açıklama | Değerler |
|------|----------|----------|
| Prints receipts | Fiş yazdırma modu | Automatically / Ask / Never |
| Print receipts for declined payments | Reddedilen ödemeler için fiş | Checkbox |

---

**In-Person Order Tickets Ayarları:**
| Ayar | Açıklama | Tip |
|------|----------|-----|
| Single item per ticket | Her ürün ayrı fiş | Checkbox |
| Remove top margin | Üst boşluğu kaldır | Checkbox |
| Categories to Print | Yazdırılacak kategoriler | Dropdown (multi-select) |
| Print kitchen names | Mutfak isimlerini yazdır | Checkbox ✓ |
| Combine identical items | Aynı ürünleri birleştir | Checkbox ✓ |

---

**Online Order Tickets Ayarları:**
| Ayar | Açıklama | Tip |
|------|----------|-----|
| Single item per ticket | Her ürün ayrı fiş | Checkbox |
| Remove top margin | Üst boşluğu kaldır | Checkbox |

---

**Otomatik Yazdırma Seçenekleri:**
| Ayar | Açıklama | Tip |
|------|----------|-----|
| Automatically print new orders | Yeni siparişleri otomatik yazdır | Checkbox |
| Automatically print in-progress orders | Hazırlanan siparişleri yazdır | Checkbox |

> "Online orders will automatically print when it is time to make them."

---

**Ek Özellikler:**
| Özellik | Açıklama | Tip |
|---------|----------|-----|
| Order ticket stubs | Müşteriye stub ver, asıl fiş sonra yazdırılır | Toggle |
| Void tickets | İptal fişleri yazdır | Toggle |
| Barcode Labels | Barkod etiketleri yazdır | Toggle |

> Order ticket stubs: "Give customers a stub for their order. Order ticket stubs only print after an in-person order ticket is printed."

---

**Store Locations:**
> "Printer profiles can show across one or multiple locations."

| Alan | Açıklama |
|------|----------|
| Store location | Lokasyon seçimi (dropdown) |

---

**Kategori Yönlendirme Örneği:**
```
Mutfak Yazıcısı Profili:
- Categories to Print: Yiyecekler, Tatlılar
- Print kitchen names: ✓
- Combine identical items: ✓
- Automatically print new orders: ✓

Bar Yazıcısı Profili:
- Categories to Print: İçecekler, Kokteyller
- Print kitchen names: ✓
- Combine identical items: ✓

Kasa Yazıcısı Profili:
- Receipts: ON
- Prints receipts: Automatically
- Print receipts for declined payments: ✓
```

---

### Kitchen Displays (KDS)

**Başlık:** "Kitchen Display System"

**Açıklama:**
> "Create a kitchen display to view and manage kitchen tickets."

**Upgrade Banner:**
- [Upgrade to Plus] butonu - KDS Plus tier özelliği

---

#### Ana Özellikler

**1. Your orders in one place**
> "View all your orders within a single device, no matter where they're placed."

**Entegrasyon Akışı:**
```
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Square  │ ──► │   KDS   │ ◄── │DoorDash │
│   POS   │     │         │     │         │
└─────────┘     └─────────┘     └─────────┘
                    ▲
                    │
              Online Orders
```

**Desteklenen Kaynaklar:**
- Square POS (mağaza içi)
- Online siparişler
- DoorDash entegrasyonu
- Diğer delivery platformları

---

**2. All about the details**
> "Our reliable tickets have all the information needed by the kitchen, including timers."

**Ticket Bilgileri:**
| Alan | Açıklama |
|------|----------|
| Customer name | Müşteri adı (Kaitlyn S.) |
| Order time | Sipariş saati (4:15) |
| Server name | Garson adı (Reiko M.) |
| Items | Ürün listesi (1 Chicken Soup) |
| Modifiers | Özelleştirmeler |
| Timer | Bekleme süresi |
| Priority | Öncelik göstergesi |

---

#### KDS Ekran Görünümü

**Multi-Station Layout:**
```
┌──────────────────────────────────────────────────────────────────┐
│  Grill          Delivery        Dine-in/Pickup    Bar-5         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐     │
│  │ 2 min  │  │ 1 min  │  │ 5 min  │  │ 3 min  │  │ 1 min  │     │
│  │────────│  │────────│  │────────│  │────────│  │────────│     │
│  │Chicken │  │Beef    │  │Pasta   │  │Salad   │  │Drinks  │     │
│  │Soup    │  │Burger  │  │Alfredo │  │Caesar  │  │2x Coke │     │
│  │        │  │No onion│  │Extra   │  │        │  │1x Beer │     │
│  │        │  │        │  │cheese  │  │        │  │        │     │
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘     │
│                                                                  │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐                 │
│  │ 8 min  │  │ 2 min  │  │ 4 min  │  │ 6 min  │                 │
│  │────────│  │────────│  │────────│  │────────│                 │
│  │Steak   │  │Wings   │  │Pizza   │  │Tacos   │                 │
│  │Medium  │  │BBQ     │  │Peppr.  │  │x3      │                 │
│  └────────┘  └────────┘  └────────┘  └────────┘                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**İstasyon Türleri:**
| İstasyon | Açıklama |
|----------|----------|
| Grill | Izgara istasyonu |
| Delivery | Teslimat siparişleri |
| Dine-in/Pickup | Mağaza içi / Gel-al |
| Bar | İçecek istasyonu |

---

#### KDS Özellikleri

| Özellik | Açıklama |
|---------|----------|
| Order cards | Sipariş kartları |
| Color coding | Renk kodlaması (süre bazlı) |
| Sound alerts | Sesli uyarılar |
| Bump bar | Fiziksel buton desteği |
| Multiple stations | Çoklu istasyon |
| Timer display | Bekleme süresi gösterimi |
| Order source | Sipariş kaynağı (POS/Online/Delivery) |

**İstasyon Ayarları:**
| Ayar | Açıklama |
|------|----------|
| Station name | İstasyon adı (Izgara, Soğuk, Bar) |
| Categories | Hangi kategoriler gösterilsin |
| Display order | Sıralama (FIFO, öncelik) |
| Alert timing | Uyarı süreleri |

**Renk Kodları:**
| Renk | Süre | Anlam |
|------|------|-------|
| Yeşil | 0-5 dk | Normal |
| Sarı | 5-10 dk | Dikkat |
| Kırmızı | 10+ dk | Acil |

---

### Kiosk

**Başlık:** "Get Square Kiosk"

**Açıklama:**
> "Keep your labor costs in line — not your diners. Square Kiosk offers a visual menu that updates in real-time, self-serve ordering and payment, order-ready texts, and more. Let customers order for themselves and free up your staff to focus on hospitality."

**Upgrade Banner:**
- [Get kiosk] - Donanım satın al
- [Learn more] - Detaylı bilgi

**Fiyatlandırma:**
> "Square Kiosk requires hardware and an additional cost of $50/mo per device."
- [Order hardware] linki

---

#### Kiosk Değer Önerileri

**1. Labor Cost Optimization**
- İşçilik maliyetlerini düşür
- Personeli misafirperverliğe odakla

**2. Visual Menu**
- Görsel menü
- Gerçek zamanlı güncelleme

**3. Self-Serve Ordering**
- Müşteri kendi sipariş verir
- Hata azalır

**4. Order-Ready Texts**
- Sipariş hazır SMS bildirimi

---

#### Kiosk Donanım Özellikleri

| Özellik | Değer |
|---------|-------|
| Fiyat | $149 veya $14/ay x 12 ay |
| Aylık yazılım | $50/cihaz |
| iPad gerekli | Evet (USB-C veya Lightning) |
| Ağırlık | 710 g |
| Renkler | Parlak beyaz, mat siyah |

**Ödeme Yöntemleri:**
| Yöntem | Destek |
|--------|--------|
| Temassız (NFC) | ✅ Dahili |
| Chip (EMV) | ✅ Dahili |
| Apple Pay | ✅ |
| Google Pay | ✅ |
| Samsung Pay | ✅ |
| Magstripe | ⚠️ Ayrı reader |

**Montaj Seçenekleri:**
- Açılı duvar montajı
- Düz duvar montajı
- Tezgah üstü montajı
- VESA montajı (100x100mm)

---

#### Kiosk Yazılım Ayarları

| Ayar | Açıklama |
|------|----------|
| Welcome screen | Karşılama ekranı |
| Welcome title | Karşılama başlığı |
| Welcome subtitle | Alt başlık |
| Logo | Marka logosu |
| Background color | Arka plan rengi |
| Accent color | Vurgu rengi |
| Menu layout | Menü düzeni (grid/list/carousel) |
| Show images | Ürün görselleri |
| Show descriptions | Ürün açıklamaları |
| Show calories | Kalori bilgisi |
| Upselling | Çapraz satış önerileri |
| Order number display | Sipariş numarası gösterimi |
| Estimated wait time | Tahmini bekleme süresi |
| Receipt option | Fiş seçeneği (yazdır/e-posta/SMS) |

**Erişilebilirlik:**
| Ayar | Açıklama |
|------|----------|
| Large text mode | Büyük yazı modu |
| High contrast mode | Yüksek kontrast modu |
| Screen reader support | Ekran okuyucu desteği |

---

#### Kiosk Kullanım Senaryoları

| Sektör | Kullanım |
|--------|----------|
| Fast Food | Self-servis sipariş |
| Kafe | Hızlı kahve siparişi |
| QSR | Kuyruk azaltma |
| Food Court | Çoklu kiosk |
| Sinema | Bilet + yiyecek |

---

#### Kiosk Entegrasyonları

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Square    │     │   Square    │     │   Kitchen   │
│    Kiosk    │ ──► │     POS     │ ──► │   Display   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
  Müşteri             Kasa/Yönetim         Mutfak
  Siparişi            Takibi               Hazırlık
```

---

### App Integrations

**Başlık:** "Square App Marketplace"

**Slogan:** "Sync all your apps with Square"

**Açıklama:**
> "From accounting apps and eCommerce solutions to inventory and employee management, Square works with apps for any need."

**CTA:** [Visit App Marketplace]

---

#### Marketplace vs Mobile Add-ons

| Özellik | Mobile Add-ons | App Marketplace |
|---------|----------------|-----------------|
| Geliştirici | Square (birinci parti) | Üçüncü parti |
| Fiyat | Ücretsiz | Değişken |
| Entegrasyon | Dahili | OAuth API |
| Sayı | ~10-15 | 400+ uygulama |

---

#### Entegrasyon Kategorileri

| Kategori | Örnekler |
|----------|----------|
| Accounting | QuickBooks, Xero, Zoho Books |
| E-commerce | BigCommerce, WooCommerce, Weebly, Ecwid |
| Delivery | DoorDash, Postmates, Deliverect |
| Marketing | IFTTT, SumAll |
| Loyalty | Fivestars, Belly |
| Scheduling | Deputy, Homebase, When I Work |
| Inventory | Stitch Labs, Shopventory, MarketMan |
| Kitchen | Fresh KDS |
| Shipping | ShipStation |
| Restaurant | SevenRooms, Restaurant365, Popmenu |

---

#### Popüler Entegrasyonlar

**Online Stores:**
| Uygulama | Açıklama |
|----------|----------|
| BigCommerce | E-ticaret, satış senkronizasyonu |
| WooCommerce | WordPress, ürün/stok sync |
| Weebly | Web sitesi oluşturucu |
| Ecwid | Bulut tabanlı mağaza |
| ShipStation | Kargo yönetimi |

**Accounting:**
| Uygulama | Açıklama |
|----------|----------|
| QuickBooks Online | Muhasebe, gider takibi |
| Xero | Fatura, bordro yönetimi |
| TaxJar | Satış vergisi uyumluluğu |

**Employee Management:**
| Uygulama | Açıklama |
|----------|----------|
| Homebase | Vardiya planlama |
| When I Work | Personel iletişimi |
| TSheets | Saat takibi |

**Kitchen:**
| Uygulama | Açıklama |
|----------|----------|
| Fresh KDS | Tablet mutfak ekranı |
| MarketMan | Restoran envanter |

---

#### Entegrasyon Durumları

| Durum | Açıklama | Renk |
|-------|----------|------|
| Connected | Bağlı, aktif | 🟢 Yeşil |
| Disconnected | Bağlantı kesilmiş | ⚪ Gri |
| Pending | Onay bekliyor | 🟡 Sarı |
| Error | Hata var | 🔴 Kırmızı |

---

#### Bağlantı Akışı

```
1. [Visit App Marketplace] tıkla
2. Uygulama seç
3. [Connect] tıkla
4. OAuth ile yetkilendir
5. Ayarları yapılandır
6. Senkronizasyon başlar
```

---

### Release Manager

**Başlık:** "Release manager"

**Açıklama:**
> "Control when software updates are applied to your devices."

**Güncelleme Seçenekleri:**
| Seçenek | Açıklama |
|---------|----------|
| Automatic | Otomatik güncelle |
| Scheduled | Belirli saatte güncelle |
| Manual | Manuel onay gerekli |

**Güncelleme Penceresi:**
| Ayar | Açıklama |
|------|----------|
| Update window | Güncelleme saati (gece 2-5 gibi) |
| Exclude days | Hariç günler (Cuma, Cumartesi) |
| Notify before | Önceden bildirim |

**Sürüm Bilgileri:**
| Alan | Açıklama |
|------|----------|
| Current version | Mevcut sürüm |
| Available version | Yeni sürüm |
| Release notes | Değişiklik notları |
| Rollback option | Geri alma seçeneği |

---

## Payments & Invoices

**Konum:** Ana menü > Payments & invoices

### Sol Alt Menü

| Menü | Açıklama |
|------|----------|
| Transactions | İşlem geçmişi |
| Orders | Sipariş yönetimi |
| Subscriptions | Abonelik yönetimi |
| Disputes | İtiraz/chargeback yönetimi |

---

### Transactions

**Başlık:** "Jan 17, 2026" (seçili tarih)

**Filtreler:**
| Filtre | Seçenekler |
|--------|------------|
| Date | Tarih seçici (< > navigasyon) |
| All day | Tüm gün / belirli saat |
| All Payment Methods | Ödeme yöntemi |
| All Types | İşlem türü |
| Complete | Durum |
| All Locations | Lokasyon |
| All Sources | Kaynak |
| All Fees | Ücretler |
| Card # | Kart numarası ile ara |

**Arama:**
- Filter by card (last 4) - Son 4 hane ile kart arama

**Export:**
- [Export] butonu - Veri dışa aktarma

**Empty State:**
```
[📋 İkon]
"No Transactions in This Time Frame"
"No transactions took place during the time frame you selected."
```

---

### Orders

**Alt Menü:**
| Menü | Açıklama |
|------|----------|
| Overview | Genel bakış |
| All orders | Tüm siparişler |
| Shipments | Kargo takibi |
| Order partners | Sipariş ortakları |
| Fulfillment settings | Teslimat ayarları |

---

#### Shipments

**Başlık:** "Shipments"

**Tabs:**
| Tab | Açıklama |
|-----|----------|
| To-do | Bekleyen kargolar |
| Shipped | Gönderilmiş kargolar |

**Filtreler:**
| Filtre | Açıklama |
|--------|----------|
| Search | Arama |
| Order status | Sipariş durumu (2) |
| Fulfillment locations | Teslimat lokasyonları (2) |

**Empty State:**
```
[📦 İkon]
"No shipment orders yet."
"We'll let you know when a shipment is ready to be fulfilled."
```

---

#### Order Partners

**Başlık:** "Featured order partners"

**Açıklama:**
> "Offer delivery and order fulfillment from your business to reach more customers and grow your sales."

**Aksiyonlar:**
| Buton | Açıklama |
|-------|----------|
| Manage my apps | Bağlı uygulamaları yönet |
| View all apps | Tüm uygulamaları gör |

**Hata Durumu:**
```
⚠️ "We encountered an error while loading recommended content. Please try again later."
```

---

#### Fulfillment Settings

**Konum:** Settings > Fulfillment methods

**Alt Menü:**
| Menü | Açıklama |
|------|----------|
| Online pickup & delivery | Online sipariş teslimat |
| Shipment | Kargo ayarları |
| Non-physical | Dijital ürün teslimatı |

---

### Shipment Settings

**Başlık:** "Shipment settings"

#### Shipping Locations

**Açıklama:**
> "Manage where your shipments are fulfilled. This is usually the location where inventory is stored and picked up for final delivery. It is also used for tax calculation at checkout for customers."

**Aksiyonlar:**
| Buton | Açıklama |
|-------|----------|
| Ship From Address | Gönderim adresi |
| Map Websites to Shipping Locations | Web sitelerini lokasyonlara eşle |

**Lokasyon Listesi:**
| Alan | Açıklama |
|------|----------|
| Location name | Lokasyon adı (Queen Waffle) |
| Email | E-posta adresleri |
| Address | Adres (Kayseri 38001) |
| Status | Doğrulama durumu (⚠️ Needs verification) |

**Doğrulama Durumları:**
| Durum | Açıklama |
|-------|----------|
| ✅ Verified | Doğrulanmış |
| ⚠️ Needs verification | Doğrulama gerekli |

---

#### Shipping Rate Profiles

**Başlık:** "Shipping rate profiles"

**Açıklama:**
> "Choose rates for your customers. Create profiles that determine how much your customers pay for shipping."

**CTA:** [Add profile] - Yeni profil ekle

**Profil Ayarları:**
- Kargo ücreti hesaplama
- Müşteri ödeme tutarı
- Bölge bazlı fiyatlandırma

---

### Subscriptions

**Başlık:** "Subscriptions"

**Açıklama:**
Tekrarlayan ödemeler ve abonelik yönetimi.

---

### Disputes

**Başlık:** "Disputes"

**Açıklama:**
Chargeback ve itiraz yönetimi.

---

## Customers

**Konum:** Ana menü > Customers

### Sol Alt Menü

| Menü | Açıklama |
|------|----------|
| Customer directory | Müşteri dizini |
| Directory | Müşteri listesi |
| Feedback | Müşteri geri bildirimleri |
| Settings | Müşteri ayarları |

---

### Directory

**Başlık:** "All of your Square customers, organized for you in one place."

**Slogan:** "DIRECTORY"

**CTA:** [See Your Directory]

**Özellikler:**
| Özellik | Açıklama |
|---------|----------|
| Add to your list | POS'ta veya burada müşteri ekle |
| Profiles and activity | Müşteri profilleri, otomatik eklenen aktivite |
| Smart groupings | Akıllı gruplandırma, otomatik organizasyon |

**Müşteri Kartı Örneği:**
```
┌─────────────────────────────────────┐
│  A                                  │
│  ─────────────────────────────────  │
│  Aaron Arras                        │
│  Alicia Lin        ← Seçili         │
│  Amber Penton                       │
│  Angie Smith                        │
│  Avery Wills                        │
├─────────────────────────────────────┤
│  Alicia Lin                         │
│  alycia45@square.com                │
│                                     │
│  ACTIVITY                           │
│  💰 $10.57 Purchase                 │
│  ⭐ Loyalty Earned                  │
└─────────────────────────────────────┘
```

**Ücretsiz Özellikler:**
- ✅ All customers in one place
- ✅ See customer activity
- ✅ Smart groups to organize customers

---

### Feedback

**Başlık:** "Private feedback and conversations with your customers."

**Slogan:** "FEEDBACK"

**CTA:** [See Your Feedback]

**Özellikler:**
| Özellik | Açıklama |
|---------|----------|
| Private feedback from receipts | Fişlerden özel geri bildirim |
| Track what's working | Neyin işe yaradığını takip et |
| Built-in support center | Sorunları doğrudan çöz |

**Ücretsiz Özellikler:**
- ✅ Private, trackable messaging with customers
- ✅ Understand customer satisfaction
- ✅ Digital receipt and directory integration
- ✅ Resolve issues directly and privately
- ✅ Issue coupons and refunds
- ✅ Advanced filters help you track progress

**CTA'lar:**
- [See Your Feedback]
- [Learn more about Square Feedback]

---

### Customer Settings

**Konum:** Customers > Settings

#### Sol Alt Menü

| Menü | Açıklama |
|------|----------|
| Configure profiles | Profil alanlarını yapılandır |
| Instant profiles | Otomatik profil oluşturma |
| Feedback | Geri bildirim ayarları |
| Card on file | Kayıtlı kart yönetimi |

---

#### Configure Profiles

**Başlık:** "Configure profiles"

**Açıklama:**
> "Create custom fields to collect and store new information on a customer's profile. Changes you make will be reflected automatically across all your customers, anywhere you access Square. All information you collect can be exported, and some fields can be searched and filtered."

**CTA:** [Learn More]

---

**Visible Fields (Görünür Alanlar):**

| Alan | Varsayılan | Toggle |
|------|------------|--------|
| Name | ✅ Zorunlu | - |
| Phone | ✅ Zorunlu | - |
| Email | ✅ Zorunlu | - |
| Address | Opsiyonel | ON/OFF |
| Groups | Opsiyonel | ON/OFF |
| Company | Opsiyonel | ON/OFF |
| Reference ID | Opsiyonel | ON/OFF |
| Birthday | Opsiyonel | ON/OFF |

**Aksiyonlar:**
| Buton | Açıklama |
|-------|----------|
| [Create Custom Field] | Özel alan oluştur |
| ⋮⋮ (Drag handle) | Sıralama için sürükle |

**Özel Alan Türleri:**
| Tür | Açıklama |
|-----|----------|
| Text | Metin alanı |
| Number | Sayı alanı |
| Date | Tarih alanı |
| Dropdown | Seçim listesi |
| Checkbox | Onay kutusu |

---

#### Instant Profiles

**Başlık:** "Instant Profiles"

**Toggle:** Enable Instant Profiles (ON/OFF)

**Açıklama:**
> "If this toggle is turned on, when a customer makes a transaction, a profile will be created automatically in your Directory. Each time they make a transaction with the same card, their profile will update with the transaction details."

**Gizlilik Uyarısı:**
> "When this feature is enabled, you are responsible for complying with applicable privacy laws, including maintaining a customer-facing privacy notice regarding the collection and use of your customers' data. You may elect to turn this feature on or off at any time."

**CTA:** [Learn more]

**Nasıl Çalışır:**
```
1. Müşteri ilk kez kart ile ödeme yapar
2. Kart bilgisinden otomatik profil oluşturulur
3. Aynı kart ile sonraki ödemelerde profil güncellenir
4. İşlem geçmişi otomatik eklenir
```

**Faydaları:**
- Manuel müşteri girişi gerektirmez
- Otomatik işlem geçmişi
- Sadakat programı için veri toplama
- Müşteri davranış analizi

---

#### Feedback Settings

**Başlık:** "Feedback Settings"

---

**1. Collect Feedback:**

| Ayar | Açıklama | Tip |
|------|----------|-----|
| Collect feedback from your digital receipts | Dijital fişlerden geri bildirim topla | Toggle ON/OFF |

**CTA:** [Learn about Feedback]

**Locations (Lokasyonlar):**
| Lokasyon | Seçim |
|----------|-------|
| Queen Waffle | ☑️ |
| queenTatila | ☑️ |

---

**2. Feedback Notifications:**

| Ayar | Açıklama | Tip |
|------|----------|-----|
| Receive customer feedback notifications | Müşteri geri bildirim bildirimleri al | Toggle ON/OFF |

**Açıklama:**
> "Specified recipients will receive an email each time a buyer provides feedback."

---

**3. Feedback Recipients:**

**Başlık:** "Feedback Recipients"

| Alan | Değer | Aksiyon |
|------|-------|---------|
| E-posta | hasan.aker@cliniksyn.com | [Edit] |

**Aksiyonlar:**
| Buton | Açıklama |
|-------|----------|
| [Add] | Yeni alıcı ekle |
| [Edit] | Mevcut alıcıyı düzenle |

---

**4. Direct Message Recipients:**

**Başlık:** "Direct Message Recipients"

| Alan | Değer | Aksiyon |
|------|-------|---------|
| E-posta | hasanuaker@cliniksyn.com | - |

**Aksiyonlar:**
| Buton | Açıklama |
|-------|----------|
| [Add] | Yeni alıcı ekle |

**Fark:**
| Tür | Açıklama |
|-----|----------|
| Feedback Recipients | Geri bildirim geldiğinde bildirim alır |
| Direct Message Recipients | Müşteri doğrudan mesaj gönderdiğinde bildirim alır |

---

#### Card on File

**Başlık:** "Print and File Customer Authorization"

**Açıklama:**
> "You need your customer's signed authorization to save their card and protect you from chargeback liability. Have your customer fill out and sign this form, then store it securely in accordance with PCI-DSS and data privacy requirements."

**CTA:** [Download Form] - PDF form indir

---

**Card on File Nedir?**

Müşterinin kartını sistemde kaydetme özelliği:

| Özellik | Açıklama |
|---------|----------|
| Kayıtlı kart | Müşteri kartı bir kez girer, sonra tekrar kullanılır |
| Hızlı ödeme | Tekrar kart bilgisi girmeden ödeme |
| Abonelik | Tekrarlayan ödemeler için gerekli |
| Yetkilendirme | Müşteri imzalı form gerekli |

**Yasal Gereksinimler:**
| Gereksinim | Açıklama |
|------------|----------|
| PCI-DSS | Kart verisi güvenlik standardı |
| Müşteri onayı | İmzalı yetkilendirme formu |
| Güvenli depolama | Şifreli kart verisi |
| Chargeback koruması | İmzalı form ile itiraz koruması |

**Form İçeriği:**
```
CUSTOMER AUTHORIZATION FORM

I, [Müşteri Adı], authorize [İşletme Adı] to charge 
my credit/debit card for purchases.

Card Type: [ ] Visa [ ] MC [ ] Amex [ ] Discover
Card Number: ____-____-____-____
Expiration: __/__
CVV: ___

Signature: ________________
Date: ________________
```

**Kullanım Senaryoları:**
| Senaryo | Açıklama |
|---------|----------|
| Düzenli müşteri | Kafede her gün kahve alan müşteri |
| Abonelik | Aylık üyelik ödemesi |
| Telefonla sipariş | Müşteri aramadan sipariş verir |
| Tab/Hesap | Açık hesap tutma |

---

## Online

**Konum:** Ana menü > Online

### Sol Alt Menü

| Menü | Açıklama |
|------|----------|
| Sales channels | Satış kanalları |

---

### Online Sales Channels

**Başlık:** "Online sales channels"

**Alt Başlık:** "Discover"

#### Retail

| Kanal | Açıklama | Aksiyon |
|-------|----------|---------|
| Meta for Business | Facebook ve Instagram'da reklam ver ve sat | [Set up] |

#### Food Pickup and Delivery

| Kanal | Açıklama | Aksiyon |
|-------|----------|---------|
| Facebook Food Ordering | Facebook ve Instagram için yemek siparişi kur | [View] |
| Pickup and delivery from your point of sale | POS'tan online siparişleri kabul et ve teslim et | [View] |

**Entegrasyon Detayları:**

**Meta for Business:**
> "Advertise and sell on Facebook and Instagram"

**Facebook Food Ordering:**
> "Set up food ordering for Facebook and Instagram"

**Pickup and Delivery:**
> "Accept and fulfill online orders from partners directly in your point of sale device."

---

## Reports

**Konum:** Ana menü > Reports

### Sol Alt Menü Yapısı

#### Sales (Satış Raporları)

| Rapor | Açıklama |
|-------|----------|
| Sales summary | Satış özeti (günlük/haftalık/aylık) |
| Item sales | Ürün bazlı satışlar |
| Sales trends | Satış trendleri (grafik) |
| Category sales | Kategori bazlı satışlar |
| Modifier sales | Modifier bazlı satışlar |

---

#### Accounting (Muhasebe Raporları)

| Rapor | Açıklama |
|-------|----------|
| Sales taxes | Satış vergileri (KDV raporu) |
| Fees | İşlem ücretleri |
| Service charges | Servis ücretleri |
| Reconciliation | Mutabakat raporu |

---

#### Payments (Ödeme Raporları)

| Rapor | Açıklama |
|-------|----------|
| Payment methods | Ödeme yöntemleri dağılımı |
| Discounts | İndirim raporları |
| Comps | İkram raporları |
| Voids | İptal raporları |
| Cash drawers | Kasa hareketleri |

---

#### Operations (Operasyon Raporları)

| Rapor | Açıklama |
|-------|----------|
| Activity log | Aktivite günlüğü (kim ne yaptı) |

---

#### Custom (Özel Raporlar)

| Özellik | Açıklama |
|---------|----------|
| Custom reports | Özel rapor oluşturma |
| Saved reports | Kaydedilmiş raporlar |
| Scheduled reports | Zamanlanmış raporlar (e-posta) |

---

### Rapor Özellikleri

**Filtreler:**
| Filtre | Seçenekler |
|--------|------------|
| Date range | Tarih aralığı |
| Location | Lokasyon |
| Employee | Personel |
| Device | Cihaz |
| Payment method | Ödeme yöntemi |

**Export:**
| Format | Açıklama |
|--------|----------|
| CSV | Excel uyumlu |
| PDF | Yazdırılabilir |
| Email | E-posta ile gönder |

**Karşılaştırma:**
| Tür | Açıklama |
|-----|----------|
| vs Prior day | Önceki gün |
| vs Prior week | Önceki hafta |
| vs Prior month | Önceki ay |
| vs Prior year | Önceki yıl |

---

## Staff

**Konum:** Ana menü > Staff

### Sol Alt Menü Yapısı

#### Scheduling (Vardiya Planlama)

| Menü | Açıklama |
|------|----------|
| Schedule | Vardiya takvimi |
| Availability | Personel müsaitlik durumu |
| Time off | İzin talepleri |

---

#### Time Tracking (Zaman Takibi)

| Menü | Açıklama |
|------|----------|
| Workday | Günlük çalışma özeti |
| Timecards | Puantaj kartları |

---

#### Settings (Personel Ayarları)

| Menü | Açıklama |
|------|----------|
| Schedule | Vardiya ayarları |
| Clock in/out | Giriş/çıkış ayarları |
| Breaks | Mola ayarları |
| Overtime | Fazla mesai ayarları |
| Tips | Bahşiş ayarları |
| Alerts | Bildirim ayarları |

---

### Staff Özellikleri Detayı

#### Schedule (Vardiya Takvimi)

| Özellik | Açıklama |
|---------|----------|
| Drag & drop | Sürükle-bırak vardiya atama |
| Templates | Vardiya şablonları |
| Copy week | Haftayı kopyala |
| Publish | Vardiyaları yayınla |
| Notify | Personele bildirim gönder |

---

#### Availability (Müsaitlik)

| Özellik | Açıklama |
|---------|----------|
| Set availability | Personel müsait günleri belirler |
| Recurring | Tekrarlayan müsaitlik |
| Conflicts | Çakışma uyarıları |

---

#### Time Off (İzin Yönetimi)

| Özellik | Açıklama |
|---------|----------|
| Request | İzin talebi |
| Approve/Deny | Onay/Red |
| Balance | İzin bakiyesi |
| Types | İzin türleri (yıllık, hastalık, vb.) |

---

#### Timecards (Puantaj)

| Özellik | Açıklama |
|---------|----------|
| Clock in/out | Giriş/çıkış saatleri |
| Edit | Manuel düzenleme |
| Approve | Onaylama |
| Export | Bordro için dışa aktar |

---

#### Clock In/Out Settings

| Ayar | Açıklama |
|------|----------|
| PIN required | PIN ile giriş zorunlu |
| Photo capture | Fotoğraf çekimi |
| GPS location | Konum doğrulama |
| Early clock in | Erken giriş limiti |
| Auto clock out | Otomatik çıkış |

---

#### Breaks (Mola Ayarları)

| Ayar | Açıklama |
|------|----------|
| Paid breaks | Ücretli molalar |
| Unpaid breaks | Ücretsiz molalar |
| Auto deduct | Otomatik mola düşümü |
| Break duration | Mola süresi |
| Break reminders | Mola hatırlatıcıları |

---

#### Overtime (Fazla Mesai)

| Ayar | Açıklama |
|------|----------|
| Weekly threshold | Haftalık eşik (40 saat) |
| Daily threshold | Günlük eşik (8 saat) |
| Overtime rate | Fazla mesai çarpanı (1.5x, 2x) |
| Alerts | Fazla mesai uyarıları |

---

#### Tips (Bahşiş Ayarları)

| Ayar | Açıklama |
|------|----------|
| Tip pooling | Bahşiş havuzu |
| Distribution | Dağıtım yöntemi |
| Tip out | Bahşiş paylaşımı (mutfak, bar) |
| Cash tips | Nakit bahşiş girişi |
| Tip reports | Bahşiş raporları |

---

#### Alerts (Bildirimler)

| Bildirim | Açıklama |
|----------|----------|
| Schedule published | Vardiya yayınlandı |
| Shift reminder | Vardiya hatırlatıcı |
| Time off approved | İzin onaylandı |
| Overtime warning | Fazla mesai uyarısı |
| Missed clock in | Giriş yapılmadı |

---

## Settings

**Konum:** Ana menü > Settings (⚙️)

### Tam Menü Yapısı

#### Account & Settings

**Personal Information:**
| Menü | Açıklama |
|------|----------|
| Sign in & security | Giriş ve güvenlik ayarları |
| Preferences | Tercihler (dil, saat dilimi) |

**My Business:**
| Menü | Açıklama |
|------|----------|
| About | İşletme bilgileri |
| Security | Güvenlik ayarları |
| Locations | Lokasyon yönetimi |

---

#### Pricing & Subscriptions

| Menü | Açıklama |
|------|----------|
| Current plan | Mevcut plan |
| Upgrade | Plan yükseltme |
| Billing history | Fatura geçmişi |

---

### Pricing & Subscriptions Detay

**Başlık:** "Pricing & Subscriptions"

**Ödeme Yöntemi:**
| Alan | Değer |
|------|-------|
| Credit Card | No payment method configured |

**Tabs:**
| Tab | Açıklama |
|-----|----------|
| Subscriptions | Aktif abonelikler |
| Domains | Alan adı yönetimi |

**Subscriptions:**
- "You have no active subscriptions"
- Square Plus, Premium gibi planlar burada görünür

**Domains:**
- Weebly/Square Online için alan adı yönetimi
- Custom domain bağlama

---

#### Payments

| Menü | Açıklama |
|------|----------|
| Receipts | Fiş ayarları |
| Sales taxes | Vergi ayarları |
| Check settlement | Çek mutabakatı |

---

### Check Settlement Detay

**Başlık:** "Check settlement"

**Açıklama:**
> "Choose a time that allows staff to add tips. Summary emails will be sent after this time."

---

**When should checks automatically settle?**

| Seçenek | Açıklama | Seçim |
|---------|----------|-------|
| End of working day | Settle at 1:30 am or 1h 30m after close. Tips must be added by that time. | ● (Seçili) |
| 36 hours after check opened | Provides more time to add tips, but delays finalized transfers and reporting. | ○ |

---

**Schedule (Lokasyon Bazlı):**

**Location:** Queen Waffle

| Day | Business Hours | Settlement Time |
|-----|----------------|-----------------|
| Monday | Not set | Tuesday, 1:30 AM |
| Tuesday | Not set | Wednesday, 1:30 AM |
| Wednesday | Not set | Thursday, 1:30 AM |
| Thursday | Not set | Friday, 1:30 AM |
| Friday | Not set | Saturday, 1:30 AM |
| Saturday | Not set | Sunday, 1:30 AM |
| Sunday | Not set | Monday, 1:30 AM |

**Mantık:**
- İş günü kapanışından 1.5 saat sonra otomatik settlement
- Bahşişler bu zamana kadar eklenmiş olmalı
- Settlement sonrası raporlar ve transferler kesinleşir

---

#### Notifications

| Menü | Açıklama |
|------|----------|
| Account | Hesap bildirimleri |
| Service disruptions | Hizmet kesintisi bildirimleri |
| Disputes | İtiraz bildirimleri |

---

#### Fulfillment Methods

| Menü | Açıklama |
|------|----------|
| Online pickup & delivery | Online sipariş teslimat |
| Shipment | Kargo ayarları |
| Non-physical | Dijital ürün teslimatı |

---

#### Device Management

| Menü | Açıklama |
|------|----------|
| Devices | Bağlı cihazlar |
| Device codes | Cihaz eşleştirme kodları |
| Modes | POS modları |
| Printer profiles | Yazıcı profilleri |
| Kitchen displays | KDS ayarları |
| Kiosk | Self-servis kiosk |
| App integrations | Uygulama entegrasyonları |
| Release manager | Sürüm yönetimi |

---

### Profil Menüsü (Sağ Üst)

**Kullanıcı Bilgisi:**
```
Hasan Aker
Owner
```

**Menü Öğeleri:**

| Menü | Açıklama |
|------|----------|
| 🎁 Earn rewards | Referral programı (ödül kazan) |
| Account settings | Hesap ayarları |
| Feature log | Özellik günlüğü (yeni özellikler) |
| Roadmap | Ürün yol haritası |
| Cookie preferences | Çerez tercihleri |
| Square Community | Topluluk forumu |
| Sign out | Çıkış yap |

---

#### Earn Rewards (Referral Program)

**Konum:** Profil menüsü > Earn rewards

**Açıklama:**
Square'in referral programı - yeni müşteri getirene ödül.

| Özellik | Açıklama |
|---------|----------|
| Referral link | Benzersiz referans linki |
| Rewards earned | Kazanılan ödüller |
| Pending rewards | Bekleyen ödüller |
| Terms | Program şartları |

---

#### Feature Log

**Açıklama:**
Yeni eklenen özelliklerin listesi - kullanıcıyı güncel tutar.

| Özellik | Açıklama |
|---------|----------|
| New features | Yeni özellikler |
| Improvements | İyileştirmeler |
| Release notes | Sürüm notları |
| Mark as read | Okundu işaretle |

---

#### Roadmap

**Açıklama:**
Square'in gelecek planları - şeffaflık ve beklenti yönetimi.

| Özellik | Açıklama |
|---------|----------|
| Coming soon | Yakında gelecek |
| In development | Geliştirmede |
| Under consideration | Değerlendirmede |
| Vote | Özellik için oy ver |

---

#### Square Community

**Açıklama:**
Kullanıcı forumu - sorular, cevaplar, best practices.

| Özellik | Açıklama |
|---------|----------|
| Forums | Tartışma forumları |
| Q&A | Soru-cevap |
| Best practices | En iyi uygulamalar |
| Feature requests | Özellik talepleri |

---

### Settings Alt Bölüm Detayları

#### Sign In & Security

**Başlık:** "Sign in"

---

**1. Sign In Credentials:**

| Alan | Değer | Aksiyon |
|------|-------|---------|
| Email | hasan.aker@clinisyn.com | [Verify] [Update] |
| Phone | No phone number | [Add] |
| Password | Last changed Jan 17, 2026 | [Update] |

**Email Verification:**
- ⚠️ "Verification needed" uyarısı
- E-posta doğrulanmadan bazı özellikler kısıtlı

---

**2. Personal POS Passcode:**

**Başlık:** "Personal POS Passcode for Queen Waffle"

**Açıklama:**
> "Your personal POS passcode is used to log in and clock in on the Queen Waffle point of sale. Please don't share this passcode with anyone."

**CTA:** [Add passcode]

**Kullanım:**
| Senaryo | Açıklama |
|---------|----------|
| POS giriş | Kasada hızlı giriş |
| Clock in | Vardiya başlatma |
| Yetkilendirme | İndirim/iptal onayı |

---

**3. Passkeys (Beta):**

**Başlık:** "Passkeys" `Beta`

**Açıklama:**
> "Sign in quickly and securely with passkeys. No passwords are required. Just use your fingerprint, face, or PIN. Passkeys are safe from phishing and password breaches, and your biometrics stay private. Sync up to five passkeys across devices."

| Alan | Değer | Aksiyon |
|------|-------|---------|
| Passkeys | No passkey | [Create a passkey] |

**Passkey Avantajları:**
| Özellik | Açıklama |
|---------|----------|
| Şifresiz giriş | Parmak izi, yüz veya PIN |
| Phishing koruması | Şifre çalınamaz |
| Cihazlar arası sync | 5 cihaza kadar |
| Biyometrik gizlilik | Veriler cihazda kalır |

---

**4. Two-Step Verification:**

**Başlık:** "Two-step verification" `Recommended`

**Açıklama:**
> "An extra layer to boost your Square account security. A verification code will be required in addition to your password each time you sign in."

**CTA:** [Enable] [Learn more]

**Yöntemler:**
| Yöntem | Açıklama |
|--------|----------|
| SMS | Telefona kod gönder |
| Authenticator app | Google/Microsoft Authenticator |
| Backup codes | Yedek kodlar |

---

**5. Sign Out Everywhere:**

**Başlık:** "Sign out everywhere"

**Açıklama:**
> "If you lost a device or left logged in a public computer, you can sign out everywhere except your current browser."

**CTA:** [Sign out everywhere] (kırmızı link)

---

**6. Security - Ways to Verify:**

**Başlık:** "Ways to verify it's you"

**Açıklama:**
> "Square can contact you if there's unusual activity in your account, help you access and recover your account, and send you other transactional messages about your account."

**Doğrulama Yöntemleri:**
| Yöntem | Kullanım |
|--------|----------|
| Email | Hesap kurtarma |
| Phone | SMS doğrulama |
| Backup email | Yedek e-posta |

---

#### Preferences (Account Preferences)

**Başlık:** "Account preferences"

| Alan | Değer | Tip |
|------|-------|-----|
| Language | English | Dropdown |
| Time Zone | Europe/Istanbul | Dropdown |

**Dil Seçenekleri:**
- English
- Español
- Français
- 日本語
- (Türkçe - PIXPOS'ta eklenecek)

**Saat Dilimi:**
- Otomatik algılama
- Manuel seçim
- Tüm dünya saat dilimleri

---

#### About (Business Info)

**Başlık:** "About"

**Alt Başlık:** "Manage your business account and settings."

---

**İşletme Bilgileri:**

| Alan | Değer | Aksiyon |
|------|-------|---------|
| Display Business Name | Queen Waffle | [Edit] |
| Preferred Business Owner Name | Hasan Aker | - |
| Language | English | [Edit] |

---

**Branding:**

**Açıklama:**
> "Customize your customer facing touchpoints like receipts, invoices, appointment booking flow, and checkout screens by adding your brand's color and logo."

**Mevcut Markalar:**
| Marka | Uygulanan Lokasyonlar | Aksiyon |
|-------|----------------------|---------|
| Queen Waffle brand | Applied to 2 locations | ✏️ (Edit) |

**CTA:** [+ Create new] - Yeni marka oluştur

**Branding Kullanım Alanları:**
- Fişler
- Faturalar
- Randevu rezervasyon akışı
- Ödeme ekranları
- Online mağaza

---

**Deactivate Your Business:**

**Başlık:** "Deactivate your business"

**Uyarı:**
> "Deactivating your business means that you will be unable to receive or recover any of your payment history or account information."

**CTA:** [Deactivate your business] (kırmızı buton)

**Deactivation Sonuçları:**
| Sonuç | Açıklama |
|-------|----------|
| Ödeme geçmişi | Erişilemez |
| Hesap bilgileri | Kurtarılamaz |
| Abonelikler | İptal edilir |
| Cihazlar | Eşleşme kaldırılır |

---

#### Security (Business)

**Başlık:** "Security"

---

**Business Two-Step Verification:**

**Açıklama:**
> "An extra layer to boost your team members account security. A verification code will be required in addition to password each time you sign in."

**CTA:** [Learn more]

| Ayar | Açıklama | Toggle |
|------|----------|--------|
| Two-step verification for team members at Queen Waffle | Team members must enable their own verification methods. | OFF |

**Önemli:**
- İşletme sahibi tüm ekip için 2FA zorunlu kılabilir
- Her ekip üyesi kendi doğrulama yöntemini seçer
- Güvenlik politikası merkezi yönetim

---

#### Locations

**Başlık:** "Locations"

**Arama:** Location filter (arama kutusu)

**Uyarı Banner:**
> ⚠️ "2 locations are active for payments but do not have an address. Please update their addresses."

---

**Lokasyon Tablosu:**

| Nickname | Location Type | Address | Location |
|----------|---------------|---------|----------|
| Queen Waffle | Physical | [Update Address] | Kayseri |
| queenana | Physical | [Update Address] | Kayseri |

**Tablo Özellikleri:**
- Sıralama (↑↓) her sütunda
- Filtreleme
- Toplu işlem

**Lokasyon Türleri:**
| Tür | Açıklama |
|-----|----------|
| Physical | Fiziksel mağaza |
| Mobile | Mobil satış (food truck, pazar) |

**Adres Doğrulama:**
- Ödeme işlemleri için adres gerekli
- Vergi hesaplaması için önemli
- Müşteri fişlerinde görünür

---

## PIXPOS için Notlar

✅ Bizde var:
- Ürün yönetimi (temel)
- Kategori yönetimi
- Modifier sistemi

❌ Eksik (Square'de var):
- Image library (merkezi görsel yönetimi)
- Service library (hizmet satışı)
- Channel listings (çok kanallı satış)
- Subscription plans (abonelik)
- Custom attributes
- CSV import/export
- Options (varyasyon sistemi)
- Units (ölçü birimleri)
- Device Management (cihaz yönetimi)
- Device codes (QR eşleştirme)
- Modes (POS modları)
- Printer profiles (yazıcı profilleri)
- Kitchen displays (KDS yönetimi)
- Kiosk (self-servis)
- App integrations (entegrasyonlar)
- Release manager (sürüm yönetimi)
- Configure profiles (müşteri profil alanları)
- Instant profiles (otomatik profil oluşturma)
- Feedback settings (geri bildirim ayarları)
- Card on file (kayıtlı kart yönetimi)
- Reports (kapsamlı raporlama sistemi)
- Staff scheduling (vardiya planlama)
- Time tracking (zaman takibi)
- Tips management (bahşiş yönetimi)
- Overtime settings (fazla mesai)
