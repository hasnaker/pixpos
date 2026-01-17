# 📴 Offline Çalışma ve Senkronizasyon

## Temel Prensip

**İnternet gitse bile kafe çalışmaya devam etmeli.**
Sipariş alınmalı, ödeme yapılmalı, mutfak çalışmalı.

---

## 🏗️ MİMARİ: OFFLINE-FIRST

```
┌─────────────────────────────────────────────────────────────────────┐
│                    OFFLINE-FIRST MİMARİ                              │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    KAFE İÇİ (Local Network)                  │    │
│  │                                                              │    │
│  │     ┌─────────┐    ┌─────────┐    ┌─────────┐               │    │
│  │     │ Tablet  │    │ Tablet  │    │  Kasa   │               │    │
│  │     │ Garson  │    │ Garson  │    │   PC    │               │    │
│  │     └────┬────┘    └────┬────┘    └────┬────┘               │    │
│  │          │              │              │                     │    │
│  │          └──────────────┼──────────────┘                     │    │
│  │                         │                                    │    │
│  │                         ▼                                    │    │
│  │              ┌─────────────────────┐                         │    │
│  │              │    LOCAL GATEWAY    │ ◀── Mini PC / NUC      │    │
│  │              │    (Edge Server)    │     veya Kasa PC       │    │
│  │              │                     │                         │    │
│  │              │  ┌───────────────┐  │                         │    │
│  │              │  │ SQLite/Redis  │  │ ◀── Local cache        │    │
│  │              │  │ (Offline DB)  │  │                         │    │
│  │              │  └───────────────┘  │                         │    │
│  │              │                     │                         │    │
│  │              │  ┌───────────────┐  │                         │    │
│  │              │  │ Sync Queue    │  │ ◀── Bekleyen işlemler  │    │
│  │              │  └───────────────┘  │                         │    │
│  │              └──────────┬──────────┘                         │    │
│  └─────────────────────────┼────────────────────────────────────┘    │
│                            │                                         │
│                   İnternet varsa                                    │
│                            │                                         │
│                            ▼                                         │
│              ┌─────────────────────────┐                            │
│              │      AWS CLOUD          │                            │
│              │   (Master Database)     │                            │
│              └─────────────────────────┘                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 SYNC STRATEJİSİ

### Online Mod (Normal)

```
Tablet → Local Gateway → AWS Cloud
         (cache + forward)

Response: ~50-100ms (local cache hit)
          ~200-500ms (cloud fetch)
```

### Offline Mod (İnternet yok)

```
Tablet → Local Gateway → Local DB
         (full offline)

Response: ~20-50ms (tamamen local)

Sync Queue'ya eklenir:
├── Yeni siparişler
├── Ödeme kayıtları
├── Stok değişiklikleri
└── Müşteri işlemleri
```

### Reconnect (İnternet geldi)

```
1. Bağlantı algılandı
2. Sync Queue işlenir (FIFO)
3. Conflict resolution
4. Local cache güncellenir
5. Normal moda geçiş
```

---

## 📱 CİHAZ BAZLI OFFLINE DAVRANIŞ

### Tablet (Garson/Sipariş)

```typescript
// PWA Service Worker + IndexedDB
const offlineCapabilities = {
  // Offline'da yapılabilir
  canDo: [
    'Menüyü görüntüle',
    'Sipariş oluştur',
    'Sipariş düzenle',
    'Masa seç/değiştir',
    'Mutfağa gönder (local)',
    'Adisyon görüntüle',
  ],
  
  // Online gerekli
  needsOnline: [
    'Kredi kartı ödemesi',
    'Online sipariş al',
    'Stok sorgula (gerçek zamanlı)',
    'Raporlar',
  ],
  
  // Offline'da kısıtlı
  limited: [
    'Nakit ödeme (local kayıt, sonra sync)',
    'Müşteri puanı kullan (cached puan)',
  ]
};
```

### Kasa PC

```typescript
const kasaOfflineCapabilities = {
  canDo: [
    'Tüm tablet özellikleri',
    'Nakit ödeme al',
    'Fiş/fatura yazdır',
    'Gün sonu raporu (local)',
    'Z raporu (local)',
  ],
  
  needsOnline: [
    'Kredi kartı (POS cihazı online olmalı)',
    'E-fatura gönder',
    'Merkeze rapor gönder',
  ]
};
```

### Mutfak KDS

```typescript
const kdsOfflineCapabilities = {
  canDo: [
    'Siparişleri göster',
    'Hazır işaretle',
    'Öncelik değiştir',
    'Sesli uyarı',
  ],
  
  // KDS tamamen local çalışabilir
  // Sadece local gateway'e bağlı olması yeterli
};
```

---

## 🗄️ LOCAL DATABASE YAPISI

### SQLite (Edge Server)

```sql
-- Offline çalışma için minimum tablolar

