# UI/UX Ekibi - Ekran Listesi

Square'den alınacak ekranlar ve UX patternleri.

---

## 📱 Mobil App Ekranları

### Onboarding
| Ekran | Açıklama | Referans |
|-------|----------|----------|
| Sign In | Email + şifre girişi | 04-square-mobile-apps.md |
| Two-Step Verification | 2FA seçenekleri | 04-square-mobile-apps.md |
| Select Location | Lokasyon seçimi | 04-square-mobile-apps.md |
| Device Permissions | İzin isteme | 04-square-mobile-apps.md |

### Ana Ekranlar
| Ekran | Açıklama | Referans |
|-------|----------|----------|
| Checkout - Keypad | Manuel tutar girişi | 04-square-mobile-apps.md |
| Checkout - Library | Ürün kütüphanesi | 04-square-mobile-apps.md |
| Checkout - Favorites | Sık kullanılanlar grid | 04-square-mobile-apps.md |
| Transactions | İşlem geçmişi | 04-square-mobile-apps.md |
| Notifications | Bildirimler | 04-square-mobile-apps.md |
| More Menu | Diğer menüler | 04-square-mobile-apps.md |

### Orders
| Ekran | Açıklama |
|-------|----------|
| All Orders | Tüm siparişler listesi |
| Order Filters | Filtre seçenekleri |
| Order Detail | Sipariş detayı |

### Reports
| Ekran | Açıklama |
|-------|----------|
| Sales Report | Satış raporu |
| Date Picker | Tarih seçici |
| Comparison View | Karşılaştırma görünümü |
| Disputes | İtiraz yönetimi |

### Items
| Ekran | Açıklama |
|-------|----------|
| Item List | Ürün listesi |
| Create Item | Ürün oluşturma formu |
| Auto Create | Barkod tarama |
| AI Description | AI açıklama modal |
| Categories | Kategori yönetimi |
| Modifiers | Modifier yönetimi |

### Customers
| Ekran | Açıklama |
|-------|----------|
| Customer List | Müşteri listesi |
| Create Customer | Müşteri oluşturma |
| Customer Groups | Grup yönetimi |
| Merge Customers | Birleştirme |

### Add-ons
| Ekran | Açıklama |
|-------|----------|
| Add-ons List | Eklenti listesi |
| Add-on Detail | Eklenti detay sayfası |

### Referrals
| Ekran | Açıklama |
|-------|----------|
| Referral Home | Ana referans ekranı |
| Your Rewards | Ödüller listesi |
| KYC Modal | Kimlik doğrulama |

### Support
| Ekran | Açıklama |
|-------|----------|
| Support Menu | Destek menüsü |
| Get Help | Yardım al |
| Tutorials | Eğitimler |
| About | Hakkında |

### Settings
| Ekran | Açıklama |
|-------|----------|
| Settings Home | Ayarlar ana menü |
| Checkout Settings | Ödeme ayarları |
| Hardware | Donanım ayarları |
| Security | Güvenlik ayarları |
| Account | Hesap ayarları |

---

## 💻 Web Dashboard Ekranları

### Home
| Ekran | Açıklama | Referans |
|-------|----------|----------|
| Dashboard | Ana performans dashboard | 05-square-web-dashboard.md |
| Setup Progress | Kurulum ilerleme | 08-onboarding.md |

### Items & Services
| Ekran | Açıklama |
|-------|----------|
| Item Library | Ürün kütüphanesi |
| Service Library | Hizmet kütüphanesi |
| Image Library | Görsel kütüphanesi |
| Modifiers | Modifier yönetimi |
| Categories | Kategori yönetimi |
| Discounts | İndirim yönetimi |
| Options | Seçenek yönetimi |
| Units | Birim yönetimi |
| Custom Attributes | Özel özellikler |
| Subscription Plans | Abonelik planları |

