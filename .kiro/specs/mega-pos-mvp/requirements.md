# MEGA POS MVP - Gereksinim Dokümanı
## Hızlı Test - Minimum Çalışan Sistem

---

## Giriş

Hedef: PC, tablet ve yazıcı ile hemen test edilebilir çalışan sistem.

**Test Cihazları:**
- PC (Satış ekranı)
- PC/Tablet (Boss ekranı - yönetim)
- Tablet (Garson sipariş)
- Yazıcı (Mutfak sipariş kağıdı + Fiş)

---

## Sözlük

- **Satış_Ekranı**: PC'deki ana sipariş ve ödeme ekranı
- **Boss_Ekranı**: Yönetim paneli (ürün ekleme, rapor, ayarlar)
- **Garson_Tableti**: Garsonun sipariş aldığı tablet
- **Mutfak_Sistemi**: Mutfak ekranı + yazıcı (sipariş kağıdı)
- **QR_Menü**: Müşterinin telefonundan eriştiği menü
- **Sipariş_Kağıdı**: Mutfak yazıcısından çıkan sipariş fişi

---

## Gereksinimler

### Gereksinim 1: Satış Ekranı (PC)

**Kullanıcı Hikayesi:** Bir kasiyer olarak, PC'den sipariş alıp, düzenleyip, ödeme almak istiyorum.

#### Kabul Kriterleri

1. WHEN uygulama açıldığında, THE Satış_Ekranı SHALL masa listesini göstermeli
2. WHEN masaya tıklandığında, THE Satış_Ekranı SHALL sipariş ekranını açmalı
3. WHEN ürüne tıklandığında, THE Satış_Ekranı SHALL ürünü sepete eklemeli
4. THE Satış_Ekranı SHALL kategori bazlı ürün listesi göstermeli
5. WHEN sipariş kaydedildiğinde, THE Satış_Ekranı SHALL mutfağa sipariş göndermeli ve sipariş kağıdı çıkarmalı
6. WHEN ödeme butonuna basıldığında, THE Satış_Ekranı SHALL ödeme al ve masayı kapatmalı

---

### Gereksinim 2: Sipariş Düzenleme İşlemleri

**Kullanıcı Hikayesi:** Bir kasiyer olarak, siparişi düzenlemek, bölmek, masalar arası aktarmak istiyorum.

#### Kabul Kriterleri

1. WHEN sipariş açıkken, THE Satış_Ekranı SHALL ürün ekleme/çıkarma yapabilmeli
2. WHEN ürün miktarı değiştirildiğinde, THE Satış_Ekranı SHALL miktarı güncellemeli
3. THE Satış_Ekranı SHALL sipariş bölme (split) yapabilmeli
4. WHEN sipariş bölündüğünde, THE Satış_Ekranı SHALL seçilen ürünleri ayrı hesaba ayırmalı
5. THE Satış_Ekranı SHALL masa aktarma yapabilmeli
6. WHEN masa aktarıldığında, THE Satış_Ekranı SHALL siparişi yeni masaya taşımalı
7. THE Satış_Ekranı SHALL masa birleştirme yapabilmeli
8. WHEN masalar birleştirildiğinde, THE Satış_Ekranı SHALL siparişleri tek hesapta toplamalı
9. THE Satış_Ekranı SHALL sipariş iptal edebilmeli
10. WHEN ürün silindiğinde, THE Satış_Ekranı SHALL silme nedeni sorabilmeli (opsiyonel)

---

### Gereksinim 3: Garson Sipariş Ekranı (Tablet)

**Kullanıcı Hikayesi:** Bir garson olarak, tabletten masa seçip sipariş almak istiyorum.

#### Kabul Kriterleri

1. WHEN garson uygulamayı açtığında, THE Garson_Tableti SHALL masa listesini göstermeli
2. WHEN masaya dokunulduğunda, THE Garson_Tableti SHALL sipariş ekranını açmalı
3. WHEN ürüne dokunulduğunda, THE Garson_Tableti SHALL ürünü sepete eklemeli
4. THE Garson_Tableti SHALL sipariş notu eklemeye izin vermeli
5. WHEN gönder butonuna basıldığında, THE Garson_Tableti SHALL siparişi mutfağa göndermeli
6. WHEN sipariş gönderildiğinde, THE Satış_Ekranı SHALL siparişi görmeli
7. WHEN sipariş gönderildiğinde, THE Mutfak_Sistemi SHALL sipariş kağıdı çıkarmalı

---

### Gereksinim 4: Mutfak Sistemi (Ekran + Yazıcı)

**Kullanıcı Hikayesi:** Bir aşçı olarak, siparişleri ekranda görmek ve yazıcıdan sipariş kağıdı almak istiyorum.

#### Kabul Kriterleri

1. WHEN yeni sipariş geldiğinde, THE Mutfak_Sistemi SHALL siparişi ekranda göstermeli
2. WHEN yeni sipariş geldiğinde, THE Mutfak_Sistemi SHALL yazıcıdan sipariş kağıdı çıkarmalı
3. THE Sipariş_Kağıdı SHALL masa numarası göstermeli
4. THE Sipariş_Kağıdı SHALL sipariş saati göstermeli
5. THE Sipariş_Kağıdı SHALL ürün listesi ve miktarları göstermeli
6. THE Sipariş_Kağıdı SHALL sipariş notlarını göstermeli
7. WHEN aşçı hazır butonuna bastığında, THE Mutfak_Sistemi SHALL siparişi tamamlandı olarak işaretlemeli
8. THE Mutfak_Sistemi SHALL sesli bildirim vermeli
9. THE Mutfak_Sistemi SHALL bekleme süresine göre renk değiştirmeli

---