-- Ürünler (sync edilir, nadiren değişir)
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2),
    category_id TEXT,
    image_url TEXT,
    is_available BOOLEAN DEFAULT 1,
    last_sync TIMESTAMP
);

-- Siparişler (local oluşturulur, sync edilir)
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    local_id TEXT UNIQUE,  -- Offline'da oluşturulan ID
    cloud_id TEXT,         -- Sync sonrası cloud ID
    table_number INTEGER,
    status TEXT,
    total DECIMAL(10,2),
    created_at TIMESTAMP,
    synced_at TIMESTAMP,
    sync_status TEXT  -- 'pending', 'synced', 'conflict'
);

-- Sync Queue
CREATE TABLE sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT,  -- 'order', 'payment', 'stock'
    entity_id TEXT,
    operation TEXT,    -- 'create', 'update', 'delete'
    payload JSON,
    created_at TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    last_error TEXT
);
```

---

## ⚔️ CONFLICT RESOLUTION

### Senaryo: Aynı sipariş iki yerde değişti

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CONFLICT RESOLUTION                               │
│                                                                      │
│  Offline sırasında:                                                 │
│  ├── Garson A: Sipariş #123'e "Waffle" ekledi                      │
│  └── Garson B: Sipariş #123'e "Kahve" ekledi                       │
│                                                                      │
│  İnternet gelince:                                                  │
│  1. Her iki değişiklik sync queue'da                               │
│  2. Timestamp'e göre sırala                                        │
│  3. CRDT (Conflict-free Replicated Data Type) uygula               │
│  4. Sonuç: Sipariş #123 = Waffle + Kahve (ikisi de eklenir)       │
│                                                                      │
│  Strateji: "Last Write Wins" DEĞİL, "Merge All Changes"            │
└─────────────────────────────────────────────────────────────────────┘
```

### Conflict Türleri ve Çözümleri

| Conflict | Çözüm |
|----------|-------|
| Aynı siparişe ürün ekleme | Merge (hepsini ekle) |
| Aynı ürünü silme | İlk silme geçerli |
| Fiyat değişikliği | Cloud master (son fiyat) |
| Stok güncelleme | Cloud master + delta hesapla |
| Ödeme kaydı | Duplicate check (idempotent) |

### Idempotency Key

```typescript
// Her işlem için unique key
const payment = {
  idempotencyKey: `${tenantId}-${orderId}-${timestamp}-${amount}`,
  // Bu key ile aynı ödeme iki kez işlenmez
};
```

---

## 🖥️ EDGE SERVER SEÇENEKLERİ

### Seçenek 1: Mini PC (Önerilen)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Intel NUC / Beelink Mini PC                                        │
│                                                                      │
│  Specs:                                                             │
│  • CPU: Intel N100 / i3                                             │
│  • RAM: 8GB                                                         │
│  • SSD: 256GB                                                       │
│  • OS: Ubuntu Server 22.04                                          │
│                                                                      │
│  Maliyet: $150-300                                                  │
│  Güç: 15-25W (düşük elektrik)                                       │
│                                                                      │
│  Avantaj:                                                           │
│  ✅ Sessiz                                                          │
│  ✅ Küçük (kasanın altına sığar)                                    │
│  ✅ Düşük güç tüketimi                                              │
│  ✅ Yeterli performans                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Seçenek 2: Kasa PC'yi Kullan

```
┌─────────────────────────────────────────────────────────────────────┐
│  Mevcut Kasa Bilgisayarı                                            │
│                                                                      │
│  Gereksinim:                                                        │
│  • Windows 10/11 Pro veya Linux                                     │
│  • RAM: 8GB+ (POS + Edge Server)                                    │
│  • SSD: 128GB+ boş alan                                             │
│                                                                      │
│  Kurulum: Docker Desktop                                            │
│                                                                      │
│  Avantaj:                                                           │
│  ✅ Ek maliyet yok                                                  │
│  ✅ Tek cihaz yönetimi                                              │
│                                                                      │
│  Dezavantaj:                                                        │
│  ⚠️ PC kapanırsa edge server da kapanır                            │
│  ⚠️ Performans paylaşımı                                           │
└─────────────────────────────────────────────────────────────────────┘
```

