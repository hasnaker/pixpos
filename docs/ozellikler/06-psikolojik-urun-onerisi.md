# 🧠 Psikolojik Ürün Önerisi Sistemi

## Temel Prensip

**6 milyon APA makalesi + Psikolojik ölçekler = Kişiselleştirilmiş ürün önerisi.**
Müşteri "anket" doldurur, sistem psikolojik profiline göre ürün önerir.

---

## 🎯 SİSTEM GENEL BAKIŞ

### Nasıl Çalışır?

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PSİKOLOJİK ÖNERİ AKIŞI                           │
│                                                                      │
│  1. MÜŞTERİ QR MENÜYÜ AÇAR                                          │
│     └── "Sana özel öneri ister misin?" popup                        │
│                                                                      │
│  2. KISA ANKET (5-10 soru)                                          │
│     ├── "Bugün kendinizi nasıl hissediyorsunuz?"                   │
│     ├── "Tatlı mı tuzlu mu tercih edersiniz?"                      │
│     ├── "Enerjik mi sakin mi hissediyorsunuz?"                     │
│     ├── "Bütçeniz ne kadar?" (gizli soru)                          │
│     └── "Yalnız mısınız yoksa arkadaşlarınızla mı?"                │
│                                                                      │
│  3. PSİKOLOJİK ANALİZ (AI)                                          │
│     ├── Cevaplar → Psikolojik profil                               │
│     ├── Mood detection (mutlu, stresli, sakin)                     │
│     ├── Personality traits (ekstrovert, introvert)                 │
│     ├── Budget sensitivity                                          │
│     └── Social context (yalnız, grup)                              │
│                                                                      │
│  4. ÜRÜN ÖNERİSİ                                                    │
│     ├── AI modeli ürünleri skorlar                                  │
│     ├── Kafe'nin satış hedefi ile dengeler                         │
│     ├── Top 3 ürün önerilir                                         │
│     └── Açıklama: "Neden bu ürün?"                                  │
│                                                                      │
│  5. MÜŞTERİ SEÇİMİ                                                  │
│     ├── Önerilen ürünü seçer                                        │
│     ├── Veya kendi seçimini yapar                                   │
│     └── Feedback: "Öneri işe yaradı mı?"                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📚 PSİKOLOJİ ÇEKİRDEĞİ ENTEGRASYONU

