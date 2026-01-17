# MEGA POS MVP - Uygulama Planı

## Genel Bakış

Bu plan, MEGA POS MVP sisteminin adım adım implementasyonunu tanımlar. Monorepo yapısında NestJS backend ve React frontend'ler geliştirilecek.

---

## Görevler

- [x] 1. Proje Altyapısı Kurulumu
  - [x] 1.1 Monorepo yapısını oluştur (Turborepo + pnpm)
    - Turborepo config, workspace yapısı
    - _Requirements: Tüm sistem_
  - [x] 1.2 Backend API projesini oluştur (NestJS)
    - NestJS boilerplate, TypeORM config
    - _Requirements: Tüm API_
  - [x] 1.3 Veritabanı bağlantısı ve migration'ları kur
    - PostgreSQL bağlantısı, tablo migration'ları
    - _Requirements: Veri Modelleri_
  - [x] 1.4 Shared types paketini oluştur
    - Ortak TypeScript tipleri
    - _Requirements: Tüm sistem_

- [x] 2. Kategori ve Ürün Modülü (Backend)
  - [x] 2.1 Category CRUD API'lerini implement et
    - GET/POST/PUT/DELETE /api/categories
    - _Requirements: 6.7_
  - [x] 2.2 Product CRUD API'lerini implement et
    - GET/POST/PUT/DELETE /api/products
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.6_
  - [x] 2.3 Ürün görseli yükleme endpoint'i
    - POST /api/products/:id/image
    - _Requirements: 6.4_
  - [x] 2.4 Property test: Ürün fiyat güncellemesi mevcut siparişleri etkilememeli
    - **Property 6: Ürün Fiyat Yansıması**
    - **Validates: Requirements 6.5, 6.8**

- [x] 3. Masa Modülü (Backend)
  - [x] 3.1 Table CRUD API'lerini implement et
    - GET/POST/PUT/DELETE /api/tables
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  - [x] 3.2 Masa durumu güncelleme mantığı
    - Status: empty, occupied, paying
    - _Requirements: 1.6, 2.6, 2.8_
  - [x] 3.3 Property test: Masa durumu tutarlılığı
    - **Property 2: Masa Durumu Tutarlılığı**
    - **Validates: Requirements 1.1, 1.6**

- [x] 4. Sipariş Modülü (Backend)
  - [x] 4.1 Order CRUD API'lerini implement et
    - GET/POST/PUT /api/orders
    - _Requirements: 1.2, 1.3, 1.5_
  - [x] 4.2 OrderItem ekleme/çıkarma API'leri
    - POST/DELETE /api/orders/:id/items
    - _Requirements: 2.1, 2.2_
  - [x] 4.3 Sipariş tutarı hesaplama mantığı
    - Otomatik toplam hesaplama
    - _Requirements: 1.5_
  - [x] 4.4 Property test: Sipariş tutarı tutarlılığı
    - **Property 1: Sipariş Tutarı Tutarlılığı**
    - **Validates: Requirements 1.5, 2.1**
  - [x] 4.5 Sipariş bölme (split) API'si
    - POST /api/orders/:id/split
    - _Requirements: 2.3, 2.4_
  - [x] 4.6 Property test: Sipariş bölme tutarlılığı
    - **Property 3: Sipariş Bölme Tutarlılığı**
    - **Validates: Requirements 2.3, 2.4**
  - [x] 4.7 Masa aktarma API'si
    - POST /api/orders/:id/transfer
    - _Requirements: 2.5, 2.6_
  - [x] 4.8 Masa birleştirme API'si
    - POST /api/orders/merge
    - _Requirements: 2.7, 2.8_
  - [x] 4.9 Property test: Masa birleştirme tutarlılığı
    - **Property 4: Masa Birleştirme Tutarlılığı**
    - **Validates: Requirements 2.7, 2.8**
  - [x] 4.10 Sipariş iptal API'si
    - POST /api/orders/:id/cancel
    - _Requirements: 2.9_