### Seçenek 3: Raspberry Pi 5 (Bütçe)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Raspberry Pi 5 (8GB)                                               │
│                                                                      │
│  Maliyet: $80-100                                                   │
│  Güç: 5-10W                                                         │
│                                                                      │
│  Avantaj:                                                           │
│  ✅ En ucuz                                                         │
│  ✅ Çok düşük güç                                                   │
│                                                                      │
│  Dezavantaj:                                                        │
│  ⚠️ Performans sınırlı (küçük kafeler için OK)                     │
│  ⚠️ SD kart güvenilirliği (SSD önerilir)                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📡 BAĞLANTI DURUMU YÖNETİMİ

### Connection State Machine

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BAĞLANTI DURUMLARI                                │
│                                                                      │
│                      ┌──────────┐                                   │
│           ┌─────────▶│  ONLINE  │◀─────────┐                        │
│           │          └────┬─────┘          │                        │
│           │               │                │                        │
│      İnternet          Timeout          Reconnect                   │
│       geldi            (5 sn)           başarılı                    │
│           │               │                │                        │
│           │               ▼                │                        │
│      ┌────┴────┐    ┌──────────┐    ┌─────┴─────┐                  │
│      │ SYNCING │◀───│ CHECKING │───▶│  OFFLINE  │                  │
│      └─────────┘    └──────────┘    └───────────┘                  │
│           │                              │                          │
│           │         Her 30 sn           │                          │
│           │         retry ──────────────┘                          │
│           │                                                         │
│           ▼                                                         │
│      Sync tamamlandı → ONLINE                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### UI Gösterimi

```typescript
// Bağlantı durumu UI component
const ConnectionStatus = () => {
  const { status, pendingSync } = useConnectionStatus();
  
  return (
    <StatusBar>
      {status === 'online' && <GreenDot />}
      {status === 'offline' && <RedDot />}
      {status === 'syncing' && <YellowDot spinning />}
      
      {pendingSync > 0 && (
        <Badge>{pendingSync} işlem bekliyor</Badge>
      )}
    </StatusBar>
  );
};
```

---

## 🔒 OFFLINE GÜVENLİK

### Local Data Encryption

```typescript
// Edge server'da veri şifreleme
const encryptionConfig = {
  algorithm: 'AES-256-GCM',
  keyDerivation: 'PBKDF2',
  
  // Key, cloud'dan alınır ve memory'de tutulur
  // Disk'e yazılmaz
  keySource: 'cloud-fetch-on-boot',
  
  // Şifrelenen veriler
  encryptedTables: [
    'orders',
    'payments', 
    'customers'
  ],
  
  // Şifrelenmeyenler (performans için)
  plainTables: [
    'products',  // Zaten public menü
    'categories'
  ]
};
```

### Offline Token Yönetimi

```typescript
// JWT token offline'da nasıl çalışır?
const offlineAuth = {
  // Login olurken uzun süreli token al
  accessTokenExpiry: '1 hour',
  refreshTokenExpiry: '30 days',
  
  // Offline'da refresh token ile yeni access token
  // Edge server kendi token üretebilir (delegated auth)
  offlineTokenGeneration: true,
  
  // Maksimum offline süre
  maxOfflineDuration: '7 days',
  
  // 7 günden fazla offline kalırsa
  // Yeniden login gerekir
};
```

---

## 📊 SYNC MONITORING

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SYNC DASHBOARD (Boss Panel)                       │
│                                                                      │
│  Şube: Queen Waffle - Kadıköy                                       │
│                                                                      │
│  Bağlantı Durumu: 🟢 Online                                         │
│  Son Sync: 2 dakika önce                                            │
│  Bekleyen İşlem: 0                                                  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Son 24 Saat Bağlantı Geçmişi                               │    │
│  │  ████████████░░████████████████████████████████████████     │    │
│  │  00:00    06:00    12:00    18:00    24:00                  │    │
│  │           ↑                                                  │    │
│  │     15 dk offline (02:30-02:45)                             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Offline Sırasında:                                                 │
│  • 3 sipariş alındı ✓ (sync edildi)                                │
│  • 2 ödeme kaydedildi ✓ (sync edildi)                              │
│  • 0 conflict                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

**Sonuç:** İnternet gitse bile kafe tam kapasite çalışır. Gelince otomatik sync olur.