### Settings
| Ekran | Açıklama | Referans |
|-------|----------|----------|
| Receipts | Fiş ayarları | 10-settings-receipts.md |
| Branding | Marka ayarları | 11-branding.md |
| Sales Taxes | Vergi ayarları | 12-settings-taxes.md |
| Locations | Lokasyon yönetimi | 13-settings-locations.md |
| Device Management | Cihaz yönetimi ana menü | 05-square-web-dashboard.md |
| Devices | Cihaz listesi | 05-square-web-dashboard.md |
| Device Codes | QR/kod eşleştirme | 05-square-web-dashboard.md |
| Modes | Mod yönetimi | 05-square-web-dashboard.md |
| Mode Editor | Mod düzenleme formu | 05-square-web-dashboard.md |
| Printer Profiles | Yazıcı profilleri | 05-square-web-dashboard.md |
| Printer Profile Editor | Profil düzenleme | 05-square-web-dashboard.md |
| Kitchen Displays | KDS yönetimi | 05-square-web-dashboard.md |
| Kitchen Station Editor | İstasyon düzenleme | 05-square-web-dashboard.md |
| Kiosk | Kiosk ayarları | 05-square-web-dashboard.md |
| Kiosk Customizer | Kiosk özelleştirme | 05-square-web-dashboard.md |
| App Integrations | Entegrasyon listesi | 05-square-web-dashboard.md |
| Integration Detail | Entegrasyon detay | 05-square-web-dashboard.md |
| Release Manager | Sürüm yönetimi | 05-square-web-dashboard.md |

---

## 🎨 UX Patternleri

### 1. Empty States

Her boş ekranda:
1. İlgili ikon
2. Başlık (ne yapılacak)
3. Açıklama (neden önemli)
4. Primary CTA butonu
5. Secondary link (Learn more)

**Örnek:**
```
┌─────────────────────────────────────┐
│                                     │
│            [📋 İkon]                │
│                                     │
│         "No items yet"              │
│                                     │
│   Create items to speed up          │
│   checkout and track inventory.     │
│                                     │
│   [Create an item] [Import items]   │
│                                     │
│      Learn more about items →       │
│                                     │
└─────────────────────────────────────┘
```

---

### 2. Setup Progress (Gamification)

```
┌─────────────────────────────────────┐
│  You're 83% set up                  │
│  ████████████████░░░░ 83%           │
│                                     │
│  ✅ Create account                  │
│  ✅ Add business info               │
│  ✅ Upload logo                     │
│  ○  Add first item                  │
│  ○  Make first sale                 │
│                                     │
└─────────────────────────────────────┘
```

---

### 3. Quick Actions

Dashboard'da hızlı erişim butonları:
```
┌─────────────────────────────────────┐
│  Quick Actions                      │
│                                     │
│  [+ Add item] [Take payment]        │
│  [View reports] [Add team member]   │
│                                     │
└─────────────────────────────────────┘
```

---

### 4. Inline Editing

Tablolarda direkt düzenleme:
```
┌──────────────┬─────────┬──────────┐
│ Product      │ Price   │ Stock    │
├──────────────┼─────────┼──────────┤
│ Latte        │ [₺60]   │ [∞]      │  ← Tıkla, düzenle
│ Cappuccino   │ [₺55]   │ [∞]      │
└──────────────┴─────────┴──────────┘
```

---

### 5. Filter Chips

Hızlı filtreleme:
```
[All] [Active ✓] [Completed] [Cancelled]
```

---

### 6. Search Everywhere

Her ekranda arama:
```
┌─────────────────────────────────────┐
│  🔍 Search settings...              │
└─────────────────────────────────────┘
```

---

### 7. Mode Switcher

Mod değiştirme bottom sheet:
```
┌─────────────────────────────────────┐
│  Switch mode                        │
│                                     │
│  ● Standard mode                    │
│    Active on 2 devices              │
│                                     │
│  ○ Restaurant mode                  │
│    Active on 0 devices              │
│                                     │
│  [+ Add mode]                       │
│                                     │
│  [Done]                             │
└─────────────────────────────────────┘
```

---

### 8. Confirmation Modals

Kritik işlemlerde onay:
```
┌─────────────────────────────────────┐
│  Delete item?                       │
│                                     │
│  "Latte" will be permanently        │
│  deleted. This cannot be undone.    │
│                                     │
│  [Cancel]  [Delete]                 │
└─────────────────────────────────────┘
```

---

### 9. Toast Notifications

İşlem sonucu bildirimi:
```
┌─────────────────────────────────────┐
│  ✓ Item saved successfully          │
└─────────────────────────────────────┘
```

---

### 10. Loading States

Skeleton loading:
```
┌─────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└─────────────────────────────────────┘
```

---

### 11. Device Pairing Flow

