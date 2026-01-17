# 💳 POS ve ÖKC Entegrasyonu (Türkiye) - GÜNCEL

## ⚠️ KRİTİK BİLGİ

**Türkiye'de kafe/restoran işletmeleri için ÖKC (Özel Entegratör Kasa) ZORUNLU!**

---

## 🇹🇷 TÜRKİYE'DE GERÇEK DURUM

### Yasal Zorunluluk

```
┌─────────────────────────────────────────────────────────────────────┐
│  TÜRKİYE'DE KAFE/RESTORAN İÇİN ZORUNLU SİSTEM                      │
│                                                                      │
│  Maliye Bakanlığı Düzenlemesi:                                      │
│  ├── Kafe/Restoran işletmeleri ÖKC kullanmak ZORUNDA               │
│  ├── ÖKC = Özel Entegratör Kasa (Mali mühürlü cihaz)               │
│  ├── Yazılım → ÖKC → EFT-POS akışı                                 │
│  └── Direkt yazılım-POS entegrasyonu YASAK                         │
│                                                                      │
│  Neden ÖKC Zorunlu?                                                 │
│  ├── Mali kayıt tutma (vergi denetimi)                             │
│  ├── Z raporu otomatik                                              │
│  ├── Maliye'ye bağlı                                                │
│  └── Kayıt dışı ekonomiyi önleme                                    │
└─────────────────────────────────────────────────────────────────────┘
```

### Sistem Akışı (Doğru)

```
┌─────────────────────────────────────────────────────────────────────┐
│  DOĞRU SİSTEM AKIŞI                                                 │
│                                                                      │
│  ┌─────────────┐                                                    │
│  │  MEGA POS   │  (Sipariş yönetimi)                                │
│  │  Yazılımı   │                                                    │
│  └──────┬──────┘                                                    │
│         │                                                            │
│         │ Sipariş bilgisi gönder                                    │
│         ▼                                                            │
│  ┌─────────────┐                                                    │
│  │     ÖKC     │  (Özel Entegratör Kasa)                           │
│  │  Mali Mühür │  Hugin, Datecs, Olivetti, vb.                     │
│  └──────┬──────┘                                                    │
│         │                                                            │
│         │ Ödeme talebi gönder                                       │
│         ▼                                                            │
│  ┌─────────────┐                                                    │
│  │  EFT-POS    │  (Banka POS cihazı)                               │
│  │   Cihazı    │  Garanti, Yapı Kredi, vb.                         │
│  └─────────────┘                                                    │
│                                                                      │
│  ❌ YANLIŞ: Mega POS → Direkt POS (YASAK)                          │
│  ✅ DOĞRU: Mega POS → ÖKC → POS                                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🏢 ÖKC ÜRETİCİLERİ VE ENTEGRASYON

### Türkiye'deki ÖKC Markaları

| Marka | Entegrasyon | API | Zorluk |
|-------|-------------|-----|--------|
| **Hugin** | Var | Sınırlı | Orta |
| **Datecs** | Var | Var | Kolay |
| **Olivetti** | Var | Var | Orta |
| **Sam4s** | Var | Sınırlı | Zor |
| **Wincor Nixdorf** | Var | Var | Orta |
| **NCR** | Var | Var | Kolay |

### INPOS ve Entegratör Firmalar

```
┌─────────────────────────────────────────────────────────────────────┐
│  ENTEGRATÖR FİRMALAR (ÖKC Yazılım Sağlayıcıları)                   │
│                                                                      │
│  INPOS (ve benzerleri):                                             │
│  ├── ÖKC cihazları için yazılım geliştirirler                      │
│  ├── Maliye onaylı yazılım                                          │
│  ├── 3. parti yazılımlarla entegrasyon sağlarlar                   │
│  └── Ama süreç YAVAŞ ve PAHALI                                     │
│                                                                      │
│  Sorun:                                                             │
│  ├── "1 ayda ancak dönerler" (gerçek)                              │
│  ├── Bürokratik süreç                                               │
│  ├── Yüksek entegrasyon ücreti                                      │
│  └── Teknik destek zayıf                                            │
│                                                                      │
│  Alternatif Yaklaşım:                                               │
│  ├── Direkt ÖKC üreticisi ile çalış                                │
│  ├── Kendi protokollerini kullan                                    │
│  └── INPOS'tan bağımsız ol                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔌 ÖKC ENTEGRASYON YÖNTEMLERİ

### Yöntem 1: Seri Port (RS-232)

```typescript
// ÖKC ile iletişim (Hugin örneği)
class OKCIntegration {
  private port: SerialPort;
  
  constructor(portName: string = 'COM3') {
    this.port = new SerialPort(portName, {
      baudRate: 9600,
      dataBits: 8,
      parity: 'none',
      stopBits: 1
    });
  }
  
  async sendSale(order: Order): Promise<OKCResponse> {
    // 1. Sipariş bilgisini ÖKC'ye gönder
    const command = this.buildSaleCommand({
      items: order.items,
      total: order.total,
      paymentType: 'CARD' // veya 'CASH'
    });
    
    // 2. ÖKC'ye gönder
    await this.port.write(command);
    
    // 3. ÖKC, EFT-POS'a ödeme talebini gönderir
    // 4. Cevap bekle
    const response = await this.waitForResponse();
    
    // 5. ÖKC'den fiş numarası ve onay gelir
    return this.parseResponse(response);
  }
  
  private buildSaleCommand(data: any): Buffer {
    // ÖKC spesifik protokol
    // Her marka farklı format kullanır
    const cmd = Buffer.alloc(256);
    // Hugin formatı
    cmd.write('SALE', 0);
    cmd.writeUInt32BE(data.total * 100, 10);
    // ...
    return cmd;
  }
}
```

