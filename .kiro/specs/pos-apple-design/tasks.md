# Implementation Plan: PIXPOS - Kapsamlı POS Sistemi

## Overview

Bu plan, PIXPOS'un tüm ekranlarını Apple kalitesinde, sıfırdan inşa edecek. Her task öncekinin üzerine kurulur.

---

## Phase 1: Foundation (Temel)

- [x] 1. Design System & CSS Foundation
  - [x] 1.1 Global CSS değişkenleri oluştur
    - Renk paleti (Figma'dan: Primary #A27B5C, Secondary #3F4E4F, Semantic colors)
    - Tipografi scale (DM Sans font)
    - Spacing & radius
    - Shadow değerleri
    - Animation timing
    - _Requirements: 8.1-8.4_

  - [x] 1.2 Tailwind config güncelle
    - Tailwind v4 CSS-first approach kullanıldı
    - Custom colors CSS variables olarak tanımlandı
    - Custom animations CSS'de tanımlandı
    - _Requirements: 8.1_

  - [x] 1.3 Base component stilleri
    - Button variants (primary, secondary, outline, ghost, danger, success)
    - Input styles
    - Card styles
    - Table card styles
    - Kitchen card styles
    - _Requirements: 8.1_

- [x] 2. Shared Components
  - [x] 2.1 Button component
    - Variants: primary, secondary, outline, ghost, danger, success
    - Sizes: sm, md, lg
    - Press animation (scale 0.98)
    - Loading state
    - Left/Right icon support
    - _Requirements: 8.5_

  - [x] 2.2 Card component
    - Base card
    - Interactive card (hover effects)
    - Header/Footer support
    - Variants: default, elevated, bordered, interactive
    - _Requirements: 8.5_

  - [x] 2.3 Modal component
    - Backdrop blur
    - Slide-up animation
    - Close button
    - Size variants: sm, md, lg, xl, full
    - Accessibility (aria-modal, aria-labelledby)
    - _Requirements: 1.4, 9.1_

  - [x] 2.4 Numpad component
    - 72x72px buttons
    - 0-9, backspace, confirm
    - Press feedback (scale 0.95)
    - Decimal/00 options
    - _Requirements: 1.1.5_

  - [x] 2.5 Additional Components
    - TableCard (empty, occupied, kitchen, ready states)
    - Chip (primary, success, warning, error, info, neutral)
    - Alert (success, warning, error, info)
    - PinInput (with shake animation on error)
    - Input (with left/right icon support)
    - Select (with placeholder support)

---

## Phase 2: POS Kasa Ekranı

- [x] 3. Lock Screen (Kilit Ekranı)
  - [x] 3.1 LockScreen page component
    - Logo + işletme adı
    - Canlı saat + tarih
    - Kullanıcı listesi (avatar + isim)
    - Hızlı erişim butonları
    - _Requirements: 1.1.1-1.1.9_

  - [x] 3.2 Quick access buttons
    - Hızlı Satış (aktif)
    - Raporlar (aktif)
    - Ayarlar (aktif)
    - Cariler ("Yakında - v2.0")
    - Paket Servis ("Yakında - v2.1")
    - _Requirements: 1.1.3_

  - [x] 3.3 PIN entry modal
    - Kullanıcı avatar + isim
    - PIN dots (4-6 hane)
    - Numpad
    - Shake animation (hata)
    - Success transition
    - _Requirements: 1.1.5-1.1.7_

  - [x] 3.4 Auto-lock timer
    - Configurable timeout (5/10/15/30 dk)
    - Activity detection
    - Smooth lock transition
    - _Requirements: 1.1.1_

- [x] 4. Main Layout (Ana Ekran)
  - [x] 4.1 Layout shell
    - Header (56px)
    - Left sidebar (68px)
    - Main content (flex)
    - Right sidebar (280px)
    - Footer (44px)
    - _Requirements: 1.2.1_

  - [x] 4.2 Header component
    - Logo + store name
    - Live clock (HH:MM)
    - Status indicators (net, server, pavo, printer)
    - User menu
    - _Requirements: 1.5.1-1.5.5_

  - [x] 4.3 Footer component
    - Version number
    - Sync status
    - Live support button
    - Offline warning band
    - _Requirements: 1.5.6-1.5.10_

  - [x] 4.4 Left sidebar
    - Area filters (Tümü, Salon, Teras, Bahçe, Bar)
    - Quick actions (Hızlı Satış, Ayarlar)
    - Icon-only design (44x44px)
    - Active state styling
    - _Requirements: 1.2.7_

  - [x] 4.5 Right sidebar
    - Summary stats (açık masa, ciro)
    - Active orders list
    - Click to navigate
    - _Requirements: 1.2.6_

- [x] 5. Table Grid (Masa Planı)
  - [x] 5.1 TableCard component
    - Status colors (empty, occupied, kitchen, ready)
    - Table number (large)
    - Dwell time display
    - Amount display
    - Hover/press animations
    - Ready pulse animation
    - _Requirements: 1.2.2-1.2.5_

  - [x] 5.2 TableGrid container
    - Responsive grid (4-6 columns)
    - Area filtering
    - Empty state message
    - _Requirements: 1.2.1_

  - [x] 5.3 useDwellTime hook
    - Real-time calculation
    - Format: "23dk" or "1s 15dk"
    - Update every minute
    - _Requirements: 1.2.4_

- [x] 6. Checkpoint - Ana Ekran Tamamlandı
  - Lock screen çalışıyor
  - PIN girişi çalışıyor
  - Masa planı görünüyor
  - Real-time güncellemeler aktif


- [x] 7. Order Detail Screen (Sipariş Detay)
  - [x] 7.1 OrderScreen layout
    - 2 column: Products | Cart
    - Header with back button + table info
    - Dwell time display
    - _Requirements: 1.3.1-1.3.2_

  - [x] 7.2 Category tabs
    - Horizontal scrollable
    - Active tab styling
    - Smooth scroll
    - _Requirements: 1.3.2_

  - [x] 7.3 Product grid
    - ProductCard component
    - Image + name + price
    - Click to add
    - Touch-friendly (min 80x80px)
    - _Requirements: 1.3.2_

  - [x] 7.4 Cart panel
    - Order items list
    - Quantity controls (+/-)
    - Item notes
    - Subtotal, tax, total
    - _Requirements: 1.3.2_

  - [x] 7.5 Action buttons
    - Mutfağa Gönder (primary)
    - İşlemler (secondary)
    - Ödeme Al (success)
    - _Requirements: 1.3.4_

- [x] 8. Order Operations (Sipariş İşlemleri)
  - [x] 8.1 Operations menu modal
    - Yeni ürün ekle
    - Adet değiştir
    - Ürün sil
    - İndirim uygula
    - Sipariş böl
    - Sipariş birleştir
    - Not ekle
    - _Requirements: 1.3.3_

  - [x] 8.2 Split order modal
    - Item selection checkboxes
    - Split preview
    - Confirm button
    - _Requirements: 1.3.3_

  - [x] 8.3 Discount modal
    - Percentage / Amount toggle
    - Numpad input
    - Preset buttons (10%, 20%, 50%)
    - _Requirements: 1.3.3_

  - [x] 8.4 Merge orders modal
    - Select orders to merge
    - Preview merged order
    - Confirm
    - _Requirements: 1.3.3_

- [x] 9. Payment Screen (Ödeme Ekranı)
  - [x] 9.1 PaymentScreen layout
    - Large total display
    - Order summary
    - Quick actions (Böl, İndirim, İkram, Taşı)
    - _Requirements: 1.4.1-1.4.2_

  - [x] 9.2 Payment method buttons
    - Nakit (→ PAVO)
    - Kart (→ PAVO)
    - Online (vergisiz)
    - Çoklu ödeme
    - _Requirements: 1.4.3_

  - [x] 9.3 Cash payment flow
    - Numpad for amount received
    - Change calculation
    - Confirm button
    - _Requirements: 1.4.4-1.4.5_

  - [x] 9.4 Success animation
    - Checkmark animation
    - Auto-print option
    - Return to main
    - _Requirements: 1.4.6_

  - [x] 9.5 Receipt options
    - Fiş Yazdır button
    - E-Fatura button
    - _Requirements: 1.4.7_

- [x] 10. Checkpoint - POS Kasa Tamamlandı
  - Tüm POS ekranları çalışıyor
  - Sipariş akışı tam
  - Ödeme akışı tam
  - Yazıcı entegrasyonu hazır

---

## Phase 3: Garson Tableti

- [x] 11. Waiter Login
  - [x] 11.1 Login screen
    - Waiter list (name + avatar)
    - PIN entry modal
    - Tablet-optimized layout
    - _Requirements: 2.1.1-2.1.4_

- [x] 12. Waiter Table List
  - [x] 12.1 Table grid
    - All tables with status colors
    - Area filter tabs
    - Touch-optimized cards
    - _Requirements: 2.2.1-2.2.4_

- [x] 13. Waiter Order Screen
  - [x] 13.1 Order taking interface
    - Category tabs
    - Product grid
    - Cart panel
    - Customer notes
    - _Requirements: 2.3.1-2.3.4_

  - [x] 13.2 Send to kitchen
    - Confirm modal
    - Success feedback
    - Auto-sync to POS + Kitchen
    - _Requirements: 2.3.5_

  - [x] 13.3 Order countdown (optional)
    - Timer after sending
    - Late warning
    - _Requirements: 2.3.6-2.3.7_

- [x] 14. Checkpoint - Garson Tableti Tamamlandı

---

## Phase 4: Mutfak Ekranı (KDS)

- [x] 15. Kitchen Display
  - [x] 15.1 Order tickets grid
    - Ticket card component
    - Large, readable text
    - Status colors (time-based)
    - _Requirements: 3.1.1-3.1.5_

  - [x] 15.2 Order detail modal
    - Full order info
    - Notes highlighted
    - _Requirements: 3.1.5_

  - [x] 15.3 Status buttons
    - Başla / Hazırlanıyor
    - Hazır
    - Large touch targets
    - _Requirements: 3.2.1-3.2.3_

  - [x] 15.4 Sound notifications
    - New order sound
    - Configurable volume
    - _Requirements: 3.1.6_

  - [x] 15.5 Performance metrics
    - Pending count
    - Preparing count
    - Ready count
    - Average time
    - _Requirements: 3.1.4_

- [x] 16. Checkpoint - Mutfak Ekranı Tamamlandı

---

## Phase 5: Boss Panel (Yönetim)

- [x] 17. Admin Dashboard
  - [x] 17.1 Dashboard layout
    - Sidebar navigation
    - Main content area
    - _Requirements: 4.1.1_

  - [x] 17.2 Metric cards
    - Today's revenue
    - Order count
    - Average ticket
    - Open tables
    - _Requirements: 4.1.1_

  - [x] 17.3 Charts
    - Hourly sales chart
    - Top products
    - Recent orders
    - _Requirements: 4.1.2-4.1.3_

- [x] 18. Product Management
  - [x] 18.1 Product list
    - Table view
    - Search + filter
    - CRUD operations
    - _Requirements: 4.2.1-4.2.4_

  - [x] 18.2 Product form
    - Name, description, price
    - Category selection
    - Image upload
    - Barcode (optional)
    - Tax rate
    - Active/Inactive
    - _Requirements: 4.2.2_

  - [x] 18.3 Category management
    - Category list
    - CRUD operations
    - Drag-drop ordering
    - _Requirements: 4.2.3_

- [x] 19. Reports
  - [x] 19.1 Report filters
    - Date range picker
    - Time range
    - Product filter
    - Category filter
    - Waiter filter
    - Payment method filter
    - _Requirements: 4.3.1_

  - [x] 19.2 Report metrics
    - Total revenue
    - Order count
    - Average ticket
    - Top products
    - Hourly breakdown
    - Daily breakdown
    - _Requirements: 4.3.2_

  - [x] 19.3 Export
    - Excel export
    - PDF export
    - _Requirements: 4.3.3_

- [x] 20. Settings
  - [x] 20.1 Business settings
    - Store name, address, phone
    - Logo upload
    - _Requirements: 4.4.1_

  - [x] 20.2 User management
    - User list
    - Add/edit/delete users
    - Role assignment
    - _Requirements: 4.4.1_

  - [x] 20.3 Area/Floor management
    - Area list
    - Add/edit/delete areas
    - _Requirements: 4.4.1_

  - [x] 20.4 Table management
    - Table list
    - Add/edit/delete tables
    - Assign to areas
    - _Requirements: 4.4.1_

  - [x] 20.5 Printer settings
    - Add printer (IP address)
    - Test print
    - Template preview
    - Auto-print toggle
    - _Requirements: 4.4.2_

  - [x] 20.6 Lock screen settings
    - Timeout duration
    - PIN length
    - Auto-lock toggle
    - _Requirements: 1.1 Ayarlar_

- [x] 21. Checkpoint - Boss Panel Tamamlandı

---

## Phase 6: QR Menü

- [x] 22. QR Menu
  - [x] 22.1 Menu page
    - Store branding
    - Category list
    - Product cards
    - Mobile-optimized
    - _Requirements: 5.1.1-5.1.5_

  - [x] 22.2 Product detail
    - Large image
    - Description
    - Price
    - Allergens (future)
    - _Requirements: 5.1.3_

- [x] 23. Checkpoint - QR Menü Tamamlandı

---

## Phase 7: Printer Integration

- [x] 24. Printer System
  - [x] 24.1 ESC/POS service
    - Network printer connection
    - Print queue
    - Error handling
    - _Requirements: 6.1.1-6.1.4_

  - [x] 24.2 Receipt templates
    - Customer receipt (80mm)
    - Kitchen ticket (80mm)
    - _Requirements: 6.2_

  - [x] 24.3 Auto-print triggers
    - On order send (kitchen)
    - On payment complete (customer)
    - Configurable
    - _Requirements: 6.1.3_

- [x] 25. Final Checkpoint
  - Tüm ekranlar tamamlandı
  - Real-time sync çalışıyor
  - Yazıcı entegrasyonu çalışıyor
  - Tüm animasyonlar smooth
  - Touch targets doğru boyutta
  - Renkler tutarlı

---

## Notes

- Her component Apple HIG standartlarına uygun
- Animasyonlar 60fps hedefler
- Touch target minimum 44x44px
- Tüm renkler WCAG AA uyumlu
- Offline mode desteği düşünülecek
- "Yakında" özellikler badge ile gösterilecek
