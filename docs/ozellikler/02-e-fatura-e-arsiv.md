# 📄 E-Fatura / E-Arşiv Entegrasyonu

## Temel Prensip

**Ayrı Finans API'den fatura servisi alınacak.**
Mega POS sadece satış kaydeder, fatura Finans sisteminden gelir.

---

## 🇹🇷 TÜRKİYE E-FATURA MEVZUATI

### Yasal Çerçeve

```
┌─────────────────────────────────────────────────────────────────────┐
│  E-FATURA / E-ARŞİV SİSTEMİ                                         │
│                                                                      │
│  Gelir İdaresi Başkanlığı (GİB) Düzenlemesi                         │
│  ├── 509 Sıra No'lu VUK Genel Tebliği                              │
│  ├── E-Fatura: Kurumlar arası (B2B)                                │
│  └── E-Arşiv: Nihai tüketiciye (B2C)                               │
│                                                                      │
│  Zorunluluk:                                                        │
│  ├── Yıllık ciro > ₺5M → E-Fatura zorunlu                          │
│  ├── Yıllık ciro > ₺1M → E-Arşiv zorunlu                           │
│  └── Altında isteğe bağlı                                           │
│                                                                      │
│  Fatura Türleri:                                                    │
│  ├── E-Fatura: Kuruma satış (VKN ile)                              │
│  ├── E-Arşiv: Müşteriye satış (TCKN ile)                           │
│  └── Kağıt Fiş: Küçük tutarlar (<₺1,000)                           │
└─────────────────────────────────────────────────────────────────────┘
```

### E-Fatura vs E-Arşiv

| Özellik | E-Fatura | E-Arşiv |
|---------|----------|---------|
| **Alıcı** | Kurumlar (B2B) | Bireyler (B2C) |
| **Kimlik** | VKN (Vergi Kimlik No) | TCKN veya yok |
| **İletim** | GİB üzerinden | E-posta/SMS |
| **Onay** | Alıcı onayı gerekir | Gerekmez |
| **Kullanım** | Franchise, tedarikçi | Kafe müşterisi |

---

## 🏗️ FİNANS API MİMARİSİ

### Sistem Akışı

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FATURA AKIŞI                                      │
│                                                                      │
│  ┌─────────────┐                    ┌─────────────┐                 │
│  │  MEGA POS   │                    │  FİNANS API │                 │
│  │  (Satış)    │                    │  (Fatura)   │                 │
│  └──────┬──────┘                    └──────┬──────┘                 │
│         │                                  │                        │
│         │  1. Satış tamamlandı             │                        │
│         │     POST /api/sales              │                        │
│         │     {                            │                        │
│         │       orderId: "123",            │                        │
│         │       amount: 185.00,            │                        │
│         │       items: [...],              │                        │
│         │       customer: {                │                        │
│         │         name: "Ayşe",            │                        │
│         │         tckn: "12345678901",     │                        │
│         │         email: "ayse@mail.com"   │                        │
│         │       }                          │                        │
│         │     }                            │                        │
│         ├──────────────────────────────────▶                        │
│         │                                  │                        │
│         │                                  │  2. Fatura oluştur     │
│         │                                  │     (E-Arşiv)          │
│         │                                  │                        │
│         │  3. Fatura hazır                 │                        │
│         │     {                            │                        │
│         │       invoiceId: "FA2026000123", │                        │
│         │       invoiceUrl: "https://...", │                        │
│         │       ettn: "uuid...",           │                        │
│         │       status: "sent"             │                        │
│         │     }                            │                        │
│         │◀──────────────────────────────────                        │
│         │                                  │                        │
│         │  4. Müşteriye gönder             │                        │
│         │     - E-posta                    │                        │
│         │     - SMS                        │                        │
│         │     - QR kod                     │                        │
│         │                                  │                        │
│         │                                  │  5. GİB'e bildir       │
│         │                                  ├──────────────────────▶ │
│         │                                  │                    GİB │
└─────────────────────────────────────────────────────────────────────┘
```

### Finans API Endpoints

```typescript
// Finans API interface
interface FinansAPI {
  // E-Arşiv fatura oluştur (B2C)
  createEArchiveInvoice(data: {
    orderId: string;
    amount: number;
    items: InvoiceItem[];
    customer?: {
      name?: string;
      tckn?: string;
      email?: string;
      phone?: string;
    };
  }): Promise<Invoice>;
  
  // E-Fatura oluştur (B2B)
  createEInvoice(data: {
    orderId: string;
    amount: number;
    items: InvoiceItem[];
    company: {
      name: string;
      vkn: string;
      address: string;
    };
  }): Promise<Invoice>;
  
  // Fatura iptal
  cancelInvoice(invoiceId: string, reason: string): Promise<void>;
  
  // Fatura sorgula
  getInvoice(invoiceId: string): Promise<Invoice>;
  
  // Fatura PDF indir
  getInvoicePDF(invoiceId: string): Promise<Buffer>;
}
```

---

## 📋 KULLANIM SENARYOLARI

### Senaryo 1: Kafe Müşterisi (Fatura İstemiyor)

```
1. Müşteri ödeme yaptı (₺185)
2. Sistem otomatik fiş yazdırır
3. E-Arşiv fatura OLUŞTURULMaz
4. Sadece satış kaydı tutulur

