# Queen Waffle - API ve Frontend Dokümantasyonu

**Tarih:** 18 Ocak 2026  
**Durum:** ✅ Production Ready  
**API Base URL:** `https://api.pixpos.cloud/api`

---

## 🌐 Sistem URL'leri

| Uygulama | URL | Kullanıcı |
|----------|-----|-----------|
| **POS** | https://queen.pixpos.cloud/pos | Kasiyer |
| **Boss Panel** | https://queen.pixpos.cloud/boss | Yönetici |
| **Garson Tablet** | https://queen.pixpos.cloud/waiter | Garson |
| **Mutfak Ekranı** | https://queen.pixpos.cloud/kitchen | Aşçı |
| **Müşteri Ekranı** | https://queen.pixpos.cloud/pos/display | Müşteri |
| **QR Menü** | https://queen.pixpos.site | Müşteri |
| **API** | https://api.pixpos.cloud/api | Backend |

---

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-17T22:00:12.100Z",
  "service": "mega-pos-api"
}
```

---

### 🪑 Masalar (Tables)

#### Tüm Masaları Listele
```
GET /api/tables
```
**Response:** 41 masa (Bahçe: 20, Dışarı: 10, Salon: 10, Test: 1)

**Örnek Masa:**
```json
{
  "id": "143b2e02-34eb-4a3d-979a-873de8b85dbf",
  "name": "BH-01",
  "zone": "Bahçe",
  "capacity": 4,
  "status": "occupied",  // empty | occupied
  "sortOrder": 0,
  "isActive": true
}
```

#### Masa Oluştur
```
POST /api/tables
Content-Type: application/json

{
  "name": "BH-21",
  "zone": "Bahçe",
  "capacity": 4
}
```

#### Masa Güncelle
```
PATCH /api/tables/:id
```

#### Masa Sil
```
DELETE /api/tables/:id
```

---

### 🍽️ Ürünler (Products)

#### Tüm Ürünleri Listele
```
GET /api/products
```
**Response:** 100+ ürün (Waffle, Bubble Tea, Kahve, vb.)

**Örnek Ürün:**
```json
{
  "id": "879002e2-4780-...",
  "categoryId": "54288a9b-e6c8-...",
  "name": "Özel Waffle",
  "price": "330.00",
  "imageUrl": "https://dh8ksnk9abt8f.cloudfront.net/products/...",
  "description": "Özel sos ve malzemelerle hazırlanmış waffle",
  "isActive": true,
  "isFeatured": false,
  "category": {
    "id": "54288a9b-e6c8-...",
    "name": "Waffle"
  }
}
```

#### Ürün Oluştur
```
POST /api/products
Content-Type: application/json

{
  "name": "Yeni Ürün",
  "categoryId": "uuid",
  "price": 150.00,
  "description": "Açıklama"
}
```

---

### 📁 Kategoriler (Categories)

#### Tüm Kategorileri Listele
```
GET /api/categories
```
**Response:** 18 kategori

**Mevcut Kategoriler:**
- Bubble Tea
- Çay & Bitki Çayı
- Çocuk Menü
- Cuplar
- Dondurma
- Frozen
- Krepler
- Kutu İçecekler
- MilkShake
- Pankek
- Pastalar
- Queen Kokteyl
- Sıcak Dünya Kahveleri
- Sıcak İçecekler
- Soğuk Dünya Kahveleri
- Taze Sıkma
- Türk Kahveleri
- Waffle

---

### 📝 Siparişler (Orders)

#### Tüm Siparişleri Listele
```
GET /api/orders
```

**Sipariş Durumları:**
- `open` - Açık (sipariş alınıyor)
- `sent` - Mutfağa gönderildi
- `preparing` - Hazırlanıyor
- `ready` - Hazır
- `paid` - Ödendi
- `cancelled` - İptal edildi

**Örnek Sipariş:**
```json
{
  "id": "2d488330-d83d-...",
  "tableId": "0d383b8f-e5c5-...",
  "orderNumber": "ORD-20260117-155607",
  "status": "sent",
  "totalAmount": "1710.00",
  "items": [
    {
      "id": "6461b589-c9b4-...",
      "productId": "d7dddeab-e3f8-...",
      "productName": "Blanc Pankek",
      "quantity": 1,
      "unitPrice": "340.00",
      "totalPrice": "340.00",
      "status": "preparing"
    }
  ],
  "table": {
    "name": "SL-01",
    "zone": "Salon"
  }
}
```

#### Sipariş Oluştur
```
POST /api/orders
Content-Type: application/json

{
  "tableId": "uuid"
}
```

#### Siparişe Ürün Ekle
```
POST /api/orders/:id/items
Content-Type: application/json

