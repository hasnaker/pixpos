# PIXPOS - Hata ve Eksikler Listesi

> Son Güncelleme: 14 Ocak 2026
> Öncelik: 🔴 Kritik | 🟡 Önemli | 🟢 İyileştirme

---

## 🔴 KRİTİK HATALAR

### Garson Tablet (localhost:3004)

- [x] **Kartlar üst üste biniyor**
  - Masa kartları düzgün görünmüyor
  - Çözüm: Tamamen yeniden tasarlandı ✅

- [x] **LoginScreen tasarımı**
  - Yeniden tasarlandı - inline styles ✅

- [x] **OrderScreen tasarımı**
  - Sol panel menü, sağ panel sepet
  - Modern gradient tasarım ✅

- [x] **TableList tasarımı**
  - Sidebar + grid layout
  - Microsoft + Apple tarzı ✅

### Mutfak Ekranı (localhost:3005)

- [x] **Sipariş görünmüyor**
  - Tüm siparişler "ready" durumunda
  - Çözüm: Kitchen API'ye `preparing` durumu eklendi ✅
  - Kitchen servisi artık `kitchen` ve `preparing` durumlarını getiriyor ✅
  - `preparing` endpoint eklendi ✅

### QR Menü (localhost:3006)

- [x] **Masaya özel QR kaldırılacak**
  - Şuan masa bazlı çalışıyor
  - Hedef: Genel menü, masa bağımsız ✅
  - İleride: Masaya özel sipariş (v2)

### POS Uygulaması (localhost:3003)

- [x] **OrderScreen.tsx:740 - unitPrice.toFixed hatası**
  - Hata: `item.unitPrice.toFixed is not a function`
  - Sebep: unitPrice string veya undefined geliyor
  - Çözüm: Type check ekle ✅

- [ ] **Aktif masa sayısı tutarsız**
  - LockScreen'de 8 diyor, POS'ta 5 masa yanıp sönüyor
  - Sebep: Farklı status kontrolleri
  - Çözüm: Status mantığını birleştir

- [ ] **Toplam tutar hesabı yanlış**
  - Sağ paneldeki toplam yanlış hesaplanıyor
  - Çözüm: Hesaplama mantığını düzelt

- [ ] **WebSocket bağlantı sorunları**
  - Sürekli connect/disconnect döngüsü
  - Çözüm: Reconnection stratejisini düzelt

### Boss Panel (localhost:3002)

- [ ] **Ürün resmi yükleme 400 hatası**
  - `POST /api/products/{id}/image 400 Bad Request`
  - Çözüm: API endpoint'i kontrol et, multer config

- [ ] **Ürün CRUD çalışmıyor**
  - Ekleme, silme, düzenleme işlemleri başarısız
  - Çözüm: API bağlantılarını kontrol et

- [ ] **Raporlar sayfası açılmıyor**
  - Sadece boss görüyor, diğerleri görmüyor
  - Çözüm: Yetkilendirme ve routing kontrol

---

## 🟡 TASARIM SORUNLARI

### POS Uygulaması

- [ ] **Masa ekranı tasarımı kötü**
  - Beyaz ton, sıkıcı görünüm
  - Hedef: Microsoft Fluent + Apple tarzı, modern, yenilikçi
  - Çözüm: Tamamen yeniden tasarla

- [ ] **Sol sidebar emojiler**
  - Emojiler kurumsal görünümü bozuyor
  - Çözüm: Lucide ikonları kullan, yazı ekle
  - Ayarlardan yönetilebilir olmalı

- [ ] **Sol alt butonlar karışık**
  - Şimşek ikonu çıkışa atıyor (yanlış)
  - Ayar butonu tek ayar gösteriyor
  - Çıkış butonu yok
  - Çözüm: Butonları düzelt, işlevleri ayır

### Boss Panel

- [ ] **Genel tasarım rezalet**
  - Modal tasarımları kötü
  - Panel tasarımı eski
  - Hedef: Microsoft + Apple tarzı modern tasarım
  - Çözüm: Tüm UI'ı yeniden tasarla

- [ ] **Ayarlar sayfası yetersiz**
  - Sadece 1 ayar var
  - Hedef: A'dan Z'ye tüm ayarlar yönetilebilmeli
  - Çözüm: Kapsamlı ayarlar sayfası