### Mevcut Sistem (Clinisyn)

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLİNİSYN PSİKOLOJİ ÇEKİRDEĞİ                                       │
│                                                                      │
│  Veri:                                                              │
│  ├── 6 milyon APA makalesi                                          │
│  ├── Psikanalitik teori                                             │
│  ├── Psikodinamik yaklaşım                                          │
│  └── Şema terapi                                                    │
│                                                                      │
│  Kullanıcılar:                                                      │
│  └── Binlerce psikolog                                              │
│                                                                      │
│  Özellikler:                                                        │
│  ├── Kişilik analizi                                                │
│  ├── Mood tracking                                                  │
│  ├── Behavioral patterns                                            │
│  └── Predictive modeling                                            │
└─────────────────────────────────────────────────────────────────────┘
```

### Mega POS Entegrasyonu

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLİNİSYN API → MEGA POS                                            │
│                                                                      │
│  API Endpoint:                                                      │
│  POST https://api.clinisyn.com/v1/consumer-profile                 │
│                                                                      │
│  Request:                                                           │
│  {                                                                  │
│    "responses": [                                                   │
│      { "questionId": "mood", "answer": "happy" },                  │
│      { "questionId": "energy", "answer": "high" },                 │
│      { "questionId": "social", "answer": "alone" }                 │
│    ],                                                               │
│    "context": {                                                     │
│      "timeOfDay": "afternoon",                                      │
│      "weather": "sunny",                                            │
│      "location": "cafe"                                             │
│    }                                                                │
│  }                                                                  │
│                                                                      │
│  Response:                                                          │
│  {                                                                  │
│    "profile": {                                                     │
│      "mood": "positive",                                            │
│      "energyLevel": "high",                                         │
│      "socialContext": "solo",                                       │
│      "traits": ["extroverted", "adventurous"],                     │
│      "preferences": {                                               │
│        "sweetness": 0.7,  // 0-1 scale                             │
│        "richness": 0.6,                                             │
│        "novelty": 0.8,                                              │
│        "comfort": 0.3                                               │
│      }                                                              │
│    },                                                               │
│    "recommendations": [                                             │
│      {                                                              │
│        "reason": "Yüksek enerjiniz için...",                       │
│        "productTypes": ["energizing", "sweet", "novel"]            │
│      }                                                              │
│    ]                                                                │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📝 ANKET TASARIMI

### Örnek Sorular (Müşteri Anlamaz)

```typescript
// Psikolojik ölçek ama "anket" gibi görünür
const surveyQuestions = [
  {
    id: 'mood',
    text: 'Bugün kendinizi nasıl hissediyorsunuz?',
    type: 'emoji',
    options: [
      { emoji: '😊', value: 'happy', score: { positivity: 1 } },
      { emoji: '😐', value: 'neutral', score: { positivity: 0.5 } },
      { emoji: '😔', value: 'sad', score: { positivity: 0, comfort: 1 } },
      { emoji: '😤', value: 'stressed', score: { stress: 1, comfort: 1 } }
    ],
    // Gerçekte: Mood assessment scale
  },
  
  {
    id: 'energy',
    text: 'Enerji seviyeniz nasıl?',
    type: 'slider',
    min: 0,
    max: 10,
    labels: ['Yorgun', 'Enerjik'],
    // Gerçekte: Energy level assessment
  },
  
  {
    id: 'taste',
    text: 'Hangi lezzeti tercih edersiniz?',
    type: 'choice',
    options: [
      { text: 'Tatlı', value: 'sweet', score: { sweetness: 1 } },
      { text: 'Tuzlu', value: 'salty', score: { savory: 1 } },
      { text: 'Ekşi', value: 'sour', score: { novelty: 0.8 } },
      { text: 'Acı', value: 'bitter', score: { sophistication: 1 } }
    ],
    // Gerçekte: Taste preference profiling
  },
  
  {
    id: 'social',
    text: 'Bugün kimlerle vakit geçiriyorsunuz?',
    type: 'choice',
    options: [
      { text: 'Yalnızım', value: 'alone', score: { solo: 1 } },
      { text: 'Arkadaşlarımla', value: 'friends', score: { social: 1 } },
      { text: 'Ailemle', value: 'family', score: { comfort: 1 } },
      { text: 'İş toplantısı', value: 'business', score: { formal: 1 } }
    ],
    // Gerçekte: Social context assessment
  },
  
  {
    id: 'budget',
    text: 'Ne kadar harcamayı düşünüyorsunuz?',
    type: 'range',
    options: [
      { text: '₺50-100', value: 'low', score: { budget: 0.3 } },
      { text: '₺100-200', value: 'medium', score: { budget: 0.6 } },
      { text: '₺200+', value: 'high', score: { budget: 1 } }
    ],
    // Gerçekte: Budget sensitivity
  }
];
```

### UI Tasarımı

```
┌───────────────────────┐
│  Sana Özel Öneri 🎯   │
├───────────────────────┤
│                       │
│  Bugün kendinizi      │
│  nasıl hissediyorsunuz?│
│                       │
│  😊  😐  😔  😤       │
│  [Mutlu seçildi]      │
│                       │
│  ─────────────────    │
│  Soru 1/5             │
│                       │
│  [Sonraki]            │
│                       │
└───────────────────────┘

Sonuç Ekranı:
┌───────────────────────┐
│  Senin İçin Seçtik! ✨ │
├───────────────────────┤
│                       │
│  ┌─────────────────┐  │
│  │  📷 Belçika     │  │
│  │     Waffle      │  │
│  │                 │  │
│  │  ⭐ Önerilen    │  │
│  │                 │  │
│  │  "Enerjik ruh   │  │
│  │  haliniz için   │  │
│  │  mükemmel!"     │  │
│  │                 │  │
│  │  ₺120    [+]    │  │
│  └─────────────────┘  │
│                       │
│  Diğer öneriler:      │
│  • Latte ₺50          │
│  • Cheesecake ₺85     │
│                       │
└───────────────────────┘
```

---

## 🤖 AI ÖNERİ MODELİ

### Scoring Algorithm

```typescript
// Ürün skorlama
interface ProductScore {
  productId: string;
  baseScore: number;      // Psikolojik uyum (0-1)
  cafeBoost: number;      // Kafe'nin satış hedefi (0-0.3)
  finalScore: number;     // Toplam skor
  reason: string;         // Açıklama
}

