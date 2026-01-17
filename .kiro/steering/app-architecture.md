# MEGA POS - Uygulama Mimarisi

## Genel Bakış

MEGA POS, restoran/kafe işletmeleri için multi-platform POS sistemidir. Monorepo yapısında (Turborepo + pnpm) 6 frontend uygulaması ve 1 backend API'den oluşur.

## Uygulamalar ve Portlar

| Uygulama | Klasör | Port | Kullanıcı | Cihaz |
|----------|--------|------|-----------|-------|
| **API** | `apps/api` | 3001 | - | NestJS Backend |
| **Boss Panel** | `apps/boss` | 3002 | Patron/Yönetici | PC/Laptop (ofis) |
| **POS/Kasa** | `apps/pos` | 3003 | Kasiyer | Kasadaki PC/Dokunmatik |
| **Garson Tablet** | `apps/waiter` | 3004 | Garson | Tablet (masalarda) |
| **Mutfak Ekranı** | `apps/kitchen` | 3005 | Aşçı | TV/Monitor (mutfak) |
| **QR Menü** | `apps/qr-menu` | 3006 | Müşteri | Telefon |

## Uygulama Detayları

### 1. POS/Kasa Ekranı (apps/pos) - Port 3003
**Kritiklik:** ⭐⭐⭐⭐⭐ En kritik ekran
**Kullanıcı:** Kasiyer (veya garson yoksa patron)
**Cihaz:** Kasadaki PC / Tablet / Dokunmatik Ekran (1366px+)
**Durum:** Sürekli açık, tüm gün kullanılıyor

**Tasarım:** Dyson/Apple minimal - beyaz zemin, siyah tipografi, büyük touch hedefleri

---

#### POS EKRAN YAPISI

```
┌─────────────────────────────────────────────────────────────┬──────────┐
│                                                             │          │
│                      ANA İÇERİK                             │  SABİT   │
│                                                             │ SIDEBAR  │
│   • Masa Planı (ana ekran)                                  │          │
│   • Sipariş Ekranı (masa seçilince)                         │  • Kat   │
│   • Ödeme Ekranı (ödeme alırken)                            │   Planı  │
│                                                             │          │
│                                                             │  • Teras │
│                                                             │  • Salon │
│                                                             │  • Bahçe │
│                                                             │          │
└─────────────────────────────────────────────────────────────┴──────────┘
```

**Sağ Sidebar (Sabit):**
- Kat/Bölüm seçimi (Teras, Salon, Bahçe, vb.)
- Seçilen kata göre masa planı değişir

---

#### EKRAN 1: MASA PLANI (Ana Ekran)

**Görünüm:**
- Seçili katın masa düzeni (grid veya serbest yerleşim)
- Her masa kartında:
  - Masa numarası
  - Durum rengi (boş=gri, dolu=yeşil, bekliyor=sarı)
  - Oturma süresi (Dwell Time) - "32 dk" gibi
  - Toplam tutar (varsa)

**Oturma Süresi (Dwell Time):**
- Sipariş açıldığında timestamp başlar
- Kasiyer açarsa → o an başlar
- Garson gönderirse → garsonun gönderdiği an başlar
- Masa kapanınca sıfırlanır

**İşlemler:**
- Masaya tıkla → Sipariş ekranına git
- Sürükle-bırak → Masa taşıma (hızlı)

---

#### EKRAN 2: SİPARİŞ EKRANI (Yeni Sipariş)

**Senaryo:** Boş masaya tıklandı, yeni sipariş açılacak

**Layout:**
```
┌─────────────────────────────────┬─────────────────────────┐
│                                 │                         │
│     ÜRÜN SEÇİM ALANI            │     SEPETİ / FİŞ        │
│                                 │                         │
│  [Kategori Tabs]                │   Masa 3                │
│  ─────────────────              │   ─────────────         │
│                                 │   2x Latte      ₺120    │
│  ┌─────┐ ┌─────┐ ┌─────┐       │   1x Cheesecake ₺85     │
│  │Latte│ │Mocha│ │Amer.│       │   ─────────────         │
│  │ ₺60 │ │ ₺65 │ │ ₺55 │       │   TOPLAM:      ₺205    │
│  └─────┘ └─────┘ └─────┘       │                         │
│                                 │  [Mutfağa Gönder]       │
│  ┌─────┐ ┌─────┐ ┌─────┐       │                         │
│  │Cake │ │Waffle│ │Toast│       │                         │
│  └─────┘ └─────┘ └─────┘       │                         │
│                                 │                         │
└─────────────────────────────────┴─────────────────────────┘
```

**Özellikler:**
- Ürünler büyük, kolay tıklanabilir (touch-friendly)
- Kategori tabları üstte
- Sepet sağda, fiş görünümünde
- "Mutfağa Gönder" butonu

---

#### EKRAN 3: ÖDEME EKRANI (Hesap İstendi)

