# POS Tasarım Felsefesi

## İlham Kaynakları

**YAPILMAYACAKLAR (Anti-patterns):**
- ❌ Menulux, Adisyo renk paleti (pembe, mor, turuncu karışımı)
- ❌ Parlak, göz yoran renkler
- ❌ Düz, sıkıcı kartlar
- ❌ Cheap gradientler
- ❌ Karmaşık, anlaşılmaz ikonlar

**ALINACAK YAPISAL ÖĞELER (Menulux'tan):**
- ✅ Sol sidebar (hızlı aksiyonlar)
- ✅ Ortada masa grid
- ✅ Sağda kat/bölüm seçimi
- ✅ Sol üstte açık adisyon listesi
- ✅ Masa kartlarında: isim, tutar, süre, garson

**İLHAM KAYNAKLARI (Görsel):**
- ✅ Apple macOS Tahoe Dark Mode
- ✅ Apple Vision Pro UI (glassmorphism)
- ✅ Tesla Model S dashboard
- ✅ Porsche Taycan infotainment
- ✅ Bang & Olufsen app

---

## Tasarım Prensipleri

### 1. Premium Dark Mode
- Koyu arka plan (#0A0A0A - #1C1C1E)
- Glassmorphism kartlar (blur + transparency)
- Subtle glow efektleri
- Depth through shadows and layers

### 2. Renk Paleti (Apple Dark Mode)
```
Arka Plan:    #0A0A0A (Saf siyah) - Ana zemin
Surface 1:    #1C1C1E (Elevated) - Kartlar
Surface 2:    #2C2C2E (Elevated 2) - Hover states
Surface 3:    #3A3A3C (Elevated 3) - Active states

Glass:        rgba(255,255,255,0.08) - Cam efekti
Glass Border: rgba(255,255,255,0.1) - Cam kenar

Metin:        #FFFFFF (Primary)
Metin 2:      rgba(255,255,255,0.7) (Secondary)
Metin 3:      rgba(255,255,255,0.4) (Tertiary)

Accent:       #0A84FF (System Blue) - Seçili, aktif
Success:      #30D158 (System Green) - Hazır, onay
Warning:      #FF9F0A (System Orange) - Bekliyor
Danger:       #FF453A (System Red) - Hata, iptal
```

### 3. Tipografi Hiyerarşisi
- Tek font ailesi: SF Pro veya DM Sans
- Boyut ile hiyerarşi, renk ile değil
- Büyük rakamlar (fiyatlar) dikkat çeker
- Küçük etiketler gri tonlarında

### 4. Touch-First Tasarım
- Minimum dokunma hedefi: 48x48px
- Butonlar arası minimum boşluk: 12px
- Tek elle kullanılabilir yerleşim
- Sık kullanılanlar kolay erişimde

### 5. Bilgi Mimarisi
- Bir bakışta anlaşılır
- Progresif açıklama (detay gerektiğinde)
- Bağlamsal aksiyonlar (hover/focus'ta)
- Tutarlı yerleşim (her ekranda aynı mantık)

---

## Görsel Dil (Dark Mode + Glassmorphism)

### Glass Kartlar
```css
background: rgba(255, 255, 255, 0.06);
backdrop-filter: blur(40px) saturate(150%);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 16px;
```

### Butonlar
```css
/* Birincil (Accent) */
background: #0A84FF;
color: #FFFFFF;
border-radius: 12px;
font-weight: 500;
box-shadow: 0 0 20px rgba(10, 132, 255, 0.3);

/* İkincil (Glass) */
background: rgba(255, 255, 255, 0.08);
border: 1px solid rgba(255, 255, 255, 0.1);
color: #FFFFFF;
border-radius: 12px;

/* Success */
background: #30D158;
box-shadow: 0 0 20px rgba(48, 209, 88, 0.3);
```

### Masa Kartları
```css
/* Boş masa */
background: rgba(255, 255, 255, 0.08);
border: 1px solid rgba(255, 255, 255, 0.1);

/* Dolu masa */
background: rgba(48, 209, 88, 0.1);
border: 1px solid rgba(48, 209, 88, 0.3);

/* Mutfakta */
background: rgba(255, 159, 10, 0.15);
border: 1px solid rgba(255, 159, 10, 0.4);

/* Hazır */
background: rgba(10, 132, 255, 0.15);
border: 1px solid rgba(10, 132, 255, 0.4);
box-shadow: 0 0 20px rgba(10, 132, 255, 0.2);
```

### Sidebar
```css
background: rgba(28, 28, 30, 0.8);
backdrop-filter: blur(30px) saturate(180%);
border-right: 1px solid rgba(255, 255, 255, 0.06);
```

---

## Layout Prensipleri

### Ana Ekran (Masa Planı)
```
┌────────────────────────────────────────────────────────────────────┐
│  [Logo]                                    [Saat] [Kullanıcı] [⚙]  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│     ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐         │
│     │  1  │  │  2  │  │  3  │  │  4  │  │  5  │  │  6  │         │
│     │     │  │ 23' │  │₺205 │  │     │  │ 45' │  │     │         │
│     └─────┘  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘         │
│                                                                    │
│     ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐         │
│     │  7  │  │  8  │  │  9  │  │ 10  │  │ 11  │  │ 12  │         │
│     └─────┘  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘         │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  [Salon]  [Teras]  [Bahçe]                          [+ Yeni Masa]  │
└────────────────────────────────────────────────────────────────────┘
```

### Sipariş Ekranı
```
┌──────────────────────────────────────┬─────────────────────────────┐
│  ← Masa 3                            │                             │
├──────────────────────────────────────┤      SİPARİŞ                │
│                                      │                             │
│  [Kahveler] [Tatlılar] [Yiyecekler]  │      2× Latte        ₺120  │
│                                      │      1× Cheesecake    ₺85  │
│  ┌────────────┐  ┌────────────┐      │      ──────────────────    │
│  │            │  │            │      │                             │
│  │   Latte    │  │   Mocha    │      │      Toplam          ₺205  │
│  │    ₺60     │  │    ₺65     │      │                             │
│  └────────────┘  └────────────┘      │                             │
│                                      │                             │
│  ┌────────────┐  ┌────────────┐      │  ┌─────────────────────┐   │
│  │            │  │            │      │  │   Mutfağa Gönder    │   │
│  │ Americano  │  │  Espresso  │      │  └─────────────────────┘   │
│  │    ₺55     │  │    ₺45     │      │                             │
│  └────────────┘  └────────────┘      │  ┌─────────────────────┐   │
│                                      │  │      Ödeme Al       │   │
│                                      │  └─────────────────────┘   │
└──────────────────────────────────────┴─────────────────────────────┘
```

### Ödeme Ekranı
```
┌────────────────────────────────────────────────────────────────────┐
│  ← Geri                                                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│                         Masa 3                                     │
│                                                                    │
│                    ┌─────────────────┐                             │
│                    │                 │                             │
│                    │     ₺205        │                             │
│                    │                 │                             │
│                    │   2× Latte      │                             │
│                    │   1× Cheesecake │                             │
│                    │                 │                             │
│                    └─────────────────┘                             │
│                                                                    │
│     ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                   │
│     │  Böl   │ │ İkram  │ │İndirim │ │  Taşı  │                   │
│     └────────┘ └────────┘ └────────┘ └────────┘                   │
│                                                                    │
│     ┌─────────────────────┐  ┌─────────────────────┐              │
│     │       Nakit         │  │        Kart         │              │
│     └─────────────────────┘  └─────────────────────┘              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Animasyonlar

- Geçişler: 200ms ease-out
- Hover: scale(1.02) veya background değişimi
- Modal: fade + slide up
- Sayfa geçişi: crossfade
- Yükleme: skeleton veya subtle pulse

---

## Ses ve Geri Bildirim

- Yeni sipariş: Hafif "ding" sesi
- Hata: Kısa vibrasyon (mobil)
- Başarı: Görsel onay (checkmark animasyonu)
- Buton tıklama: Hafif scale animasyonu

---

## Erişilebilirlik

- Kontrast oranı minimum 4.5:1
- Focus göstergeleri net
- Büyük yazı tipi seçeneği
- Yüksek kontrast modu (opsiyonel)