async function scoreProducts(
  profile: PsychologicalProfile,
  products: Product[],
  cafePreferences: CafePreferences
): Promise<ProductScore[]> {
  const scores: ProductScore[] = [];
  
  for (const product of products) {
    // 1. Psikolojik uyum skoru
    let baseScore = 0;
    
    // Mood matching
    if (profile.mood === 'happy' && product.tags.includes('celebratory')) {
      baseScore += 0.3;
    }
    if (profile.mood === 'sad' && product.tags.includes('comfort')) {
      baseScore += 0.4;
    }
    
    // Energy matching
    if (profile.energyLevel > 0.7 && product.tags.includes('energizing')) {
      baseScore += 0.2;
    }
    if (profile.energyLevel < 0.3 && product.tags.includes('calming')) {
      baseScore += 0.2;
    }
    
    // Taste preference
    baseScore += profile.preferences.sweetness * product.attributes.sweetness;
    baseScore += profile.preferences.richness * product.attributes.richness;
    
    // Budget fit
    const priceRatio = product.price / profile.budget;
    if (priceRatio <= 1) {
      baseScore += 0.2;
    } else {
      baseScore -= 0.3 * (priceRatio - 1);
    }
    
    // 2. Kafe'nin satış hedefi
    let cafeBoost = 0;
    if (cafePreferences.pushProducts.includes(product.id)) {
      cafeBoost = 0.3; // %30 boost
    }
    if (product.stock < 10) {
      cafeBoost -= 0.2; // Stok azsa düşür
    }
    
    // 3. Final score
    const finalScore = Math.min(1, baseScore + cafeBoost);
    
    // 4. Açıklama oluştur
    const reason = generateReason(profile, product);
    
    scores.push({
      productId: product.id,
      baseScore,
      cafeBoost,
      finalScore,
      reason
    });
  }
  
  // En yüksek skorlu 3 ürün
  return scores.sort((a, b) => b.finalScore - a.finalScore).slice(0, 3);
}

function generateReason(profile: PsychologicalProfile, product: Product): string {
  const reasons = [];
  
  if (profile.mood === 'happy') {
    reasons.push('Mutlu ruh haliniz için');
  }
  if (profile.energyLevel > 0.7) {
    reasons.push('Yüksek enerjinizi desteklemek için');
  }
  if (profile.socialContext === 'alone') {
    reasons.push('Kendinize özel bir an için');
  }
  
  return reasons.join(', ') + ' mükemmel!';
}
```

---

## 🎛️ KAFE KONTROL PANELİ

### Satış Stratejisi Ayarları

```
┌─────────────────────────────────────────────────────────────────────┐
│  BOSS PANEL - PSİKOLOJİK ÖNERİ AYARLARI                            │
│                                                                      │
│  Bu Ay Satış Hedefi:                                                │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Ürün: Belçika Waffle                                       │    │
│  │  Hedef: 500 adet                                            │    │
│  │  Mevcut: 287 adet (57%)                                     │    │
│  │                                                             │    │
│  │  Öneri Sıklığı: ████████░░ 80%                             │    │
│  │  (Psikolojik uyum varsa %80 ihtimalle önerilir)            │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Diğer Ürünler:                                                     │
│  ├── Nutella Waffle: 60% öneri                                      │
│  ├── Cheesecake: 40% öneri                                          │
│  └── Latte: 50% öneri                                               │
│                                                                      │
│  Strateji:                                                          │
│  • Stok fazla olan ürünler → Yüksek öneri                          │
│  • Kar marjı yüksek → Orta öneri                                    │
│  • Yeni ürünler → Düşük öneri (test)                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 ANALİTİK VE RAPORLAMA

```
┌─────────────────────────────────────────────────────────────────────┐
│  PSİKOLOJİK ÖNERİ PERFORMANSI                                       │
│                                                                      │
│  Bu Hafta:                                                          │
│  ├── Anket tamamlama: 234 müşteri (78%)                            │
│  ├── Öneri kabul: 156 müşteri (67%)                                │
│  ├── Ortalama sepet: ₺215 (+18% normal'e göre)                     │
│  └── Müşteri memnuniyeti: 4.6/5                                     │
│                                                                      │
│  En Başarılı Profiller:                                             │
│  ├── Mutlu + Enerjik → %82 kabul                                    │
│  ├── Stresli + Yalnız → %71 kabul (comfort food)                   │
│  └── Grup + Kutlama → %89 kabul                                     │
│                                                                      │
│  Satış Etkisi:                                                      │
│  • Belçika Waffle: +45% satış                                       │
│  • Cheesecake: +32% satış                                           │
│  • Latte: +28% satış                                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 💰 MALİYET VE GELİR

| Kalem | Maliyet | Açıklama |
|-------|---------|----------|
| Clinisyn API | ₺500-1,000/ay | Psikoloji çekirdeği erişimi |
| AI Model | ₺200-500/ay | Bedrock Claude |
| Geliştirme | ₺50,000 | Tek seferlik |

**Gelir Artışı:**
- Ortalama sepet: +15-20%
- Hedef ürün satışı: +30-50%
- Müşteri memnuniyeti: +25%

---

**Sonuç:** Psikoloji çekirdeği ile kişiselleştirilmiş ürün önerisi. Müşteri "anket" doldurur, AI psikolojik profil çıkarır, kafe'nin satış hedefi ile dengeler.
