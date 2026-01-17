# MEGA POS MVP - Tasarım Dokümanı

---

## Genel Bakış

Bu doküman, MEGA POS MVP sisteminin teknik tasarımını tanımlar. Sistem 4 ana bileşenden oluşur:
- **Satış Ekranı** (PC - Web)
- **Garson Tableti** (Tablet - Web/PWA)
- **Mutfak Ekranı** (Tablet/PC - Web)
- **Boss Ekranı** (PC/Tablet - Web)
- **QR Menü** (Mobil - Web)

Tüm bileşenler tek bir backend API'ye bağlanır ve gerçek zamanlı iletişim için WebSocket kullanır.

---

## Mimari

### Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────────┐
│                         MEGA POS MVP                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Satış   │  │  Garson  │  │  Mutfak  │  │   Boss   │        │
│  │  Ekranı  │  │  Tablet  │  │  Ekranı  │  │  Ekranı  │        │
│  │   (PC)   │  │ (Tablet) │  │(Tablet)  │  │(PC/Tab)  │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │               │
│       └─────────────┴──────┬──────┴─────────────┘               │
│                            │                                     │
│                    ┌───────▼───────┐                            │
│                    │   WebSocket   │                            │
│                    │    Server     │                            │
│                    └───────┬───────┘                            │
│                            │                                     │
│                    ┌───────▼───────┐                            │
│                    │   REST API    │                            │
│                    │   (NestJS)    │                            │
│                    └───────┬───────┘                            │
│                            │                                     │
│              ┌─────────────┼─────────────┐                      │
│              │             │             │                      │
│       ┌──────▼──────┐ ┌────▼────┐ ┌─────▼─────┐                │
│       │ PostgreSQL  │ │  Redis  │ │  Yazıcı   │                │
│       │  Database   │ │ (Cache) │ │  Service  │                │
│       └─────────────┘ └─────────┘ └───────────┘                │
│                                                                  │
│  ┌──────────┐                                                   │
│  │ QR Menü  │ ◄─── Statik Web (CDN)                            │
│  │ (Mobil)  │                                                   │
│  └──────────┘                                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Teknoloji Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Socket.io-client (WebSocket)
- React Query (data fetching)

**Backend:**
- Node.js 20 LTS
- NestJS (framework)
- Socket.io (WebSocket)
- TypeORM (ORM)
- PostgreSQL 16 (database)
- Redis (cache + pub/sub)

**Yazıcı:**
- ESC/POS protokolü
- node-thermal-printer kütüphanesi
- TCP/IP veya USB bağlantı

---

## Bileşenler ve Arayüzler

### 1. Satış Ekranı (POS)

**Ekranlar:**
- Masa Listesi Ekranı
- Sipariş Ekranı
- Ödeme Ekranı
- Sipariş Düzenleme Modal

**Bileşenler:**
```typescript
// Masa Listesi
<TableGrid>
  <TableCard status="empty|occupied|paying" />
</TableGrid>

// Sipariş Ekranı
<OrderScreen>
  <CategoryTabs />
  <ProductGrid />
  <OrderSummary />
  <ActionButtons /> // Kaydet, Ödeme, İptal
</OrderScreen>

// Sipariş Düzenleme
<OrderActions>
  <SplitOrderModal />
  <TransferTableModal />
  <MergeTablesModal />
</OrderActions>
```

### 2. Garson Tableti

**Ekranlar:**
- Masa Listesi (Grid)
- Sipariş Alma Ekranı

**Bileşenler:**
```typescript
<WaiterApp>
  <TableGrid />
  <OrderScreen>
    <CategoryList />
    <ProductList />
    <Cart />
    <NoteInput />
    <SendButton />
  </OrderScreen>
</WaiterApp>
```

### 3. Mutfak Ekranı (KDS)

**Ekranlar:**
- Sipariş Listesi (Kanban tarzı)

**Bileşenler:**
```typescript
<KitchenDisplay>
  <OrderCard>
    <TableNumber />
    <OrderTime />
    <ItemList />
    <Notes />
    <ReadyButton />
  </OrderCard>
</KitchenDisplay>
```

### 4. Boss Ekranı (Yönetim)