### Gereksinim 5: QR Menü

**Kullanıcı Hikayesi:** Bir müşteri olarak, telefonumdan QR okutup menüyü görmek istiyorum.

#### Kabul Kriterleri

1. WHEN QR kod okutulduğunda, THE QR_Menü SHALL menüyü tarayıcıda açmalı
2. THE QR_Menü SHALL kategorileri ve ürünleri listelemeli
3. THE QR_Menü SHALL ürün fiyatlarını göstermeli
4. THE QR_Menü SHALL ürün görsellerini göstermeli
5. THE QR_Menü SHALL garson çağırma butonu sunmalı
6. WHEN garson çağırıldığında, THE Satış_Ekranı SHALL bildirim göstermeli

---

### Gereksinim 6: Boss Ekranı - Ürün Yönetimi

**Kullanıcı Hikayesi:** Bir yönetici (boss) olarak, ürün ve kategori eklemek/düzenlemek istiyorum.

#### Kabul Kriterleri

1. THE Boss_Ekranı SHALL ürün listesi göstermeli
2. THE Boss_Ekranı SHALL yeni ürün ekleme formu sunmalı
3. THE Boss_Ekranı SHALL ürün adı, fiyat, kategori girişi almalı
4. THE Boss_Ekranı SHALL ürün görseli yüklemeye izin vermeli
5. THE Boss_Ekranı SHALL mevcut ürünü düzenlemeye izin vermeli
6. THE Boss_Ekranı SHALL ürün silmeye izin vermeli
7. THE Boss_Ekranı SHALL kategori ekleme/düzenleme/silme yapabilmeli
8. WHEN ürün kaydedildiğinde, THE Boss_Ekranı SHALL değişikliği tüm ekranlara yansıtmalı

---

### Gereksinim 7: Boss Ekranı - Rapor Görme

**Kullanıcı Hikayesi:** Bir yönetici olarak, satış raporlarını görmek istiyorum.

#### Kabul Kriterleri

1. THE Boss_Ekranı SHALL günlük satış toplamını göstermeli
2. THE Boss_Ekranı SHALL sipariş sayısını göstermeli
3. THE Boss_Ekranı SHALL en çok satan ürünleri göstermeli
4. THE Boss_Ekranı SHALL tarih seçerek rapor filtreleyebilmeli
5. THE Boss_Ekranı SHALL ödeme yöntemi dağılımını göstermeli

---

### Gereksinim 8: Boss Ekranı - Yazıcı Ayarları

**Kullanıcı Hikayesi:** Bir yönetici olarak, yazıcıları tanımlamak ve test etmek istiyorum.

#### Kabul Kriterleri

1. THE Boss_Ekranı SHALL yazıcı listesi göstermeli
2. THE Boss_Ekranı SHALL yeni yazıcı ekleme ekranı sunmalı
3. THE Boss_Ekranı SHALL yazıcı tipi seçtirmeli (Mutfak / Fiş)
4. THE Boss_Ekranı SHALL yazıcı bağlantı bilgisi almalı (IP veya USB)
5. THE Boss_Ekranı SHALL test yazdırma butonu sunmalı
6. WHEN test butonuna basıldığında, THE Boss_Ekranı SHALL yazıcıdan test fişi çıkarmalı

---

### Gereksinim 9: Boss Ekranı - Masa Düzeni

**Kullanıcı Hikayesi:** Bir yönetici olarak, masa düzenini ayarlamak istiyorum.

#### Kabul Kriterleri

1. THE Boss_Ekranı SHALL masa listesi göstermeli
2. THE Boss_Ekranı SHALL yeni masa eklemeye izin vermeli
3. THE Boss_Ekranı SHALL masa adı/numarası belirlemeye izin vermeli
4. THE Boss_Ekranı SHALL masa silmeye izin vermeli
5. THE Boss_Ekranı SHALL masa sıralamasını değiştirmeye izin vermeli

---

## Kapsam Dışı (Şimdilik)

- Stok takibi
- Çift ekran (müşteri ekranı)
- Detaylı ödeme yöntemleri (kart entegrasyonu)
- Kullanıcı yetkileri / giriş sistemi
- Online entegrasyonlar (Getir, Yemeksepeti)
- Rezervasyon
- Sadakat programı
- Paket servis / kurye

---

## Test Senaryosu

**Hazırlık:**
1. Boss ekranından masa ekle (Masa 1, 2, 3...)
2. Boss ekranından kategori ekle (İçecekler, Yiyecekler)
3. Boss ekranından ürün ekle (Çay, Kahve, Tost...)
4. Boss ekranından yazıcı ayarla ve test et

**Sipariş Akışı:**
5. Satış ekranından Masa 1'i aç → Sipariş al → Kaydet
6. Mutfakta sipariş kağıdı çıktığını kontrol et
7. Mutfak ekranında siparişi gör → Hazır işaretle
8. Tabletten Masa 2'yi aç → Sipariş al → Gönder
9. Mutfakta sipariş kağıdı çıktığını kontrol et

**Sipariş Düzenleme:**
10. Masa 1'e ürün ekle
11. Masa 1'den ürün çıkar
12. Masa 1'i Masa 3'e aktar
13. Masa 2 ve 3'ü birleştir
14. Siparişi böl (2 ayrı hesap)

**QR Menü:**
15. Telefondan QR okut → Menüyü gör
16. Garson çağır → Satış ekranında bildirim gör

**Ödeme ve Rapor:**
17. Ödeme al → Masayı kapat
18. Boss ekranından günlük raporu kontrol et

---

*Son Güncelleme: 13 Ocak 2026*
*Versiyon: 0.2 - Sipariş İşlemleri + Boss Ekranı*
