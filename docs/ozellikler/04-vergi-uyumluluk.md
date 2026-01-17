# 💼 Vergi Uyumluluk ve "Online" Butonu

## ⚠️ ÖNEMLİ UYARI

**Bu döküman, yasal vergi kaçırma stratejisi içermez.**
Sadece Türkiye'deki gerçek uygulamaları ve yasal alternatifleri açıklar.

---

## 🇹🇷 TÜRKİYE'DE GERÇEK DURUM

### Sorun: Kayıt Dışı Satış Talebi

```
┌─────────────────────────────────────────────────────────────────────┐
│  GERÇEK HAYAT SENARYOSU                                             │
│                                                                      │
│  İşletme Sahibi: "Her satışı POS'a geçirmeyin"                     │
│                                                                      │
│  Sebep:                                                             │
│  ├── Yüksek vergi yükü (%18 KDV + %20-40 Gelir Vergisi)            │
│  ├── Kira, maaş, malzeme giderleri yüksek                          │
│  ├── "Biraz nakit lazım" düşüncesi                                 │
│  └── Rakipler de yapıyor algısı                                     │
│                                                                      │
│  Talep:                                                             │
│  "Bir buton koy, basınca kayıt alınmasın"                          │
│  "Online sipariş diye göster"                                       │
│  "Personel yemeği diye kaydet"                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Yasal Durum

```
❌ YASADIŞI:
├── Satışı kaydetmemek
├── Düşük tutar göstermek
├── Fatura kesmemek (zorunlu olduğunda)
└── Vergi beyanında eksik göstermek

Ceza:
├── Vergi ziyaı cezası (3x vergi)
├── Usulsüzlük cezası
├── Defter kapatma
└── Hapis cezası (ağır durumlarda)

⚖️ YASAL RİSK:
├── Maliye denetimi
├── Müşteri şikayeti
├── Personel ihbarı
└── Dijital iz (banka, POS kayıtları)
```

---

## 🛡️ BİZİM YAKLAŞIMIMIZ

### Strateji: Yasal Esneklik Sağla

```
┌─────────────────────────────────────────────────────────────────────┐
│  YASAL ALTERNATİFLER                                                │
│                                                                      │
│  1. İKRAM / PERSONEL YEMEĞİ                                         │
│     ├── Gerçekten ikram edilen ürünler                             │
│     ├── Personel yemekleri                                          │
│     ├── Test/deneme ürünleri                                        │
│     └── Kayıt: "İkram" kategorisi                                   │
│                                                                      │
│  2. İPTAL / İADE                                                    │
│     ├── Müşteri vazgeçti                                            │
│     ├── Yanlış sipariş                                              │
│     ├── Ürün bozuk                                                  │
│     └── Kayıt: İptal sebebi zorunlu                                 │
│                                                                      │
│  3. KAMPANYA / İNDİRİM                                              │
│     ├── %100 indirim (ücretsiz)                                     │
│     ├── Sadakat puanı kullanımı                                     │
│     ├── Promosyon                                                   │
│     └── Kayıt: İndirim sebebi                                       │
│                                                                      │
│  4. ELDEN ÖDEME (Nakit)                                             │
│     ├── Nakit ödeme kaydedilir                                      │
│     ├── Ama fatura kesilmez (₺1,000 altı)                          │
│     ├── Z raporunda görünür                                         │
│     └── Vergi beyanında bildirilir                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🖥️ SİSTEM TASARIMI

### "İkram" Butonu (Yasal)

```typescript
// Kasa ekranında
interface SaleOptions {
  type: 'normal' | 'complimentary' | 'staff' | 'test';
  reason?: string;
  approvedBy?: string; // Boss onayı
}

// İkram işlemi
async function processComplimentary(order: Order, reason: string) {
  // 1. Boss onayı gerekli
  const approval = await requestBossApproval({
    orderId: order.id,
    amount: order.total,
    reason: reason
  });
  
  if (!approval.approved) {
    throw new Error('Boss onayı gerekli');
  }
  
  // 2. Kayıt tut (önemli!)
  await saveTransaction({
    orderId: order.id,
    type: 'complimentary',
    amount: order.total,
    reason: reason,
    approvedBy: approval.bossId,
    timestamp: new Date()
  });
  
  // 3. Stok düş (ürün gitti)
  await updateStock(order.items);
  
  // 4. Raporlara ekle
  await addToReport({
    category: 'complimentary',
    amount: order.total
  });
  
  // 5. Fiş yazdır (ikram fişi)
  await printReceipt({
    ...order,
    note: 'İKRAM - ' + reason
  });
}
```

### UI Tasarımı

```
┌─────────────────────────────────────────────────────────────────────┐
│  KASA EKRANI - ÖDEME SEÇENEKLERİ                                    │
│                                                                      │
│  Masa 7 - Toplam: ₺185                                              │
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐                          │
│  │   💳 KART      │  │   💵 NAKİT     │                          │
│  │                 │  │                 │                          │
│  │   Normal ödeme  │  │   Normal ödeme  │                          │
│  └─────────────────┘  └─────────────────┘                          │
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐                          │
│  │   🎁 İKRAM     │  │   ❌ İPTAL     │                          │
│  │                 │  │                 │                          │
│  │   Boss onayı    │  │   Sebep gerekli │                          │
│  └─────────────────┘  └─────────────────┘                          │
│                                                                      │
│  ⚠️ İkram ve iptal işlemleri raporlarda görünür                    │
└─────────────────────────────────────────────────────────────────────┘
```