**Ekranlar:**
- Dashboard
- Ürün Yönetimi
- Kategori Yönetimi
- Masa Yönetimi
- Yazıcı Ayarları
- Raporlar

**Bileşenler:**
```typescript
<BossPanel>
  <Sidebar>
    <NavItem to="/products" />
    <NavItem to="/categories" />
    <NavItem to="/tables" />
    <NavItem to="/printers" />
    <NavItem to="/reports" />
  </Sidebar>
  <MainContent>
    <ProductsPage />
    <CategoriesPage />
    <TablesPage />
    <PrintersPage />
    <ReportsPage />
  </MainContent>
</BossPanel>
```

### 5. QR Menü

**Ekranlar:**
- Menü Listesi
- Ürün Detay

**Bileşenler:**
```typescript
<QRMenu>
  <Header logo={businessLogo} />
  <CategoryTabs />
  <ProductList>
    <ProductCard image, name, price />
  </ProductList>
  <CallWaiterButton />
</QRMenu>
```

---

## Veri Modelleri

### Veritabanı Şeması

```sql
-- Kategoriler
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ürünler
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id),
  name VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Masalar
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  capacity INT DEFAULT 4,
  status VARCHAR(20) DEFAULT 'empty', -- empty, occupied, paying
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Siparişler
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES tables(id),
  order_number VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'open', -- open, kitchen, ready, paid, cancelled
  total_amount DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP
);

-- Sipariş Kalemleri
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(200) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, preparing, ready, served
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ödemeler
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL, -- cash, card
  created_at TIMESTAMP DEFAULT NOW()
);

-- Yazıcılar
CREATE TABLE printers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- kitchen, receipt
  connection_type VARCHAR(20) NOT NULL, -- tcp, usb
  ip_address VARCHAR(50),
  port INT DEFAULT 9100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- İşletme Ayarları
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### TypeScript Tipleri

```typescript
// Entities
interface Category {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  isActive: boolean;
}

interface Table {
  id: string;
  name: string;
  capacity: number;
  status: 'empty' | 'occupied' | 'paying';
  currentOrderId?: string;
}

interface Order {
  id: string;
  tableId: string;
  orderNumber: string;
  status: 'open' | 'kitchen' | 'ready' | 'paid' | 'cancelled';
  totalAmount: number;
  notes?: string;
  items: OrderItem[];
  createdAt: Date;
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: 'cash' | 'card';
}

interface Printer {
  id: string;
  name: string;
  type: 'kitchen' | 'receipt';
  connectionType: 'tcp' | 'usb';
  ipAddress?: string;
  port?: number;
  isActive: boolean;
}
```

---

## API Endpoints

### Kategoriler
```
GET    /api/categories          - Kategori listesi
POST   /api/categories          - Kategori ekle
PUT    /api/categories/:id      - Kategori güncelle
DELETE /api/categories/:id      - Kategori sil
```

### Ürünler
```
GET    /api/products            - Ürün listesi
GET    /api/products/:id        - Ürün detay
POST   /api/products            - Ürün ekle
PUT    /api/products/:id        - Ürün güncelle
DELETE /api/products/:id        - Ürün sil
POST   /api/products/:id/image  - Ürün görseli yükle
```

### Masalar
```
GET    /api/tables              - Masa listesi
POST   /api/tables              - Masa ekle
PUT    /api/tables/:id          - Masa güncelle
DELETE /api/tables/:id          - Masa sil
```

### Siparişler
```
GET    /api/orders              - Sipariş listesi
GET    /api/orders/:id          - Sipariş detay
POST   /api/orders              - Sipariş oluştur
PUT    /api/orders/:id          - Sipariş güncelle
POST   /api/orders/:id/items    - Sipariş kalemi ekle
DELETE /api/orders/:id/items/:itemId - Sipariş kalemi sil
POST   /api/orders/:id/send-to-kitchen - Mutfağa gönder
POST   /api/orders/:id/split    - Sipariş böl
POST   /api/orders/:id/transfer - Masa aktar
POST   /api/orders/merge        - Masaları birleştir
POST   /api/orders/:id/cancel   - Sipariş iptal
```

### Ödemeler
```
POST   /api/payments            - Ödeme al
GET    /api/payments/:orderId   - Sipariş ödemeleri
```

### Mutfak
```
GET    /api/kitchen/orders      - Mutfak siparişleri
POST   /api/kitchen/orders/:id/ready - Hazır işaretle
```

### Yazıcılar
```
GET    /api/printers            - Yazıcı listesi
POST   /api/printers            - Yazıcı ekle
PUT    /api/printers/:id        - Yazıcı güncelle
DELETE /api/printers/:id        - Yazıcı sil
POST   /api/printers/:id/test   - Test yazdır
```

### Raporlar
```
GET    /api/reports/daily       - Günlük rapor
GET    /api/reports/sales       - Satış raporu
GET    /api/reports/products    - Ürün satış raporu
```

### QR Menü
```
GET    /api/menu/:tableId       - Masa menüsü (public)
POST   /api/menu/:tableId/call-waiter - Garson çağır
```

---

## WebSocket Events

### Server → Client
```typescript
// Yeni sipariş geldi (mutfak)
'order:new' → { order: Order }