### Yöntem 2: TCP/IP (Modern ÖKC'ler)

```typescript
// Network üzerinden ÖKC entegrasyonu
class OKCNetworkIntegration {
  private baseUrl: string;
  
  constructor(okcIP: string) {
    this.baseUrl = `http://${okcIP}:8080`;
  }
  
  async sendSale(order: Order): Promise<OKCResponse> {
    const response = await fetch(`${this.baseUrl}/api/sale`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: order.items.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price,
          vatRate: 10 // KDV %10
        })),
        total: order.total,
        paymentType: 'CARD'
      })
    });
    
    return await response.json();
  }
}
```

---

## 💰 MALİYET ANALİZİ

### ÖKC Cihaz Maliyetleri

| Marka | Model | Fiyat | Özellik |
|-------|-------|-------|---------|
| Hugin | HG-2200 | ₺15,000-25,000 | Temel model |
| Datecs | WP-500 | ₺20,000-30,000 | Dokunmatik |
| Olivetti | Nettuna 7000 | ₺25,000-35,000 | Premium |
| Sam4s | ER-940 | ₺18,000-28,000 | Orta segment |

### Entegrasyon Maliyetleri

| Kalem | Maliyet | Açıklama |
|-------|---------|----------|
| **ÖKC Cihazı** | ₺15,000-35,000 | Tek seferlik |
| **Entegrasyon (INPOS)** | ₺10,000-30,000 | Eğer INPOS kullanılırsa |
| **Entegrasyon (Direkt)** | ₺5,000-15,000 | Kendi geliştirme |
| **Yıllık Bakım** | ₺2,000-5,000 | Servis + güncelleme |
| **EFT-POS Cihazı** | ₺0-2,000 | Banka verir |

---

## 🚀 MEGA POS İÇİN STRATEJİ

### Yaklaşım 1: Direkt ÖKC Entegrasyonu (Önerilen)

```
┌─────────────────────────────────────────────────────────────────────┐
│  DİREKT ENTEGRASYON STRATEJİSİ                                      │
│                                                                      │
│  1. ÖKC Üreticisi ile Görüşme                                       │
│     ├── Hugin, Datecs, Olivetti ile iletişim                       │
│     ├── API dokümantasyonu talep et                                 │
│     ├── Test cihazı talep et                                        │
│     └── Toplu anlaşma yap (volume discount)                        │
│                                                                      │
│  2. Kendi Entegrasyon Geliştir                                      │
│     ├── INPOS'a bağımlı olma                                        │
│     ├── Adapter pattern kullan                                      │
│     ├── Her marka için ayrı adapter                                 │
│     └── Maliyet: ₺20,000-50,000 (tek seferlik)                     │
│                                                                      │
│  3. Müşteriye Paket Sun                                             │
│     ├── Mega POS + ÖKC cihazı                                       │
│     ├── Kurulum dahil                                               │
│     ├── Entegrasyon hazır                                           │
│     └── Fiyat: ₺30,000-50,000 (başlangıç)                          │
│                                                                      │
│  Avantajlar:                                                        │
│  ✅ INPOS'tan bağımsız                                              │
│  ✅ Hızlı destek                                                    │
│  ✅ Düşük maliyet (uzun vadede)                                     │
│  ✅ Tam kontrol                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Yaklaşım 2: INPOS ile Çalışma (Alternatif)

```
┌─────────────────────────────────────────────────────────────────────┐
│  INPOS İLE ÇALIŞMA                                                  │
│                                                                      │
│  Avantajlar:                                                        │
│  ✅ Hazır entegrasyon                                               │
│  ✅ Maliye onaylı                                                   │
│  ✅ Çoklu ÖKC desteği                                               │
│                                                                      │
│  Dezavantajlar:                                                     │
│  ❌ Yavaş süreç (1 ay+)                                             │
│  ❌ Yüksek maliyet                                                  │
│  ❌ Bağımlılık                                                      │
│  ❌ Zayıf destek                                                    │
│                                                                      │
│  Karar: İlk etapta INPOS'tan kaçın, direkt entegrasyon yap         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📋 UYGULAMA PLANI

### Adım 1: ÖKC Üreticileri ile Görüşme

```
Hafta 1-2:
├── Hugin ile iletişim
│   ├── Tel: 0212 XXX XX XX
│   ├── API dokümantasyonu talep
│   └── Test cihazı talep
│
├── Datecs ile iletişim
│   ├── Daha modern API
│   └── Daha kolay entegrasyon
│
└── Olivetti ile iletişim
    └── Premium segment
```

### Adım 2: Pilot Uygulama

```
Hafta 3-6:
├── Queen Waffle'da test
├── Bir ÖKC cihazı al (₺20,000)
├── Entegrasyon geliştir
├── Test et
└── Sorunları çöz
```

### Adım 3: Yaygınlaştırma

```
Hafta 7+:
├── Diğer markalarla entegrasyon
├── Adapter pattern ile genişlet
├── Müşterilere paket sun
└── Toplu alım anlaşmaları
```

---

## ⚠️ ÖNEMLİ NOTLAR

```
1. ÖKC ZORUNLU
   └── Türkiye'de kafe/restoran için yasal zorunluluk

2. INPOS ZORUNLU DEĞİL
   └── Direkt ÖKC üreticisi ile çalışılabilir

3. MALİYET
   └── ÖKC cihazı + entegrasyon = ₺25,000-50,000

4. SÜREÇ
   └── INPOS ile 1 ay+, direkt ile 2-3 hafta

5. DESTEK
   └── Kendi entegrasyonumuz = hızlı destek
```

---

**Sonuç:** ÖKC zorunlu, ama INPOS değil. Direkt ÖKC üreticileri ile çalışarak daha hızlı ve ucuz entegrasyon yapabiliriz.
