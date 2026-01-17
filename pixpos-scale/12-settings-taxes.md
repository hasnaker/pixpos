# Square Settings - Sales Taxes (Vergi Ayarları)

**Kaynak:** Square Dashboard > Settings > Sales taxes  
**Tarih:** 17 Ocak 2026

---

## Genel Bilgi

> Square provides tools that help you create and manage taxes quickly and efficiently. It is your responsibility to accurately configure, charge, collect, and remit applicable taxes on your orders. We recommend consulting a tax advisor to ensure taxes are applied and filed correctly. Once taxes are configured in your Websites Dashboard or Square App, they will be automatically applied to your POS and online orders. Tax collection is enabled by default for online orders.

---

## Vergi Listesi Görünümü

### In-person sales taxes
> Set up your taxes for all in-person sales, including delivery and pickup. Tax Rules often vary by jurisdiction, fulfillment, or sales channel, so consult a tax advisor if you have any questions.

**Tablo Kolonları:**
| Kolon | Açıklama |
|-------|----------|
| Tax name | Vergi adı |
| Locations | Uygulandığı lokasyonlar |
| Status | Enabled / Disabled |
| Tax rate | Vergi oranı (%) |

**Özellikler:**
- 🔍 Search bar (vergi arama)
- [Create tax] butonu
- Satıra tıklayınca düzenleme

---

## Boş Durum (Empty State)

**İkon:** % işareti (kesik çizgili)

**Başlık:** No sales taxes exist

**Açıklama:** Sales tax created in Square Dashboard will sync to all devices signed in to this account. The tax amount will be automatically calculated at purchase.

**CTA:** [Set up your taxes] butonu

---

## Create Tax Formu

### Details
| Alan | Tip | Açıklama |
|------|-----|----------|
| Name | Text | Vergi adı (örn: "Sales Tax", "KDV") |
| Tax rate | Percentage | Vergi oranı (örn: 10%) |
| Locations | Dropdown | Hangi lokasyonlara uygulanacak |

### Apply tax to (2 seçenek)
| Seçenek | Açıklama |
|---------|----------|
| All current and future taxable items at selected locations | Tüm mevcut ve gelecek ürünlere otomatik uygula |
| Select items | Manuel olarak ürün seç |

### Taxable Items
- Dropdown: All Items / Specific items

### Apply tax to custom amounts
- Toggle switch (on/off)
- Özel tutarlara da vergi uygula

---

## Tax Calculation (Vergi Hesaplama Yöntemi)

| Tip | Açıklama | Yaygın Bölge |
|-----|----------|--------------|
| **Additive tax** | Vergi birim fiyatın üzerine eklenir, fişte ayrı satır olarak görünür | Kuzey Amerika |
| **Inclusive tax** | Vergi fiyatın içinde, fişte gösterilir ama toplama eklenmez | Avrupa, Avustralya, Japonya, **Türkiye** |

---

## Tax Rules (Vergi Kuralları)

### Create tax rule
| Alan | Açıklama |
|------|----------|
| Tax rule name | Kural adı |
| Rule type | Tax exemption (muafiyet) veya Tax reduction (indirim) |
| Conditions | Max 2 koşul eklenebilir |

**Rule Types:**
- **Tax exemption** - Vergi muafiyeti (tamamen vergisiz)
- **Tax reduction** - Vergi indirimi (düşük oran)

**Condition Types (Koşul Türleri):**
| Koşul | Açıklama | Örnek Kullanım |
|-------|----------|----------------|
| **Item price** | Ürün fiyatı belirli tutarın altındaysa | "₺10 altı ürünler vergisiz" |
| **Total price** | Toplam tutar belirli tutarın altındaysa | "₺50 altı siparişler vergisiz" |
| **Item quantity** | Ürün adedi belirli sayıdan fazla/az ise | "5+ adet alımda vergi indirimi" |

**Not:** "The rule will apply when all conditions are met" - Tüm koşullar sağlandığında uygulanır (AND mantığı)

---

## Exemptions (Muafiyetler)

- Boş durum: "No rule created"
- Açıklama: "Create a rule for when a tax exemption should apply"
- [Create rule] butonu

---

### Butonlar
- **X** - Kapat
- **Save** - Kaydet

---

## Özellikler

- Vergi tanımlama (isim + oran)
- Lokasyon bazlı vergi
- Ürün bazlı veya tüm ürünlere uygulama
- Tüm cihazlara otomatik sync
- Satın alma anında otomatik hesaplama
- Online siparişlerde varsayılan olarak aktif
- Özel tutarlara vergi uygulama seçeneği

---

## PIXPOS için Notlar

✅ Bizde var:
- Vergi oranı (sabit %8 KDV)

❌ Eksik:
- Çoklu vergi tanımlama
- Ürün bazlı vergi
- Lokasyon bazlı vergi
- Vergi sync (tüm cihazlara)
- Online sipariş vergi ayarı