- [x] 5. Checkpoint - Backend Core
  - Tüm testlerin geçtiğinden emin ol, sorular varsa kullanıcıya sor.

- [x] 6. Mutfak Modülü (Backend)
  - [x] 6.1 Mutfak siparişleri API'si
    - GET /api/kitchen/orders
    - _Requirements: 4.1_
  - [x] 6.2 Sipariş hazır işaretleme API'si
    - POST /api/kitchen/orders/:id/ready
    - _Requirements: 4.7_
  - [x] 6.3 Mutfağa gönderme API'si
    - POST /api/orders/:id/send-to-kitchen
    - _Requirements: 1.5, 3.5_
  - [x] 6.4 Property test: Mutfak sipariş sırası (FIFO)
    - **Property 5: Mutfak Sipariş Sırası**
    - **Validates: Requirements 4.1, 4.2**

- [x] 7. Ödeme Modülü (Backend)
  - [x] 7.1 Payment API'si
    - POST /api/payments
    - _Requirements: 1.6_
  - [x] 7.2 Ödeme sonrası masa kapatma mantığı
    - Masa durumu "empty" yapma
    - _Requirements: 1.6_

- [x] 8. Yazıcı Modülü (Backend)
  - [x] 8.1 Printer CRUD API'leri
    - GET/POST/PUT/DELETE /api/printers
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [x] 8.2 Yazıcı servisi (ESC/POS)
    - TCP/IP bağlantı, print job gönderme
    - _Requirements: 8.4_
  - [x] 8.3 Sipariş kağıdı format oluşturma
    - Masa no, saat, ürünler, notlar
    - _Requirements: 4.3, 4.4, 4.5, 4.6_
  - [x] 8.4 Property test: Sipariş kağıdı içeriği
    - **Property 7: Yazıcı Sipariş Kağıdı İçeriği**
    - **Validates: Requirements 4.3, 4.4, 4.5, 4.6**
  - [x] 8.5 Test yazdırma API'si
    - POST /api/printers/:id/test
    - _Requirements: 8.5, 8.6_

- [x] 9. Rapor Modülü (Backend)
  - [x] 9.1 Günlük rapor API'si
    - GET /api/reports/daily
    - _Requirements: 7.1, 7.2_
  - [x] 9.2 Ürün satış raporu API'si
    - GET /api/reports/products
    - _Requirements: 7.3_
  - [x] 9.3 Tarih filtreleme
    - Query params ile tarih aralığı
    - _Requirements: 7.4_

- [x] 10. WebSocket Modülü (Backend)
  - [x] 10.1 Socket.io gateway kurulumu
    - Room yapısı (pos, kitchen, waiter)
    - _Requirements: Gerçek zamanlı iletişim_
  - [x] 10.2 Sipariş event'leri
    - order:new, order:updated, order:ready
    - _Requirements: 3.6, 4.1, 4.7_
  - [x] 10.3 Garson çağırma event'i
    - waiter:called
    - _Requirements: 5.6_

- [x] 11. Checkpoint - Backend Tamamlandı
  - Tüm API'ler çalışıyor, testler geçiyor.

- [x] 12. Boss Ekranı (Frontend)
  - [x] 12.1 React projesi oluştur (Vite + TypeScript)
    - Temel yapı, routing, API client
    - _Requirements: Boss Ekranı_
  - [x] 12.2 Sidebar ve layout
    - Navigation, responsive tasarım
    - _Requirements: Boss Ekranı_
  - [x] 12.3 Ürün yönetimi sayfası
    - Liste, ekleme, düzenleme, silme
    - _Requirements: 6.1-6.8_
  - [x] 12.4 Kategori yönetimi sayfası
    - Liste, ekleme, düzenleme, silme
    - _Requirements: 6.7_
  - [x] 12.5 Masa yönetimi sayfası
    - Liste, ekleme, düzenleme, silme
    - _Requirements: 9.1-9.5_
  - [x] 12.6 Yazıcı ayarları sayfası
    - Liste, ekleme, test yazdırma
    - _Requirements: 8.1-8.6_
  - [x] 12.7 Rapor sayfası
    - Günlük satış, ürün satışları
    - _Requirements: 7.1-7.5_