QR kod ile cihaz eşleştirme:
```
┌─────────────────────────────────────┐
│  Pair a new device                  │
│                                     │
│  Step 1: Select location            │
│  [Queen Waffle - Kadıköy ▼]         │
│                                     │
│  Step 2: Select mode                │
│  [Restaurant mode ▼]                │
│                                     │
│  Step 3: Scan or enter code         │
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │      [QR CODE IMAGE]        │    │
│  │                             │    │
│  │      or enter code:         │    │
│  │         A3B7K9              │    │
│  │                             │    │
│  │   Expires in 14:32          │    │
│  └─────────────────────────────┘    │
│                                     │
│  [Generate new code]                │
│                                     │
└─────────────────────────────────────┘
```

---

### 12. Device Status Cards

Cihaz durumu kartları:
```
┌─────────────────────────────────────┐
│  📱 Kasa 1                    ● Online│
│                                     │
│  iPad Pro 12.9" • v2.4.1            │
│  Queen Waffle - Kadıköy             │
│  Restaurant mode                    │
│                                     │
│  Last seen: Just now                │
│  🔋 87%                             │
│                                     │
│  [Rename] [Change mode] [Unpair]    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  📱 Garson Tablet 2          ○ Offline│
│                                     │
│  Samsung Tab S8 • v2.4.0            │
│  Queen Waffle - Kadıköy             │
│  Restaurant mode                    │
│                                     │
│  Last seen: 2 hours ago             │
│  🔋 23% ⚠️                          │
│                                     │
│  [Rename] [Change mode] [Unpair]    │
└─────────────────────────────────────┘
```

---

### 13. Printer Profile Editor

Yazıcı profili oluşturma/düzenleme:
```
┌─────────────────────────────────────┐
│  × Create profile            [Save] │
├─────────────────────────────────────┤
│                                     │
│  Profile name                       │
│  [                             ]    │
│                                     │
│  ─────────────────────────────────  │
│  Printer job types                  │
│  Select the items you want to       │
│  print with this profile.           │
│  ─────────────────────────────────  │
│                                     │
│  ☐ Receipts                    [○]  │
│    When on, this printer will also  │
│    print bills, reports and open    │
│    cash drawers.                    │
│                                     │
│    Prints receipts                  │
│    [Automatically ▼]                │
│                                     │
│    ☐ Print receipts for declined    │
│      payments                       │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ☐ In-person order tickets     [○]  │
│    Use order tickets to send orders │
│    to prep stations. Order tickets  │
│    will print automatically after   │
│    checkout.                        │
│                                     │
│    ☐ Single item per ticket         │
│    ☐ Remove top margin              │
│                                     │
│    Categories to Print              │
│    [Uncategorized items ▼]          │
│                                     │
│    ☑ Print kitchen names            │
│    ☑ Combine identical items        │
│                                     │
│    ☐ Automatically print new orders │
│    ☐ Automatically print            │
│      in-progress orders             │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ☐ Online order tickets        [○]  │
│    Use online order tickets to send │
│    online orders to prep stations.  │
│                                     │
│    ☐ Single item per ticket         │
│    ☐ Remove top margin              │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ☐ Order ticket stubs          [○]  │
│    Give customers a stub for their  │
│    order. Only print after an       │
│    in-person order ticket printed.  │
│                                     │
│  ⊘ Void tickets                [○]  │
│                                     │
│  ▌▌▌ Barcode Labels            [●]  │
│                                     │
│  ─────────────────────────────────  │
│  Store locations                    │
│  Printer profiles can show across   │
│  one or multiple locations.         │
│                                     │
│  Store location                     │
│  [Select location ▼]                │
│                                     │
└─────────────────────────────────────┘
```

---

### 14. Kitchen Station Setup

KDS istasyon ayarları:
```
┌─────────────────────────────────────┐
│  ← Kitchen displays                 │
│                                     │
│  Station name                       │
│  [Izgara İstasyonu             ]    │
│                                     │
│  Categories                         │
│  [✓] Burgerler                      │
│  [✓] Steakler                       │
│  [✓] Tavuklar                       │
│  [ ] Salatalar                      │
│  [ ] İçecekler                      │
│                                     │
│  Alert timings                      │
│  Warning (yellow): [5] minutes      │
│  Urgent (red): [10] minutes         │
│                                     │
│  Sound                              │
│  [✓] Play sound for new orders      │
│  Sound type: [Chime ▼]              │
│                                     │
│  [Save]                             │
└─────────────────────────────────────┘
```