{
  "productId": "uuid",
  "quantity": 2,
  "notes": "Az şekerli"
}
```

#### Mutfağa Gönder
```
POST /api/orders/:id/send
```

#### Sipariş İptal
```
POST /api/orders/:id/cancel
```

#### Masa Birleştir
```
POST /api/orders/merge
Content-Type: application/json

{
  "sourceOrderId": "uuid",
  "targetOrderId": "uuid"
}
```

#### Masa Taşı
```
POST /api/orders/:id/transfer
Content-Type: application/json

{
  "targetTableId": "uuid"
}
```

#### Sipariş Böl
```
POST /api/orders/:id/split
Content-Type: application/json

{
  "itemIds": ["uuid1", "uuid2"]
}
```

---

### 💳 Ödemeler (Payments)

#### Ödeme Oluştur
```
POST /api/payments
Content-Type: application/json

{
  "orderId": "uuid",
  "amount": 1710.00,
  "paymentMethod": "cash"  // cash | card | online
}
```

**Ödeme Akışı:**
1. Nakit/Kart seçilir
2. ÖKC'ye `/api/okc/sale` isteği gider
3. ÖKC onaylarsa ödeme kaydedilir
4. Sipariş `paid` durumuna geçer
5. Masa `empty` olur

---

### 🖨️ ÖKC / Ingenico Entegrasyonu

#### Yapılandırma Getir
```
GET /api/okc/config
```
**Response:**
```json
{
  "ip": "192.168.1.116",
  "port": 4100,
  "timeout": 10000,
  "terminalId": "QUEEN001"
}
```

#### Yapılandırma Güncelle
```
PUT /api/okc/config
Content-Type: application/json

{
  "ip": "192.168.1.116",
  "port": 4100,
  "timeout": 10000,
  "terminalId": "QUEEN001"
}
```

#### Bağlantı Testi
```
POST /api/okc/test
```
**Response:**
```json
{
  "success": true,
  "responseTime": 45
}
```

#### Satış İşlemi (Nakit/Kart)
```
POST /api/okc/sale
Content-Type: application/json

{
  "amount": 171000,        // Kuruş cinsinden (1710.00 TL)
  "orderId": "uuid",
  "description": "Sipariş #ORD-20260117-155607",
  "paymentType": "cash"    // cash | card
}
```
**Response (Başarılı):**
```json
{
  "success": true,
  "transactionId": "TX-1737151234567",
  "authCode": "123456",
  "cardNumber": "****1234",
  "cardType": "VISA",
  "amount": 171000
}
```

#### İade İşlemi
```
POST /api/okc/refund
Content-Type: application/json

{
  "amount": 171000,
  "originalTransactionId": "TX-...",
  "orderId": "uuid"
}
```

#### İptal İşlemi
```
POST /api/okc/void
Content-Type: application/json

{
  "transactionId": "TX-...",
  "orderId": "uuid"
}
```

#### Gün Sonu
```
POST /api/okc/end-of-day
```

#### Son İşlemler
```
GET /api/okc/transactions?limit=50
```

---

### 🖨️ Yazıcılar (Printers)

#### Yazıcıları Listele
```
GET /api/printers
```
**Response:**
```json
[
  {
    "id": "57b96749-...",
    "name": "KASA",
    "type": "receipt",
    "connectionType": "tcp",
    "ipAddress": "192.168.1.106",
    "port": 9100,
    "isActive": true
  },
  {
    "id": "7a63a07f-...",
    "name": "WAFFLE",
    "type": "kitchen",
    "connectionType": "tcp",
    "ipAddress": "192.168.1.149",
    "port": 9100,
    "isActive": true
  }
]
```

---

### 👤 Kullanıcılar (Users)

#### Kullanıcıları Listele
```
GET /api/users
```
**Response:**
```json
[
  {
    "id": "b5ed008c-...",
    "name": "Garson 1",
    "role": "waiter",
    "isActive": true
  },
  {
    "id": "25ccd929-...",
    "name": "Kasiyer",
    "role": "cashier",
    "isActive": true
  },
  {
    "id": "11e5cd5f-...",
    "name": "Yönetici",
    "role": "admin",
    "isActive": true
  }
]
```

**Roller:**
- `admin` - Yönetici (tüm yetkiler)
- `cashier` - Kasiyer (POS erişimi)
- `waiter` - Garson (Tablet erişimi)

---

## 📱 Frontend Kullanım Kaynakları

### POS Uygulaması (`apps/pos`)

| Dosya | Açıklama |
|-------|----------|
| `src/pages/TableMap.tsx` | Masa planı (ana ekran) |
| `src/pages/OrderScreen.tsx` | Sipariş alma ekranı |
| `src/pages/PaymentScreen.tsx` | Ödeme ekranı (ÖKC entegrasyonlu) |
| `src/pages/LockScreen.tsx` | Kullanıcı seçim ekranı |
| `src/pages/CustomerDisplay.tsx` | Müşteri ekranı |
| `src/pages/settings/` | Ayarlar (Ürün, Kategori, Masa, Yazıcı, ÖKC) |
| `src/services/api.ts` | API servisleri |

**API Kullanımı:**
```typescript
import { ordersApi, tablesApi, productsApi, paymentsApi } from '@/services/api';