Not: ₺1,000 altı için fatura zorunlu değil
```

### Senaryo 2: Müşteri Fatura İstedi

```
1. Müşteri: "Fatura istiyorum"
2. Kasa personeli:
   ├── [Fatura Kes] butonuna basar
   ├── TCKN sorar (opsiyonel)
   ├── E-posta/telefon sorar
   └── [Oluştur]

3. Finans API'ye istek gider
4. E-Arşiv fatura oluşturulur
5. Müşteriye e-posta/SMS gönderilir
6. QR kod ile de erişilebilir
```

### Senaryo 3: Kurumsal Müşteri (Franchise)

```
1. Franchise şubesi malzeme aldı
2. Satış tutarı: ₺15,000
3. Sistem otomatik algılar: "Kurumsal satış"
4. VKN bilgisi istenir
5. E-Fatura oluşturulur
6. GİB üzerinden gönderilir
7. Alıcı onaylar
```

### Senaryo 4: Nakit Ödeme + Fatura

```
1. Müşteri nakit ödedi
2. Fatura istedi
3. Sistem:
   ├── Nakit ödeme kaydedildi
   ├── Finans API'ye fatura isteği
   └── E-Arşiv oluşturuldu

4. Müşteri faturayı aldı
5. Vergi kaydı tamam
```

---

## 🔗 FİNANS API ENTEGRASYONU

### Mega POS Tarafı

```typescript
// services/invoice.service.ts
export class InvoiceService {
  private financeAPI: FinansAPI;
  
  constructor() {
    this.financeAPI = new FinansAPIClient({
      baseUrl: process.env.FINANCE_API_URL,
      apiKey: process.env.FINANCE_API_KEY
    });
  }
  
  async createInvoiceForOrder(orderId: string, customerInfo?: CustomerInfo) {
    // Sipariş bilgilerini al
    const order = await this.getOrder(orderId);
    
    // Fatura oluştur
    const invoice = await this.financeAPI.createEArchiveInvoice({
      orderId: order.id,
      amount: order.total,
      items: order.items.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        unitPrice: item.price,
        vatRate: 10, // KDV %10 (gıda)
        total: item.quantity * item.price
      })),
      customer: customerInfo
    });
    
    // Fatura bilgisini siparişe kaydet
    await this.updateOrder(orderId, {
      invoiceId: invoice.id,
      invoiceUrl: invoice.url,
      invoiceETTN: invoice.ettn
    });
    
    return invoice;
  }
}
```

### Finans API Tarafı (Ayrı Sistem)

```typescript
// Finans API implementation (başka proje)
export class FinansAPIServer {
  private gibConnector: GIBConnector;
  
  async createEArchiveInvoice(data: InvoiceRequest): Promise<Invoice> {
    // 1. Fatura numarası oluştur
    const invoiceNumber = await this.generateInvoiceNumber();
    
    // 2. XML oluştur (GİB formatı)
    const xml = this.buildInvoiceXML({
      ...data,
      invoiceNumber,
      date: new Date(),
      seller: await this.getCompanyInfo()
    });
    
    // 3. İmzala (e-imza)
    const signedXML = await this.signXML(xml);
    
    // 4. GİB'e gönder
    const gibResponse = await this.gibConnector.sendEArchive(signedXML);
    
    // 5. PDF oluştur
    const pdf = await this.generateInvoicePDF(data, invoiceNumber);
    
    // 6. Kaydet
    const invoice = await this.saveInvoice({
      id: invoiceNumber,
      ettn: gibResponse.ettn,
      xml: signedXML,
      pdf: pdf,
      status: 'sent'
    });
    
    // 7. Müşteriye gönder
    if (data.customer?.email) {
      await this.sendInvoiceEmail(data.customer.email, invoice);
    }
    
    return invoice;
  }
}
```

---

## 📊 FATURA TİPLERİ VE SENARYOLAR

| Durum | Tutar | Müşteri | Fatura Tipi | Zorunlu? |
|-------|-------|---------|-------------|----------|
| Kafe müşterisi | <₺1,000 | Birey | Fiş | Hayır |
| Kafe müşterisi | >₺1,000 | Birey | E-Arşiv | Evet |
| Müşteri istedi | Herhangi | Birey | E-Arşiv | Evet |
| Kurumsal | Herhangi | Kurum | E-Fatura | Evet |
| Franchise | Herhangi | Şube | E-Fatura | Evet |

---

## 💰 MALİYETLER

| Kalem | Maliyet | Açıklama |
|-------|---------|----------|
| **E-Fatura Entegratörü** | ₺500-2,000/ay | İzibiz, Foriba, Logo |
| **E-İmza** | ₺300-500/yıl | Kişi başı |
| **Finans API Geliştirme** | ₺50,000-100,000 | Tek seferlik |
| **Fatura başına** | ₺0.10-0.50 | İşlem ücreti |

---

**Sonuç:** Fatura sistemi ayrı Finans API'den gelecek. Mega POS sadece satış kaydeder ve API'yi çağırır.