---

### 15. Kiosk Customizer

Kiosk görünüm özelleştirme:
```
┌─────────────────────────────────────┐
│  Kiosk Preview          [Desktop]   │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │     [LOGO]                  │    │
│  │                             │    │
│  │   Welcome to Queen Waffle   │    │
│  │   Tap to start your order   │    │
│  │                             │    │
│  │   [Start Order]             │    │
│  └─────────────────────────────┘    │
│                                     │
├─────────────────────────────────────┤
│  Customization                      │
│                                     │
│  Welcome title                      │
│  [Welcome to Queen Waffle      ]    │
│                                     │
│  Welcome subtitle                   │
│  [Tap to start your order      ]    │
│                                     │
│  Background color                   │
│  [#1C1C1E] [■]                      │
│                                     │
│  Accent color                       │
│  [#0A84FF] [■]                      │
│                                     │
│  Menu layout                        │
│  ○ Grid  ● List  ○ Carousel         │
│                                     │
│  [Save]                             │
└─────────────────────────────────────┘
```

---

### 16. Release Manager Dashboard

Sürüm yönetimi:
```
┌─────────────────────────────────────┐
│  Release Manager                    │
│                                     │
│  Update policy                      │
│  ○ Automatic                        │
│  ● Scheduled                        │
│  ○ Manual                           │
│                                     │
│  Update window                      │
│  From: [02:00] To: [05:00]          │
│                                     │
│  Exclude days                       │
│  [ ] Mon [✓] Fri [✓] Sat [ ] Sun    │
│                                     │
├─────────────────────────────────────┤
│  Available Updates                  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  v2.5.0 (New)               │    │
│  │  Released: Jan 15, 2026     │    │
│  │                             │    │
│  │  • New kiosk features       │    │
│  │  • Bug fixes                │    │
│  │  • Performance improvements │    │
│  │                             │    │
│  │  [View details] [Install]   │    │
│  └─────────────────────────────┘    │
│                                     │
│  Current version: v2.4.1            │
│  [Rollback to v2.4.0]               │
│                                     │
└─────────────────────────────────────┘
```

---

## 📐 Tasarım Sistemi

### Renkler (Dark Mode - Apple Tahoe)

```css
/* Arka Plan */
--bg-primary: #0A0A0A;
--bg-surface-1: #1C1C1E;
--bg-surface-2: #2C2C2E;
--bg-surface-3: #3A3A3C;

/* Glass */
--glass-bg: rgba(255,255,255,0.08);
--glass-border: rgba(255,255,255,0.1);

/* Metin */
--text-primary: #FFFFFF;
--text-secondary: rgba(255,255,255,0.7);
--text-tertiary: rgba(255,255,255,0.4);

/* Accent */
--accent-blue: #0A84FF;
--accent-green: #30D158;
--accent-orange: #FF9F0A;
--accent-red: #FF453A;
```

### Tipografi

```css
/* Font */
font-family: 'SF Pro', 'DM Sans', sans-serif;

/* Sizes */
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;
```

### Spacing

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
```

### Border Radius

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-full: 9999px;
```

---

## 📋 Figma Deliverables

### Mobil App
- [ ] Onboarding flow
- [ ] Checkout screens
- [ ] Orders screens
- [ ] Reports screens
- [ ] Items screens
- [ ] Settings screens
- [ ] Modals & bottom sheets
- [ ] Empty states
- [ ] Loading states
- [ ] Error states

### Web Dashboard
- [ ] Home dashboard
- [ ] Items & services
- [ ] Settings pages
- [ ] Device management
  - [ ] Devices list
  - [ ] Device codes / pairing
  - [ ] Modes list & editor
  - [ ] Printer profiles
  - [ ] Kitchen displays / stations
  - [ ] Kiosk customizer
  - [ ] App integrations
  - [ ] Release manager
- [ ] Reports
- [ ] Tables & lists
- [ ] Forms
- [ ] Modals

### Component Library
- [ ] Buttons
- [ ] Inputs
- [ ] Cards
- [ ] Tables
- [ ] Navigation
- [ ] Modals
- [ ] Toasts
- [ ] Icons
- [ ] Status indicators (online/offline)
- [ ] QR code display
- [ ] Progress bars
- [ ] Color pickers

---

**Son Güncelleme:** 17 Ocak 2026