// Sipariş güncellendi
'order:updated' → { order: Order }

// Sipariş hazır
'order:ready' → { orderId: string, tableId: string }

// Masa durumu değişti
'table:updated' → { table: Table }

// Garson çağrıldı
'waiter:called' → { tableId: string, tableName: string }
```

### Client → Server
```typescript
// Odaya katıl (pos, kitchen, waiter)
'join:room' → { room: 'pos' | 'kitchen' | 'waiter' }

// Sipariş hazır işaretle
'order:mark-ready' → { orderId: string }
```

---


## Yazıcı Entegrasyonu

### Sipariş Kağıdı Formatı (Mutfak)

```
================================
        MUTFAK SİPARİŞİ
================================
Masa: [MASA ADI]
Saat: [SAAT:DAKİKA]
Sipariş No: [ORDER_NUMBER]
--------------------------------
[ADET]x [ÜRÜN ADI]
   Not: [ÜRÜN NOTU]
[ADET]x [ÜRÜN ADI]
--------------------------------
Genel Not: [SİPARİŞ NOTU]
================================
```

### Fiş Formatı (Ödeme)

```
================================
      [İŞLETME ADI]
   [ADRES SATIRI 1]
   [ADRES SATIRI 2]
   Tel: [TELEFON]
================================
Tarih: [GG/AA/YYYY]  [SS:DD]
Masa: [MASA ADI]
Fiş No: [FİŞ NO]
--------------------------------
[ÜRÜN ADI]
  [ADET] x [BİRİM FİYAT]  [TOPLAM]
[ÜRÜN ADI]
  [ADET] x [BİRİM FİYAT]  [TOPLAM]
--------------------------------
TOPLAM:            [GENEL TOPLAM]
Ödeme: [NAKİT/KART]
--------------------------------
    Afiyet Olsun!
================================
```

### Yazıcı Servisi

```typescript
// printer.service.ts
interface PrintJob {
  printerId: string;
  type: 'kitchen' | 'receipt';
  content: string;
}

class PrinterService {
  async printKitchenOrder(order: Order): Promise<void>;
  async printReceipt(order: Order, payment: Payment): Promise<void>;
  async testPrint(printerId: string): Promise<boolean>;
}
```

---

## Hata Yönetimi

### API Hata Formatı

```typescript
interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
}