**Senaryo:** Müşteri kasaya geldi, "Masa 3" dedi, ödeme yapacak

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                      FİŞ GÖRÜNÜMÜ                           │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  MEGA CAFE                                          │   │
│   │  ─────────────────────────────────────────────────  │   │
│   │  Masa: 3              Tarih: 14.01.2026 15:32       │   │
│   │  Garson: Ahmet        Sipariş No: #1234             │   │
│   │  ─────────────────────────────────────────────────  │   │
│   │  2x Latte                              ₺120,00      │   │
│   │  2x Sıcak Çikolata                     ₺140,00      │   │
│   │  ─────────────────────────────────────────────────  │   │
│   │  TOPLAM:                               ₺260,00      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│   │  BÖL    │ │ İKRAM   │ │İNDİRİM  │ │  TAŞI   │          │
│   └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                             │
│   ┌─────────┐ ┌─────────┐ ┌─────────────────────┐          │
│   │ PERSONEL│ │BİRLEŞTİR│ │                     │          │
│   └─────────┘ └─────────┘ │    NAKİT / KART     │          │
│                           │                     │          │
│                           └─────────────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Butonlar:**

1. **BÖL (Split):**
   - Tıklanınca ürün seçim modalı açılır
   - Hangi ürünler ayrılacak seçilir
   - Seçilen ürünler YENİ sipariş numarasıyla ayrılır
   - 2 ayrı fiş, 2 ayrı ödeme
   - Raporlarda "Bölünmüş Ödeme" olarak işaretlenir
   - Geri birleştirilebilir (ödeme yapılmadıysa)

2. **İKRAM (Complimentary):**
   - Tıklanınca ürün seçim modalı
   - Seçilen ürün(ler) ₺0 olur
   - Onay modalı: "2x Latte ikram edilecek. Emin misiniz?"
   - Raporlarda "İkram" olarak görünür

3. **İNDİRİM (Discount):**
   - Yüzde veya tutar seçimi
   - Mevcut indirim/kampanya seçimi
   - Kolay UI/UX

4. **TAŞI (Move Table):**
   - Masa seçim modalı açılır
   - Başka masaya taşınır
   - Ana ekranda da sürükle-bırak ile yapılabilir

5. **PERSONEL:**
   - Personel indirimi uygula
   - Personel seçimi

6. **BİRLEŞTİR (Merge):**
   - Bölünmüş siparişleri geri birleştirir
   - Sadece ödeme yapılmamışsa aktif

7. **NAKİT / KART:**
   - Ödeme al
   - Başarılı → Masa kapanır, fiş yazdırılır

---

#### BÖLME İŞLEMİ DETAYI

**Senaryo:** 2 Latte + 2 Sıcak Çikolata var, 2 kişi ayrı ödeyecek

```
Orijinal Sipariş #1234:
- 2x Latte (₺120)
- 2x Sıcak Çikolata (₺140)
- TOPLAM: ₺260

[BÖL] butonuna basıldı
↓
Modal: "Hangi ürünleri ayırmak istiyorsunuz?"
☑ 1x Latte
☑ 1x Sıcak Çikolata
[Böl ve Yeni Sipariş Oluştur]
↓
Sonuç:
- Sipariş #1234: 1x Latte + 1x Sıcak Çikolata = ₺130
- Sipariş #1235: 1x Latte + 1x Sıcak Çikolata = ₺130 (Bölünmüş)

İlk kişi #1234'ü öder → Fiş çıkar
İkinci kişi #1235'i öder → Fiş çıkar

Raporlarda:
- Masa 3: Bölünmüş Ödeme (2 işlem)
- Toplam: ₺260
```

---

#### ANA EKRANLAR

| Dosya | Açıklama |
|-------|----------|
| `TableMap.tsx` | Masa planı (ana ekran) |
| `OrderScreen.tsx` | Sipariş alma (ürün seçimi) |
| `PaymentScreen.tsx` | Ödeme ekranı (fiş + işlemler) |
| `Sidebar.tsx` | Sağ sidebar (kat seçimi) |

**Modaller:**
- `SplitOrderModal.tsx` - Sipariş bölme
- `MergeOrderModal.tsx` - Sipariş birleştirme
- `DiscountModal.tsx` - İndirim uygulama
- `MoveTableModal.tsx` - Masa taşıma
- `ComplimentaryModal.tsx` - İkram onayı

---

### 2. Boss Panel (apps/boss) - Port 3002
**Kritiklik:** ⭐⭐⭐⭐ Üst yönetim için kritik
**Kullanıcı:** Şirket sahibi, finansçı, genel müdür, bölge müdürü
**Cihaz:** Web (herhangi bir cihaz) + Mobil App (gelecek)
**Erişim:** Uzaktan (internet üzerinden), mekan dışından
**Durum:** İhtiyaç olduğunda açılır

**Görevleri:**
- Dashboard (tüm şubelerin özeti)
- Satış raporları ve analizler
- Finansal raporlar (gelir/gider, kâr/zarar)
- Multi-branch yönetimi (birden fazla şube)
- Personel performans raporları
- Stok durumu (genel bakış)
- Trend analizleri, grafikler
- Karşılaştırmalı raporlar (şube vs şube, dönem vs dönem)