---

## 🟡 FONKSİYONEL EKSİKLER

### Kullanıcı Yönetimi

- [ ] **Kullanıcılar mock data**
  - Gerçek veritabanı bağlantısı yok
  - Çözüm: User entity, CRUD API, Boss Panel UI

- [ ] **PIN şifreleme yok**
  - PIN'ler plain text
  - Çözüm: bcrypt ile hash

- [ ] **Rol bazlı yetkilendirme eksik**
  - Çözüm: Guard'lar ve permission sistemi

### Bağlantı Durumları

- [ ] **Yazıcı bağlantısı mock**
  - Yeşil yanıyor ama gerçek değil
  - Çözüm: Gerçek USB yazıcı entegrasyonu

- [ ] **Sunucu bağlantısı mock**
  - Gerçek health check yok
  - Çözüm: API health endpoint

- [ ] **POS bağlantısı mock**
  - Gerçek durum kontrolü yok
  - Çözüm: WebSocket status

### Diğer

- [ ] **Canlı Destek çalışmıyor**
  - Tıklanınca bir şey olmuyor
  - Çözüm: Intercom/Crisp entegrasyonu veya kaldır

- [ ] **Raporlar yanlış geliyor**
  - Veriler tutarsız
  - Çözüm: Rapor sorgularını düzelt

---

## 🟢 YAZICI ENTEGRASYONU

- [x] **Ağ Yazıcısı Desteği (TCP/IP)**
  - ESC/POS komutları hazır ✅
  - TCP bağlantısı çalışıyor ✅
  - Print queue sistemi var ✅
  - Retry mekanizması var ✅

- [x] **Otomatik Yazdırma**
  - Sipariş mutfağa gönderilince → Mutfak fişi ✅
  - Ödeme alınca → Müşteri fişi ✅
  - AutoPrintService aktif ✅

- [ ] **Yazıcı Ayarları UI**
  - Boss Panel'de yazıcı yönetimi ekranı
  - IP adresi, port ayarları
  - Test yazdırma butonu

---

## 🟢 AYARLAR SAYFASI GEREKSİNİMLERİ

### Genel Ayarlar
- [ ] İşletme bilgileri (ad, adres, telefon, logo)
- [ ] Vergi ayarları (KDV oranları)
- [ ] Para birimi
- [ ] Dil seçimi

### POS Ayarları
- [ ] Masa düzeni yönetimi
- [ ] Kategori sıralaması
- [ ] Hızlı satış butonları
- [ ] Sidebar ikonları (emoji/ikon seçimi)

### Yazıcı Ayarları
- [ ] Yazıcı listesi ve seçimi
- [ ] Fiş şablonu düzenleme
- [ ] Test yazdırma
- [ ] Otomatik yazdırma kuralları

### Kullanıcı Ayarları
- [ ] Kullanıcı listesi
- [ ] Rol yönetimi
- [ ] PIN değiştirme
- [ ] Yetki ataması

### Entegrasyon Ayarları
- [ ] Ödeme sistemleri (iyzico, param)
- [ ] E-fatura entegrasyonu
- [ ] Muhasebe entegrasyonu

### Sistem Ayarları
- [ ] Yedekleme
- [ ] Log görüntüleme
- [ ] Performans izleme

---

## 📋 ÖNCELİK SIRASI

1. **Kritik hataları düzelt** (unitPrice, WebSocket, CRUD)
2. **POS masa ekranı tasarımı** (Apple tarzı)
3. **Boss Panel tasarımı** (Microsoft + Apple)
4. **Kullanıcı yönetimi** (veritabanı)
5. **Ayarlar sayfası** (kapsamlı)
6. **Yazıcı entegrasyonu** (USB)
7. **Raporlar düzeltme**
8. **AWS Deploy**

---

## 🚀 AWS DEPLOY

- [ ] RDS PostgreSQL
- [ ] ECS/Fargate veya EC2
- [ ] S3 (resimler)
- [ ] CloudFront (CDN)
- [ ] Route53 (domain)
- [ ] SSL sertifikası

---

## NOTLAR

- Veritabanı bağlantısı mevcut (TypeORM + PostgreSQL)
- Temel entity'ler var (tables, products, categories, orders)
- User entity eksik
- Mock data'lar gerçek verilerle değiştirilmeli