// Masaları getir
const tables = await tablesApi.getAll();

// Sipariş oluştur
const order = await ordersApi.create({ tableId: 'uuid' });

// Ürün ekle
await ordersApi.addItem(order.id, { productId: 'uuid', quantity: 2 });

// Mutfağa gönder
await ordersApi.send(order.id);

// Ödeme al
await paymentsApi.create({
  orderId: order.id,
  amount: 1710,
  paymentMethod: 'cash'
});
```

---

### Garson Tablet (`apps/waiter`)

| Dosya | Açıklama |
|-------|----------|
| `src/pages/LoginScreen.tsx` | Garson seçim ekranı |
| `src/pages/TableList.tsx` | Masa listesi |
| `src/pages/OrderScreen.tsx` | Sipariş alma |
| `src/services/api.ts` | API servisleri |
| `src/services/offlineStorage.ts` | Offline desteği |

**Özellikler:**
- PWA desteği (offline çalışma)
- 30 saniyede bir otomatik senkronizasyon
- Türkçe alfabetik sıralama

---

### Mutfak Ekranı (`apps/kitchen`)

| Dosya | Açıklama |
|-------|----------|
| `src/App.tsx` | Sipariş kartları grid |
| `src/services/api.ts` | API servisleri |

**Özellikler:**
- WebSocket ile gerçek zamanlı güncelleme
- Sesli bildirim (yeni sipariş)
- Renk kodları (yeni=kırmızı, hazırlanıyor=sarı, hazır=yeşil)

---

### Boss Panel (`apps/boss`)

| Dosya | Açıklama |
|-------|----------|
| `src/pages/Dashboard.tsx` | Ana dashboard |
| `src/pages/Reports.tsx` | Raporlar |
| `src/services/api.ts` | API servisleri |

---

### QR Menü (`apps/qr-menu`)

| Dosya | Açıklama |
|-------|----------|
| `src/App.tsx` | Menü görüntüleme |
| `src/services/api.ts` | API servisleri |

**URL:** https://queen.pixpos.site

---

## 🔧 Donanım Yapılandırması

### ÖKC (Ingenico)
- **IP:** 192.168.1.116
- **Port:** 4100
- **Terminal ID:** QUEEN001
- **Protokol:** TCP/IP ECR

### Yazıcılar
| Yazıcı | IP | Port | Tip |
|--------|-----|------|-----|
| KASA | 192.168.1.106 | 9100 | Fiş yazıcı |
| WAFFLE | 192.168.1.149 | 9100 | Mutfak yazıcı |

---

## ✅ Ödeme Akışı (Güncellenmiş)

### Nakit Ödeme
1. Kasiyer "Nakit" butonuna basar
2. Alınan tutarı girer
3. "Ödemeyi Onayla" butonuna basar
4. **ÖKC'ye `/api/okc/sale` isteği gider** (paymentType: 'cash')
5. ÖKC mali fiş basar
6. Ödeme veritabanına kaydedilir
7. Sipariş `paid` durumuna geçer
8. Masa `empty` olur

### Kredi Kartı Ödeme
1. Kasiyer "Kredi Kartı" butonuna basar
2. **ÖKC'ye `/api/okc/sale` isteği gider** (paymentType: 'card')
3. Müşteri kartını ÖKC cihazına okuttur
4. ÖKC onaylarsa ödeme kaydedilir
5. Sipariş `paid` durumuna geçer
6. Masa `empty` olur

### Online Ödeme
1. Kasiyer "Online" butonuna basar
2. **ÖKC'ye gitmez** (direkt veritabanına kaydedilir)
3. Sipariş `paid` durumuna geçer
4. Masa `empty` olur

---

## 📊 Veri İstatistikleri (Canlı)

| Veri | Adet |
|------|------|
| Masalar | 41 |
| Ürünler | 100+ |
| Kategoriler | 18 |
| Kullanıcılar | 6 |
| Yazıcılar | 2 |

---

## 🚀 Build Boyutları

| Uygulama | Boyut |
|----------|-------|
| POS | 877 KB |
| Waiter | 367 KB |
| Boss | 381 KB |
| Kitchen | 292 KB |
| QR Menu | 234 KB |

---

**Son Güncelleme:** 18 Ocak 2026, 01:00