**Ana Ekranlar:**
- `Dashboard.tsx` - Tüm şubelerin özet dashboard'u
- `Reports.tsx` - Detaylı raporlar ve analizler
- `Branches.tsx` - Şube yönetimi (gelecek)
- `Finance.tsx` - Finansal raporlar (gelecek)

**İÇERMEZ (Bunlar POS Ayarları'nda):**
- ❌ Ürün yönetimi → POS Ayarları
- ❌ Kategori yönetimi → POS Ayarları
- ❌ Masa yönetimi → POS Ayarları
- ❌ Yazıcı ayarları → POS Ayarları

**NOT:** Boss Panel = Uzaktan yönetim, mekan dışından erişim, üst düzey raporlama

---

### 3. Garson Tablet (apps/waiter) - Port 3004
**Kritiklik:** ⭐⭐⭐⭐ Servis için kritik
**Kullanıcı:** Garson
**Cihaz:** Tablet (iPad, Android tablet)
**Durum:** Garson masalarda dolaşırken kullanır

**Görevleri:**
- Masa listesi görme
- Masada sipariş alma
- Siparişi mutfağa gönderme
- Sipariş özeti görme

**Ana Ekranlar:**
- `TableList.tsx` - Masa listesi
- `OrderScreen.tsx` - Sipariş alma

**NOT:** POS'tan farkı: Tablet optimize, sadece sipariş alma, ödeme yok

---

### 4. Mutfak Ekranı (apps/kitchen) - Port 3005
**Kritiklik:** ⭐⭐⭐⭐ Mutfak için kritik
**Kullanıcı:** Aşçı, mutfak personeli
**Cihaz:** Mutfaktaki TV/Monitor
**Durum:** Sürekli açık

**Görevleri:**
- Gelen siparişleri görmek
- Sipariş hazırlandığında "Hazır" işaretlemek
- Sesli bildirim (yeni sipariş)

**Ana Ekranlar:**
- `App.tsx` - Sipariş kartları grid

**Özellikler:**
- Gerçek zamanlı (WebSocket)
- Sesli bildirim
- Renk kodları (yeni=kırmızı, hazırlanıyor=sarı, hazır=yeşil)

---

### 5. QR Menü (apps/qr-menu) - Port 3006
**Kritiklik:** ⭐⭐⭐ Müşteri deneyimi
**Kullanıcı:** Müşteri
**Cihaz:** Müşterinin telefonu
**Durum:** Müşteri QR kod okutunca açılır

**Görevleri:**
- Menüyü görüntüleme
- Ürün detayı görme
- Garson çağırma
- (Gelecek) Sipariş verme

**NOT:** Temassız menü, kağıt menü yerine

---

### 6. API Backend (apps/api) - Port 3001
**Teknoloji:** NestJS + TypeScript + PostgreSQL
**Görevleri:**
- Tüm frontend'lere veri sağlama
- İş mantığı (sipariş, ödeme, stok)
- WebSocket (gerçek zamanlı)
- Yazıcı entegrasyonu

**Ana Modüller:**
- `orders/` - Sipariş yönetimi
- `products/` - Ürün yönetimi
- `tables/` - Masa yönetimi
- `kitchen/` - Mutfak KDS
- `printers/` - Yazıcı servisi
- `payments/` - Ödeme işlemleri

---

## Sipariş Akışı

```
1. Garson/Kasiyer sipariş alır (waiter veya pos)
         ↓
2. API'ye POST /orders
         ↓
3. "Mutfağa Gönder" → WebSocket ile kitchen'a
         ↓
4. Mutfak ekranında sipariş görünür (kitchen)
         ↓
5. Aşçı hazırlar → "Hazır" butonuna basar
         ↓
6. WebSocket ile pos/waiter'a bildirim
         ↓
7. Müşteriye servis edilir
         ↓
8. Ödeme alınır (pos) → Masa kapanır
```

## Teknoloji Stack

- **Monorepo:** Turborepo + pnpm
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** NestJS + TypeScript
- **Database:** PostgreSQL
- **Styling:** TailwindCSS
- **State:** React Query (TanStack Query)
- **Realtime:** Socket.io
- **Shared:** `packages/shared` (types, utils)

## Önemli Notlar

1. **POS ≠ Boss Panel**
   - POS = Kasadaki sipariş/ödeme ekranı
   - Boss = Yönetim paneli (ürün, rapor, ayar)

2. **Tasarım Dili**
   - Tüm uygulamalar: Apple Tahoe / Dyson minimal
   - Beyaz zemin, siyah tipografi
   - Büyük touch hedefleri (min 44px)
   - DM Sans font

3. **Gerçek Zamanlı**
   - Mutfak, POS, Garson arası WebSocket
   - Sipariş durumu anlık güncellenir

4. **Offline Desteği (Gelecek)**
   - POS ve Garson offline çalışabilecek
   - Sync queue ile senkronizasyon
