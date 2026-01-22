# Queen Waffle - Kurulum Kılavuzu

**Tarih:** 18 Ocak 2026

---

## 📦 Kurulum Dosyaları

| Uygulama | Dosya | Cihaz |
|----------|-------|-------|
| **POS Kasa** | `PIXPOS-Kasa-1.0.0-Setup.exe` | Windows PC / Kasa |
| **Garson Tablet** | `app-debug.apk` | Android Tablet |

---

## 💻 Windows POS Kurulumu

### Adımlar:
1. `PIXPOS-Kasa-1.0.0-Setup.exe` dosyasını çalıştır
2. Kurulum sihirbazını takip et
3. Masaüstündeki **PIXPOS Kasa** ikonuna tıkla
4. Uygulama açılacak ve otomatik olarak verileri çekecek

### İlk Açılışta:
- Menü, ürünler, fiyatlar → Otomatik yüklenir
- Masalar, bölgeler → Otomatik yüklenir
- Kullanıcılar → Otomatik yüklenir

### Giriş:
- PIN ile giriş yap (örn: 1234)
- Kullanıcı listesi API'den gelir

---

## 📱 Android Tablet (Garson) Kurulumu

### Adımlar:
1. `app-debug.apk` dosyasını tablete aktar (USB veya cloud)
2. Dosya yöneticisinden APK'ya tıkla
3. "Bilinmeyen kaynaklardan yüklemeye izin ver" uyarısı çıkarsa izin ver
4. Kurulumu tamamla
5. **Queen Waffle Garson** uygulamasını aç

### İlk Açılışta:
- WiFi bağlantısı gerekli
- Menü ve masalar otomatik yüklenir
- Sipariş almaya hazır

---

## 🌐 Ağ Gereksinimleri

| Servis | URL |
|--------|-----|
| API | `https://api.pixpos.cloud/api` |
| POS Web | `https://queen.pixpos.cloud/pos` |
| Garson Web | `https://queen.pixpos.cloud/waiter` |

**Önemli:** Tüm cihazlar internete bağlı olmalı.

---

## 🖨️ Yazıcı Ayarları (Önceden Yapılandırılmış)

| Yazıcı | IP | Port | Kullanım |
|--------|-----|------|----------|
| KASA | 192.168.1.106 | 9100 | Fiş yazıcısı |
| WAFFLE | 192.168.1.149 | 9100 | Mutfak yazıcısı |

---

## 💳 ÖKC Ayarları (Önceden Yapılandırılmış)

| Parametre | Değer |
|-----------|-------|
| IP | 192.168.1.116 |
| Port | 4100 |
| Terminal ID | QUEEN001 |

---

## ✅ Kurulum Sonrası Kontrol Listesi

- [ ] POS açılıyor mu?
- [ ] Menü ve ürünler görünüyor mu?
- [ ] Masalar görünüyor mu?
- [ ] Sipariş alınabiliyor mu?
- [ ] Mutfağa sipariş gidiyor mu?
- [ ] Fiş yazıcısı çalışıyor mu?
- [ ] ÖKC bağlantısı var mı?

---

## 🆘 Sorun Giderme

### "API'ye bağlanılamıyor" hatası
- İnternet bağlantısını kontrol et
- `https://api.pixpos.cloud/api/health` adresini tarayıcıda aç

### Menü boş görünüyor
- İnternet bağlantısını kontrol et
- Uygulamayı kapat/aç

### Yazıcı çalışmıyor
- Yazıcı IP adresini kontrol et
- Yazıcı ve kasa aynı ağda mı?

### ÖKC bağlanmıyor
- ÖKC IP adresini kontrol et
- ÖKC açık mı?

---

## 📞 Destek

Sorun yaşarsan: **PIXPOS Destek**

---

**Not:** Tüm veriler (menü, fiyat, masa, kullanıcı) bulutta saklanır. Uygulama sadece görüntüler. Değişiklik yapmak için POS Ayarları veya Boss Panel kullanılır.
