# Square Settings - Locations (Lokasyon/Şube Yönetimi)

**Kaynak:** Square Dashboard > Settings > My business > Locations  
**Tarih:** 17 Ocak 2026

---

## Locations Listesi

**Uyarı Banner:**
> ⚠️ 1 location is active for payments but does not have an address. Please update its address.

**Tablo Kolonları:**
| Kolon | Açıklama | Sıralanabilir |
|-------|----------|---------------|
| Nickname | Lokasyon takma adı | ↑ |
| Location Type | Physical / Mobile / vb. | ↑ |
| Address | Adres (Update Address linki) | ↑ |
| Location | Şehir | ↑ |
| Phone | Telefon | ↑ |
| Email | E-posta | ↑ |

**Özellikler:**
- 🔍 Location filter (arama)
- [Create Location] butonu
- Satıra tıklayınca düzenleme
- Tüm kolonlar sıralanabilir (↑↓)

## Create Location Formu

### Basic information
| Alan | Zorunlu | Limit | Açıklama |
|------|---------|-------|----------|
| Location business name | ✅ | - | Fişlerde görünen isim |
| Location nickname | ✅ | - | Dahili kullanım için takma ad |
| Business description | ❌ | 1024 karakter | İşletme açıklaması |

**Önemli Kısıtlama:**
> ⚠️ Location Business Name **12 ayda maksimum 3 kez** değiştirilebilir. Daha fazla değişiklik için Support ile iletişime geçilmeli.

### Business address
| Alan | Tip | Açıklama |
|------|-----|----------|
| Location type | Dropdown | Physical location, Mobile, vb. |
| Address line 1 | Text | Ana adres |
| Address line 2 | Text | Ek adres bilgisi |
| Postal code | Text | Posta kodu |
| District | Text | İlçe |
| Province | Dropdown | İl/Eyalet |

### Contact information
| Alan | Tip |
|------|-----|
| Email | Email |
| Phone | Phone |

### Social contact
| Alan | Tip |
|------|-----|
| Website | URL |
| X (Twitter) | Username |
| Instagram | Username |
| Facebook | URL/Username |

### Branding (Lokasyon bazlı)
> Customize your customer facing touchpoints like receipts, invoices, appointment booking flow, and checkout screens with your brand's color and logo.

- Mevcut brand gösterimi (logo + isim)
- Edit butonu (✏️) ile düzenleme
- **Lokasyon bazlı farklı branding** mümkün!

### Business hours
| Alan | Tip | Açıklama |
|------|-----|----------|
| Time Zone | Dropdown | Europe/Istanbul, vb. |

**Regular hours:**
> Let your clients know when you're open.

| Gün | Açılış | Kapanış |
|-----|--------|---------|
| Monday - Sunday | Time picker | Time picker |

- Her gün için checkbox (açık/kapalı)
- Açılış ve kapanış saati ayrı ayrı

### Preferred language
> Set the language for Square emails and customer receipts.

| Alan | Tip |
|------|-----|
| Select language | Dropdown (English, Turkish, vb.) |

### Match item library from another location
> Matching another location's item library will **configure all items, modifiers, taxes** and everything found under your **item settings**.

| Alan | Tip | Açıklama |
|------|-----|----------|
| Location | Dropdown | Başka lokasyondan ürün/ayar kopyala |

**Önemli:** Bu özellik yeni şube açarken mevcut menüyü hızlıca kopyalamak için!

---

## Address Verification (Adres Doğrulama)

Save'e basıldığında adres doğrulama modalı açılabilir:

**Verify your address**
> We couldn't find the address you provided. Please choose one of the following:

| Seçenek | Açıklama |
|---------|----------|
| **Suggested address** | Sistem önerisi (Recommended badge) |
| **You entered** | Kullanıcının girdiği adres |

**Butonlar:**
- [Use this address] - Seçili adresi kullan
- [Edit entered address] - Adresi düzenle

**Not:** Square adres doğrulama servisi kullanıyor (muhtemelen Google Maps API)

---

## Location Types (Lokasyon Türleri)

| Tür | Açıklama |
|-----|----------|
| Physical | Fiziksel mağaza/restoran |
| Mobile | Mobil satış (food truck, seyyar) |
| <!-- Diğerleri eklenecek --> | |

---

## PIXPOS için Notlar

✅ Bizde var:
- Tek lokasyon (Queen Waffle)

❌ Eksik:
- Multi-location yönetimi
- Lokasyon türü seçimi
- Lokasyon bazlı ayarlar
- Lokasyon bazlı raporlama
- Lokasyon filter/arama
