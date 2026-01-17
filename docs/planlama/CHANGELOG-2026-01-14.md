# Değişiklik Logu - 14 Ocak 2026

## 🖨️ Yazıcı Entegrasyonu & Kategori Routing (v4.0)

### Yeni Özellikler

**Yazıcı Keşif Sistemi:**
- Ağdaki yazıcıları otomatik tarama (port 9100)
- IP aralığı tarama desteği
- Bağlantı testi

**Kategori Bazlı Yazıcı Yönlendirme:**
- Her kategoriye farklı yazıcı atanabilir
- Sipariş gönderilince ürünler kategorilerine göre gruplanır
- Her grup ilgili yazıcıya ayrı fiş olarak gider

### API Endpoint'leri
```
POST /api/printers/discover          - Ağı tara
POST /api/printers/test-connection   - IP test et
POST /api/printers/discover/range    - IP aralığı tara
PUT  /api/categories/:id/printer     - Kategoriye yazıcı ata
```

### Mevcut Eşleştirmeler
| Kategori | Yazıcı |
|----------|--------|
| İçecekler | Bar Yazıcısı |
| Kahve Dünyası | Bar Yazıcısı |
| Yiyecekler | Mutfak Yazıcısı |
| Tatlılar | Mutfak Yazıcısı |

---

## 📱 Garson Tablet Geliştirmeleri (v3.5)

### Sipariş Geçmişi Özelliği
- "Yeni Sipariş" ve "Siparişler" sekmeleri
- Gönderilmiş siparişleri görüntüleme
- Sipariş detayına tıklayarak inceleme
- Masa toplamı özeti

### Yeni Akış
1. Garson sipariş gönderir → `sent` durumu
2. Masa açık kalır, yeni sipariş eklenebilir
3. "Siparişler" sekmesinden geçmiş görülebilir
4. POS'tan ödeme alınınca kapanır

---

## 🔄 Sipariş Durumu Sadeleştirme (v3.0)

### Eski vs Yeni
```
Eski: open → kitchen → preparing → ready → paid
Yeni: open → sent → paid
```

### Değişiklikler
- Mutfak onayı kaldırıldı (yazıcıya gidince bitti)
- `kitchen`, `preparing`, `ready` durumları kaldırıldı
- Tüm frontend'ler güncellendi

---

## 🧹 Gün Sonu Kapatma (v3.0)

### Yeni Özellik
- `POST /api/orders/close-all` - Tüm siparişleri kapat
- POS Ayarlar'da "Tüm Siparişleri Kapat" butonu
- Onay modalı ile güvenli kapatma

---

## 🎨 LockScreen - Final Versiyon (v3.0)

### Yapılan Değişiklikler
- **3D efektler kaldırıldı** - Performans için sadeleştirildi
- **Animated Gradient Background** - 15 saniyelik döngüsel gradient animasyonu
- **Logo + Saat ortalandı** - PIXPOS logosu ve saat merkeze alındı
- **Glassmorphism UI** - Blur efektli kullanıcı kartları
- **Minimal tasarım** - Temiz ve hızlı

### Özellikler
- Animasyonlu gradient arka plan
- PIXPOS SVG logo (ortalanmış)
- Büyük saat gösterimi (100px)
- Kullanıcı seçim paneli
- PIN girişi (klavye desteği)
- Hızlı erişim butonları
- Online/offline göstergesi

## 🐛 Düzeltilen Hatalar
- `price.toFixed is not a function` - OrderScreen'de düzeltildi
- CSS syntax hatası (fazla `}`) - Düzeltildi

## 📁 Değiştirilen Dosyalar
| Dosya | Değişiklik |
|-------|------------|
| `apps/pos/src/pages/LockScreen.tsx` | Sadeleştirildi, 3D kaldırıldı |
| `apps/pos/src/pages/OrderScreen.tsx` | price.toFixed hatası düzeltildi |
| `apps/pos/src/index.css` | Yeni lock screen stilleri |

## 🔐 PIN Kodları
| Kullanıcı | Rol | PIN |
|-----------|-----|-----|
| Ahmet Kaya | Kasiyer | `1234` |
| Mehmet Yılmaz | Garson | `5678` |
| Elif Şahin | Yönetici | `0000` |

## 🚀 Erişim Adresleri
- **POS**: http://localhost:3003
- **Boss Panel**: http://localhost:3002
- **Garson Tablet**: http://localhost:3004
- **Mutfak Ekranı**: http://localhost:3005
- **QR Menü**: http://localhost:3006

## ✅ Tamamlanan Görevler
1. Task 24: Printer System (ESC/POS, Templates, Auto-print)
2. LockScreen yeniden tasarımı
3. OrderScreen hata düzeltmesi
4. Sipariş durumu sadeleştirme (kitchen/ready kaldırıldı)
5. Garson tablet sipariş geçmişi
6. Gün sonu toplu kapatma
7. Yazıcı keşif sistemi
8. Kategori bazlı yazıcı routing

## 📁 Değiştirilen Dosyalar (Son Oturum)
| Dosya | Değişiklik |
|-------|------------|
| `apps/api/src/modules/printers/printer-discovery.service.ts` | YENİ - Ağ tarama |
| `apps/api/src/modules/printers/auto-print.service.ts` | Kategori routing |
| `apps/api/src/modules/printers/printers.controller.ts` | Discovery endpoint'leri |
| `apps/api/src/modules/printers/printers.module.ts` | Yeni servisler |
| `apps/api/src/modules/categories/categories.controller.ts` | Yazıcı atama |
| `apps/api/src/modules/categories/categories.service.ts` | assignPrinter metodu |
| `apps/api/src/modules/orders/orders.service.ts` | closeAllOrders |
| `apps/api/src/modules/orders/orders.controller.ts` | close-all endpoint |
| `apps/waiter/src/pages/OrderScreen.tsx` | Sipariş geçmişi UI |
| `apps/waiter/src/pages/TableList.tsx` | Yeni status değerleri |
| `apps/pos/src/pages/TableMap.tsx` | Yeni status değerleri |
| `apps/pos/src/pages/OrderScreen.tsx` | Yeni status değerleri |
| `apps/pos/src/pages/SettingsScreen.tsx` | Gün sonu kapatma |
| `apps/pos/src/components/ui/TableCard.tsx` | Yeni status tipleri |

## 📋 Sonraki Adımlar
- Boss Panel'e yazıcı yönetim UI'ı
- Ürün listesi Excel import
- Cariye (veresiye) sistemi