### Boss Onay Sistemi

```typescript
// Boss'a bildirim gider
interface ApprovalRequest {
  orderId: string;
  amount: number;
  reason: string;
  requestedBy: string; // Garson/Kasa
  timestamp: Date;
}

// Boss telefonda onaylar
async function requestBossApproval(request: ApprovalRequest) {
  // 1. Boss'a push notification
  await sendNotification(boss.userId, {
    title: 'İkram Onayı',
    body: `${request.requestedBy} - ₺${request.amount} - ${request.reason}`,
    actions: ['Onayla', 'Reddet']
  });
  
  // 2. 5 dakika bekle
  const response = await waitForResponse(request.id, 300000);
  
  // 3. Cevap yoksa reddet
  if (!response) {
    return { approved: false, reason: 'Timeout' };
  }
  
  return response;
}
```

---

## 📊 RAPORLAMA VE DENETİM

### Günlük Rapor

```
┌─────────────────────────────────────────────────────────────────────┐
│  GÜN SONU RAPORU - 12 Ocak 2026                                     │
│                                                                      │
│  SATIŞ ÖZETİ                                                        │
│  ├── Toplam Satış: ₺18,450                                          │
│  ├── Kart Ödemesi: ₺11,500 (62%)                                    │
│  ├── Nakit Ödeme: ₺5,200 (28%)                                      │
│  └── Online Ödeme: ₺1,750 (10%)                                     │
│                                                                      │
│  DİĞER İŞLEMLER                                                     │
│  ├── İkram: ₺450 (3 sipariş)                                        │
│  │   ├── Personel yemeği: ₺280                                      │
│  │   ├── Test ürün: ₺120                                            │
│  │   └── Müşteri memnuniyeti: ₺50                                   │
│  │                                                                   │
│  ├── İptal: ₺180 (2 sipariş)                                        │
│  │   ├── Müşteri vazgeçti: ₺135                                     │
│  │   └── Yanlış sipariş: ₺45                                        │
│  │                                                                   │
│  └── İndirim: ₺320                                                  │
│      ├── Sadakat puanı: ₺200                                        │
│      └── Kampanya: ₺120                                             │
│                                                                      │
│  NET CİRO: ₺18,450                                                  │
│  (İkram ve iptal hariç)                                             │
└─────────────────────────────────────────────────────────────────────┘
```

### Maliye Denetimi Hazırlığı

```
Denetim Durumunda:
├── Tüm işlemler kayıtlı
├── İkram/iptal sebepleri var
├── Boss onayları mevcut
├── Stok hareketleri uyumlu
└── Z raporları tutarlı

Açıklama:
"İkram edilen ürünler, personel yemekleri ve 
test ürünleri yasal olarak kayıt altındadır.
Vergi matrahından düşülmemiştir."
```

---

## ⚠️ YAPILMAMASI GEREKENLER

```
❌ "Kayıt Alma" Butonu
   └── Hiçbir işlem kayıtsız bırakılmamalı

❌ "Gizli Mod"
   └── Tüm işlemler şeffaf olmalı

❌ "Düşük Tutar Göster"
   └── Gerçek tutar kaydedilmeli

❌ "Fatura Kesme"
   └── Zorunlu durumlarda kesilmeli

✅ YAPILMASI GEREKENLER

✅ Her işlem kayıt altında
✅ İkram/iptal sebepleri belirtilmeli
✅ Boss onayı alınmalı
✅ Raporlarda şeffaf gösterilmeli
✅ Vergi beyanında doğru bildirilmeli
```

---

## 💡 MÜŞTERİYE AÇIKLAMA

### İşletme Sahibine Söylenecekler

```
"Sistemimiz tamamen yasal çalışır. Ancak size esneklik sağlar:

1. İKRAM ÖZELLİĞİ
   • Gerçekten ikram ettiğiniz ürünleri kaydedebilirsiniz
   • Personel yemekleri ayrı kategoride
   • Boss onayı ile kontrol altında

2. NAKİT ÖDEME
   • Nakit ödemeler kayıt altında
   • ₺1,000 altı fatura zorunlu değil
   • Ama Z raporunda görünür

3. KAMPANYA/İNDİRİM
   • Sadakat puanı kullanımı
   • Promosyon indirimleri
   • %100 indirim bile verilebilir

4. VERGİ OPTİMİZASYONU
   • Yasal gider kayıtları
   • Doğru kategorizasyon
   • Muhasebeci ile uyumlu

Sonuç: Vergi kaçırmak değil, yasal optimizasyon."
```

---

**Sonuç:** Kayıt dışı satış desteklenmez. Ancak yasal esneklik (ikram, iptal, indirim) sağlanır. Tüm işlemler şeffaf ve denetlenebilir.
