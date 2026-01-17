# PIXPOS Scale - Departman Dökümanları

Square iş modelinin departmanlara göre ayrılmış dökümanları.

---

## 📁 Klasör Yapısı

```
departmanlar/
├── yazilim/           # Backend, Frontend, Mobile, DevOps
│   └── OZELLIKLER.md  # Özellik listesi, API, teknik spec
├── uiux/              # Tasarım, UX patternleri, Figma specs
│   └── EKRANLAR.md    # Ekran listesi, UX patternleri
├── grafik/            # Logo, branding, görseller
│   └── MATERYALLER.md # Görsel materyal listesi
├── satin-alma/        # Donanım, tedarik, fiyatlandırma
│   └── DONANIM.md     # Donanım stratejisi
├── pazarlama/         # Kampanyalar, referral, growth
│   └── STRATEJILER.md # Pazarlama stratejileri
├── operasyon/         # Onboarding, destek, eğitim
│   └── DESTEK.md      # Destek ve eğitim planı
└── yasal/             # KVKK, sözleşmeler, uyumluluk
    └── UYUMLULUK.md   # Yasal gereksinimler
```

---

## 🎯 Her Departman Ne Yapacak?

| Departman | Sorumluluk | Öncelik | Dosya |
|-----------|------------|---------|-------|
| Yazılım | Özellik geliştirme, API, entegrasyonlar | 🔴 Kritik | OZELLIKLER.md |
| UI/UX | Ekran tasarımları, kullanıcı akışları | 🔴 Kritik | EKRANLAR.md |
| Grafik | Logo, ikon, görsel materyaller | 🟡 Orta | MATERYALLER.md |
| Satın Alma | Donanım tedarik, fiyat araştırma | 🟡 Orta | DONANIM.md |
| Pazarlama | Kampanya, referral, içerik | 🟢 Sonra | STRATEJILER.md |
| Operasyon | Müşteri destek, eğitim | 🟢 Sonra | DESTEK.md |
| Yasal | Sözleşmeler, KVKK | 🟡 Orta | UYUMLULUK.md |

---

## 📋 Kullanım

Her departman kendi klasöründeki dökümanları takip eder:

1. **Yazılım ekibi** → `yazilim/OZELLIKLER.md`
2. **Tasarımcılar** → `uiux/EKRANLAR.md`
3. **Grafiker** → `grafik/MATERYALLER.md`
4. **Satın alma** → `satin-alma/DONANIM.md`
5. **Pazarlama** → `pazarlama/STRATEJILER.md`
6. **Operasyon** → `operasyon/DESTEK.md`
7. **Yasal** → `yasal/UYUMLULUK.md`

---

## 🔗 İlgili Dökümanlar

Ana dökümanlar (`pixpos-scale/` klasöründe):
- `01-sektorler.md` - Sektör ve alt kategoriler
- `02-square-urunler.md` - Ürün ekosistemi
- `03-square-hardware.md` - Donanım ürünleri
- `04-square-mobile-apps.md` - Mobil uygulama analizi
- `05-square-web-dashboard.md` - Web dashboard analizi
- `06-square-insights.md` - Stratejik içgörüler
- `08-onboarding.md` - Onboarding akışı
- `10-settings-receipts.md` - Fiş ayarları
- `11-branding.md` - Marka ayarları
- `12-settings-taxes.md` - Vergi ayarları
- `13-settings-locations.md` - Lokasyon yönetimi

---

**Son Güncelleme:** 17 Ocak 2026