// Örnek
{
  "statusCode": 400,
  "message": "Masa zaten dolu",
  "error": "Bad Request",
  "timestamp": "2026-01-13T10:30:00.000Z"
}
```

### Hata Kodları

| Kod | Açıklama |
|-----|----------|
| 400 | Geçersiz istek |
| 404 | Kayıt bulunamadı |
| 409 | Çakışma (masa dolu vb.) |
| 500 | Sunucu hatası |

---

## Doğruluk Özellikleri (Correctness Properties)

*Bir özellik (property), sistemin tüm geçerli çalışmalarında doğru olması gereken bir davranış veya karakteristiktir.*

### Property 1: Sipariş Tutarı Tutarlılığı
*Her sipariş için*, sipariş toplam tutarı, sipariş kalemlerinin (miktar × birim fiyat) toplamına eşit olmalıdır.
**Validates: Requirements 1.5, 2.1**

### Property 2: Masa Durumu Tutarlılığı
*Her masa için*, eğer masada açık sipariş varsa masa durumu "occupied" olmalı, yoksa "empty" olmalıdır.
**Validates: Requirements 1.1, 1.6**

### Property 3: Sipariş Bölme Tutarlılığı
*Her sipariş bölme işlemi için*, bölünen siparişlerin toplam tutarı orijinal sipariş tutarına eşit olmalıdır.
**Validates: Requirements 2.3, 2.4**

### Property 4: Masa Birleştirme Tutarlılığı
*Her masa birleştirme işlemi için*, birleştirilen siparişlerin toplam tutarı, yeni birleşik sipariş tutarına eşit olmalıdır.
**Validates: Requirements 2.7, 2.8**

### Property 5: Mutfak Sipariş Sırası
*Her mutfak ekranı için*, siparişler oluşturulma zamanına göre sıralı gösterilmelidir (FIFO).
**Validates: Requirements 4.1, 4.2**

### Property 6: Ürün Fiyat Yansıması
*Her ürün fiyat güncellemesi için*, güncelleme sonrası yeni siparişlerde yeni fiyat kullanılmalı, mevcut siparişler etkilenmemelidir.
**Validates: Requirements 6.5, 6.8**

### Property 7: Yazıcı Sipariş Kağıdı İçeriği
*Her sipariş kağıdı için*, masa numarası, sipariş saati ve tüm ürünler eksiksiz basılmalıdır.
**Validates: Requirements 4.3, 4.4, 4.5, 4.6**

---

## Test Stratejisi

### Unit Testler
- Sipariş tutarı hesaplama
- Sipariş bölme mantığı
- Masa birleştirme mantığı
- Yazıcı format oluşturma

### Property-Based Testler
- Sipariş tutarı tutarlılığı (Property 1)
- Sipariş bölme tutarlılığı (Property 3)
- Masa birleştirme tutarlılığı (Property 4)

### Integration Testler
- Sipariş → Mutfak akışı
- Ödeme → Masa kapanış akışı
- WebSocket event'leri

### E2E Testler
- Tam sipariş akışı (masa aç → sipariş → mutfak → ödeme)
- Garson tablet sipariş akışı
- QR menü garson çağırma

---

## Klasör Yapısı

```
mega-pos/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── categories/
│   │   │   │   ├── products/
│   │   │   │   ├── tables/
│   │   │   │   ├── orders/
│   │   │   │   ├── payments/
│   │   │   │   ├── kitchen/
│   │   │   │   ├── printers/
│   │   │   │   ├── reports/
│   │   │   │   └── menu/
│   │   │   ├── common/
│   │   │   ├── config/
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   ├── pos/                    # Satış Ekranı (React)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── App.tsx
│   │   └── package.json
│   │
│   ├── waiter/                 # Garson Tablet (React)
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── kitchen/                # Mutfak Ekranı (React)
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── boss/                   # Yönetim Paneli (React)
│   │   ├── src/
│   │   └── package.json
│   │
│   └── qr-menu/                # QR Menü (React)
│       ├── src/
│       └── package.json
│
├── packages/
│   ├── shared/                 # Ortak tipler ve utils
│   │   ├── src/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   └── package.json
│   │
│   └── printer/                # Yazıcı kütüphanesi
│       ├── src/
│       └── package.json
│
├── docker-compose.yml
├── package.json
└── turbo.json                  # Monorepo config
```

---

## Deployment

### Development
```bash
# Tüm servisleri başlat
pnpm dev

# Sadece API
pnpm dev --filter=api

# Sadece POS
pnpm dev --filter=pos
```

### Production
```bash
# Build
pnpm build

# Docker ile çalıştır
docker-compose up -d
```

### Ortam Değişkenleri
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/megapos

# Redis
REDIS_URL=redis://localhost:6379

# API
API_PORT=3000
API_URL=http://localhost:3000

# Frontend
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

---

*Son Güncelleme: 13 Ocak 2026*
*Versiyon: 1.0*