- [x] 13. Satış Ekranı (Frontend)
  - [x] 13.1 React projesi oluştur
    - Temel yapı, WebSocket bağlantısı
    - _Requirements: Satış Ekranı_
  - [x] 13.2 Masa listesi ekranı
    - Grid görünüm, renk kodları
    - _Requirements: 1.1_
  - [x] 13.3 Sipariş ekranı
    - Kategori tabs, ürün grid, sepet
    - _Requirements: 1.2, 1.3, 1.4_
  - [x] 13.4 Sipariş düzenleme modal'ları
    - Bölme, aktarma, birleştirme
    - _Requirements: 2.1-2.10_
  - [x] 13.5 Ödeme ekranı
    - Nakit/kart seçimi, ödeme al
    - _Requirements: 1.6_
  - [x] 13.6 Garson çağrısı bildirimi
    - Toast notification
    - _Requirements: 5.6_

- [x] 14. Garson Tablet (Frontend)
  - [x] 14.1 React projesi oluştur (PWA)
    - Mobil optimize, touch friendly
    - _Requirements: Garson Tablet_
  - [x] 14.2 Masa listesi ekranı
    - Touch grid
    - _Requirements: 3.1_
  - [x] 14.3 Sipariş alma ekranı
    - Kategori, ürün, sepet, not
    - _Requirements: 3.2, 3.3, 3.4_
  - [x] 14.4 Sipariş gönderme
    - Mutfağa gönder butonu
    - _Requirements: 3.5, 3.6, 3.7_

- [x] 15. Mutfak Ekranı (Frontend)
  - [x] 15.1 React projesi oluştur
    - Full screen, auto-refresh
    - _Requirements: Mutfak Ekranı_
  - [x] 15.2 Sipariş kartları
    - Masa no, saat, ürünler, notlar
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.6_
  - [x] 15.3 Renk kodları ve zamanlayıcı
    - Bekleme süresine göre renk
    - _Requirements: 4.9_
  - [x] 15.4 Hazır butonu
    - Sipariş tamamlama
    - _Requirements: 4.7_
  - [x] 15.5 Sesli bildirim
    - Yeni sipariş sesi
    - _Requirements: 4.8_

- [x] 16. QR Menü (Frontend)
  - [x] 16.1 React projesi oluştur
    - Mobil optimize, hızlı yükleme
    - _Requirements: QR Menü_
  - [x] 16.2 Menü listesi
    - Kategoriler, ürünler, fiyatlar, görseller
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 16.3 Garson çağırma butonu
    - WebSocket ile bildirim
    - _Requirements: 5.5, 5.6_

- [x] 17. Checkpoint - Frontend Tamamlandı
  - Tüm ekranlar çalışıyor, WebSocket bağlantıları aktif.

- [x] 18. Entegrasyon ve Test
  - [x] 18.1 End-to-end test senaryosu
    - Tam sipariş akışı testi
    - _Requirements: Test Senaryosu_
  - [x] 18.2 Yazıcı entegrasyon testi
    - Gerçek yazıcı ile test
    - _Requirements: 4.2, 8.5_
  - [x] 18.3 Multi-device test
    - PC + Tablet + Telefon aynı anda
    - _Requirements: Tüm sistem_

- [x] 19. Final Checkpoint
  - Tüm testler geçiyor, sistem kullanıma hazır.

---

## Notlar

- Tüm property testler zorunlu olarak dahil edildi
- Her checkpoint'te kullanıcıya durum raporu verilecek
- Yazıcı testleri için gerçek donanım gerekli

---

*Son Güncelleme: 13 Ocak 2026*
