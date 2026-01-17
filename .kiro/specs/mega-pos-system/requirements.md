# MEGA POS - Kapsamlı Gereksinim Dokümanı
## Türkiye'nin En Kapsamlı Restoran/Kafe Yönetim Sistemi

---

## 1. Proje Özeti

### 1.1 Vizyon
MEGA POS, Türkiye'nin en kapsamlı, modüler ve AI destekli restoran/kafe yönetim sistemidir. 771+ özellik ile rakiplerinden %200 daha fazla özellik ve %30-40 daha ucuz fiyat sunmayı hedefler.

### 1.2 Hedef Pazar
- **Birincil:** Türkiye restoran/kafe sektörü (50,000+ işletme)
- **Hedef Segmentler:**
  - Küçük kafeler (50-80 sipariş/gün)
  - Orta ölçekli restoranlar (150-250 sipariş/gün)
  - Büyük restoranlar (400+ sipariş/gün)
  - Franchise zincirleri (5-50 şube)

### 1.3 Rekabet Avantajları
- AI Agent sistemi (Türkiye'de ilk)
- IoT takip sistemleri (Türkiye'de ilk)
- Gelişmiş OCR ve belge yönetimi (%98 doğruluk)
- Geniş entegrasyon ekosistemi (5 mevcut HSD projesi + 3 yeni proje)
- Tam offline çalışma desteği
- 7/24 destek

---

## 2. Sistem Mimarisi

### 2.1 Teknoloji Stack

#### Frontend
- React 18 + Next.js 14 + TypeScript
- Flutter 3.x (Mobil uygulamalar)
- Tailwind CSS + Radix UI

#### Backend
- Node.js 20 LTS + NestJS
- REST API + GraphQL
- RabbitMQ / AWS SQS

#### Veritabanı
- PostgreSQL 16 (Aurora)
- DynamoDB (NoSQL)
- Redis 7 (Cache)
- AWS Timestream (IoT verileri)

#### Altyapı
- AWS EKS (Kubernetes)
- Docker + Terraform
- GitHub Actions (CI/CD)

#### AI/ML
- AWS Bedrock (Claude 3.5 Sonnet)
- AWS SageMaker
- AWS Textract (OCR)
- AWS Rekognition

### 2.2 Entegrasyon Mimarisi

#### Mevcut HSD Projeleri (API Entegrasyonu)
1. **İnsan Kaynakları Yazılımı** - Personel bilgileri, izin/devamsızlık, performans
2. **Muhasebe Yazılımı** - Hesap planı, cari hesaplar, mali raporlar
3. **PDKS Yazılımı** - Giriş/çıkış kayıtları, mesai süreleri, vardiya
4. **Clinisyn (Psikoloji Platformu)** - Psikolojik ürün önerisi, müşteri analizi
5. **Evraktar (Dijital Evrak)** - Tutanak üretimi, e-imza, dijital arşiv

#### Yeni Geliştirilecek Projeler
1. **IoT Takip Sistemi** - Elektrik/su/doğalgaz tüketimi, makine bakım
2. **AI Agent Sistemi** - Sesli yönetim, rezervasyon asistanı, sosyal medya
3. **Gelişmiş Medya İşleme** - Ürün fotoğraf optimizasyonu, video işleme

---

## 3. Modül Gereksinimleri (30 Modül - 771+ Özellik)


### 3.1 MODÜL 1: POS ve Satış Yönetimi (85 Özellik) - KRİTİK

#### Kullanıcı Hikayeleri

**US-1.1: Temel POS İşlemleri**
- Bir kasiyer olarak, donanımdan bağımsız (cloud-based) çalışabilmeliyim ki farklı cihazlarda sorunsuz kullanabileyim
- Bir kasiyer olarak, çoklu platform desteği (Windows, macOS, Linux, iOS, Android) olmalı ki tercih ettiğim cihazı kullanabileyim
- Bir kasiyer olarak, offline çalışabilmeliyim ki internet kesintilerinde satış yapabileyim
- Bir kasiyer olarak, dokunmatik ekran desteği olmalı ki hızlı sipariş alabileyim
- Bir kasiyer olarak, barkod tarayıcı desteği olmalı ki ürünleri hızlıca ekleyebileyim

**US-1.2: Sipariş Yönetimi**
- Bir kasiyer olarak, hızlı sipariş oluşturabilmeliyim ki müşteri bekleme süresini azaltabileyim
- Bir kasiyer olarak, siparişi düzenleyebilmeliyim (ekleme, çıkarma, değiştirme) ki müşteri isteklerini karşılayabileyim
- Bir kasiyer olarak, sipariş iptal ve iade yapabilmeliyim ki hatalı işlemleri düzeltebiliyim
- Bir kasiyer olarak, hesap bölme (split) yapabilmeliyim ki grup siparişlerini yönetebiliyim
- Bir kasiyer olarak, ürün seçenekleri (boyut, sos, ekstra) ekleyebilmeliyim ki özelleştirilmiş siparişler alabileyim

**US-1.3: Ödeme İşlemleri**
- Bir kasiyer olarak, çoklu ödeme yöntemi kabul edebilmeliyim (nakit, kredi kartı, temassız, QR)
- Bir kasiyer olarak, yemek kartı (Sodexo, Multinet) kabul edebilmeliyim
- Bir kasiyer olarak, bahşiş ekleyebilmeliyim ki garson kazançlarını takip edebiliyim
- Bir kasiyer olarak, bölünmüş ödeme yapabilmeliyim ki farklı ödeme yöntemlerini birleştirebiliyim
- Bir kasiyer olarak, döviz kabul edebilmeliyim ki yabancı müşterilere hizmet verebiliyim

**US-1.4: Fiş Yönetimi**
- Bir kasiyer olarak, fiş yazdırabilmeliyim ki müşteriye belge verebiliyim
- Bir kasiyer olarak, e-fiş gönderebilmeliyim (email, SMS, WhatsApp) ki dijital belge sunabiliyim
- Bir kasiyer olarak, fiş geçmişini görüntüleyebilmeliyim ki geçmiş işlemleri kontrol edebiliyim

#### Kabul Kriterleri
- [ ] Sistem 99.9% uptime sağlamalı
- [ ] Offline modda en az 24 saat çalışabilmeli
- [ ] Sipariş oluşturma süresi < 5 saniye
- [ ] Ödeme işlemi süresi < 3 saniye
- [ ] Tüm POS cihazları (Ingenico, Verifone, Hugin, PAX) ile entegre çalışmalı

---

### 3.2 MODÜL 2: Masa Yönetimi (25 Özellik) - KRİTİK

#### Kullanıcı Hikayeleri

**US-2.1: Kat ve Masa Düzeni**
- Bir yönetici olarak, çoklu kat tanımlayabilmeliyim ki farklı alanları yönetebiliyim
- Bir yönetici olarak, masa düzenini sürükle-bırak ile ayarlayabilmeliyim ki gerçek yerleşimi yansıtabiliyim
- Bir garson olarak, masa durumunu renk kodlarıyla görebilmeliyim (boş, dolu, rezerve, ödeme bekliyor)

**US-2.2: Masa İşlemleri**
- Bir garson olarak, masa açıp kapatabilmeliyim ki müşteri takibini yapabiliyim
- Bir garson olarak, masa taşıyabilmeliyim ki müşteri yer değiştirmelerini yönetebiliyim
- Bir garson olarak, masaları birleştirebilmeliyim ki grup müşterilere hizmet verebiliyim
- Bir garson olarak, ürünleri masalar arası transfer edebilmeliyim ki hesap düzenlemesi yapabiliyim

**US-2.3: Masa Analitiği**
- Bir yönetici olarak, masa başına müşteri süresini takip edebilmeliyim ki verimliliği ölçebiliyim
- Bir yönetici olarak, masa devir hızını görebilmeliyim ki kapasite planlaması yapabiliyim

#### Kabul Kriterleri
- [ ] Masa durumu gerçek zamanlı güncellenmeli (< 1 saniye)
- [ ] Sürükle-bırak düzenleme tüm cihazlarda çalışmalı
- [ ] Masa birleştirme/ayırma işlemi < 3 saniye

---

### 3.3 MODÜL 3: Mutfak Yönetimi - KDS (30 Özellik) - KRİTİK

#### Kullanıcı Hikayeleri

**US-3.1: Mutfak Ekranı**
- Bir aşçı olarak, siparişleri anlık görebilmeliyim ki hazırlığa hemen başlayabiliyim
- Bir aşçı olarak, siparişleri kronolojik sırada görebilmeliyim ki öncelik belirleyebiliyim
- Bir aşçı olarak, renk kodlarıyla durumu görebilmeliyim (yeni=kırmızı, hazırlanıyor=sarı, hazır=yeşil)
- Bir aşçı olarak, sesli uyarı alabilmeliyim ki yeni siparişleri kaçırmayayım

**US-3.2: Mutfak Organizasyonu**
- Bir yönetici olarak, çoklu mutfak/bar tanımlayabilmeliyim (sıcak mutfak, soğuk mutfak, bar, pastane)
- Bir yönetici olarak, ürünleri mutfaklara gruplayabilmeliyim ki doğru yere yönlendirebiliyim
- Bir yönetici olarak, mutfak bazlı yazıcı atayabilmeliyim ki siparişler doğru yere çıksın

**US-3.3: Mutfak İletişimi**
- Bir aşçı olarak, sipariş hazır bildirimi gönderebilmeliyim ki servis hızlansın
- Bir garson olarak, hazır sipariş bildirimi alabilmeliyim ki müşteriye hızlı servis yapabiliyim

#### Kabul Kriterleri
- [ ] Sipariş mutfağa < 2 saniyede ulaşmalı
- [ ] Hazır bildirimi < 1 saniyede servise ulaşmalı
- [ ] Sistem 50+ eşzamanlı siparişi desteklemeli

---

### 3.4 MODÜL 4: Stok ve Envanter (45 Özellik) - KRİTİK

#### Kullanıcı Hikayeleri

**US-4.1: Stok Takibi**
- Bir depo sorumlusu olarak, anlık stok durumunu görebilmeliyim ki eksikleri tespit edebiliyim
- Bir depo sorumlusu olarak, kritik stok seviyesi uyarısı alabilmeliyim ki zamanında sipariş verebiliyim
- Bir depo sorumlusu olarak, son kullanma tarihi takibi yapabilmeliyim ki fire önleyebiliyim

**US-4.2: Reçete Yönetimi**
- Bir yönetici olarak, ürün reçetesi oluşturabilmeliyim ki maliyet hesaplayabiliyim
- Bir sistem olarak, satışta otomatik stok düşümü yapabilmeliyim ki manuel işlem gerektirmesin
- Bir yönetici olarak, reçete maliyeti hesaplayabilmeliyim ki fiyatlandırma yapabiliyim

**US-4.3: Stok Hareketleri**
- Bir depo sorumlusu olarak, stok giriş/çıkış yapabilmeliyim ki hareketleri kaydedebiliyim
- Bir depo sorumlusu olarak, depolar arası transfer yapabilmeliyim ki stok dengeleyebiliyim
- Bir depo sorumlusu olarak, fire/zayi kaydı yapabilmeliyim ki kayıpları takip edebiliyim

#### Kabul Kriterleri
- [ ] Stok güncelleme < 1 saniye
- [ ] Kritik stok uyarısı anlık gönderilmeli
- [ ] Reçete bazlı maliyet hesaplama %99 doğrulukta olmalı

---

### 3.5 MODÜL 5: Satın Alma ve Tedarik (25 Özellik) - YÜKSEK

#### Kullanıcı Hikayeleri

**US-5.1: Tedarikçi Yönetimi**
- Bir satın alma sorumlusu olarak, tedarikçi tanımlayabilmeliyim ki sipariş verebiliyim
- Bir satın alma sorumlusu olarak, tedarikçi performansını takip edebilmeliyim ki en iyisini seçebiliyim
- Bir satın alma sorumlusu olarak, fiyat anlaşması kaydedebilmeliyim ki maliyetleri kontrol edebiliyim

**US-5.2: Sipariş Yönetimi**
- Bir satın alma sorumlusu olarak, satın alma siparişi oluşturabilmeliyim
- Bir sistem olarak, stok seviyesine göre otomatik sipariş önerisi yapabilmeliyim
- Bir depo sorumlusu olarak, mal kabul işlemi yapabilmeliyim ki stok güncellensin

#### Kabul Kriterleri
- [ ] Otomatik sipariş önerisi %90+ doğrulukta olmalı
- [ ] Tedarikçi performans skoru gerçek zamanlı hesaplanmalı

---

### 3.6 MODÜL 6: Muhasebe ve ERP (40 Özellik) - YÜKSEK

#### Kullanıcı Hikayeleri

**US-6.1: Kasa Yönetimi**
- Bir kasiyer olarak, kasa açılış/kapanış yapabilmeliyim ki günlük takip yapabiliyim
- Bir kasiyer olarak, kasa sayımı yapabilmeliyim ki farkları tespit edebiliyim
- Bir yönetici olarak, kasa farkı raporu görebilmeliyim ki sorunları çözebiliyim

**US-6.2: Cari Hesaplar**
- Bir muhasebeci olarak, müşteri/tedarikçi/personel cari hesabı tutabilmeliyim
- Bir muhasebeci olarak, alacak yaşlandırma raporu görebilmeliyim ki tahsilatı takip edebiliyim

**US-6.3: ERP Entegrasyonu**
- Bir muhasebeci olarak, Logo/Mikro/Netsis/Paraşüt entegrasyonu yapabilmeliyim ki çift kayıt önlensin
- Bir sistem olarak, Z raporlarını otomatik muhasebe kaydına dönüştürebilmeliyim

#### Kabul Kriterleri
- [ ] ERP senkronizasyonu < 5 dakika
- [ ] Muhasebe kayıtları %100 doğru olmalı
- [ ] Kasa farkı raporu anlık hesaplanmalı

---

### 3.7 MODÜL 7: Raporlama ve Analitik (50 Özellik) - YÜKSEK

#### Kullanıcı Hikayeleri

**US-7.1: Temel Raporlar**
- Bir yönetici olarak, gün sonu raporu görebilmeliyim ki günlük performansı değerlendirebiliyim
- Bir yönetici olarak, Z raporu alabilmeliyim ki yasal yükümlülükleri karşılayabiliyim
- Bir yönetici olarak, satış raporu görebilmeliyim ki geliri takip edebiliyim

**US-7.2: Gelişmiş Raporlar**
- Bir yönetici olarak, en çok/az satan ürünleri görebilmeliyim ki menü optimizasyonu yapabiliyim
- Bir yönetici olarak, saatlik satış analizi görebilmeliyim ki personel planlaması yapabiliyim
- Bir yönetici olarak, dönem karşılaştırması yapabilmeliyim ki trendi görebiliyim

**US-7.3: Dashboard**
- Bir yönetici olarak, gerçek zamanlı dashboard görebilmeliyim ki anlık durumu izleyebiliyim
- Bir yönetici olarak, KPI göstergelerini görebilmeliyim ki hedefleri takip edebiliyim
- Bir yönetici olarak, mobil dashboard'a erişebilmeliyim ki her yerden izleyebiliyim

#### Kabul Kriterleri
- [ ] Raporlar < 3 saniyede yüklenmeli
- [ ] Dashboard gerçek zamanlı güncellenmeli (< 5 saniye)
- [ ] Excel/PDF export desteklenmeli

---

### 3.8 MODÜL 8: Paket Servis ve Kurye (45 Özellik) - KRİTİK

#### Kullanıcı Hikayeleri

**US-8.1: Paket Sipariş**
- Bir operatör olarak, paket sipariş ekranında tüm siparişleri görebilmeliyim
- Bir operatör olarak, sipariş kabul/red yapabilmeliyim ki kapasite yönetebiliyim
- Bir sistem olarak, müşteriye SMS/push bildirim gönderebilmeliyim ki durumu bildirebiliyim

**US-8.2: Kurye Yönetimi**
- Bir yönetici olarak, kurye tanımlayabilmeliyim ki teslimat yapabiliyim
- Bir sistem olarak, otomatik kurye ataması yapabilmeliyim ki verimlilik artırsın
- Bir yönetici olarak, kurye lokasyonunu GPS ile takip edebilmeliyim ki teslimatı izleyebiliyim

**US-8.3: Kurye Mobil App**
- Bir kurye olarak, atanan siparişleri görebilmeliyim ki teslimat yapabiliyim
- Bir kurye olarak, navigasyon entegrasyonu kullanabilmeliyim ki adresi bulabiliyim
- Bir kurye olarak, teslim edildi işaretleyebilmeliyim ki sipariş kapansın

**US-8.4: Caller ID**
- Bir operatör olarak, arayan numarayı tanıyabilmeliyim ki müşteri bilgisini görebiliyim
- Bir operatör olarak, son siparişleri görebilmeliyim ki hızlı sipariş tekrarı yapabiliyim

#### Kabul Kriterleri
- [ ] Kurye ataması < 30 saniye
- [ ] GPS takibi 10 saniye aralıklarla güncellenmeli
- [ ] Caller ID tanıma < 1 saniye

---

### 3.9 MODÜL 9: Online Sipariş Entegrasyonları (30 Özellik) - KRİTİK

#### Kullanıcı Hikayeleri

**US-9.1: Platform Entegrasyonları**
- Bir sistem olarak, Getir Yemek siparişlerini otomatik alabilmeliyim
- Bir sistem olarak, Yemeksepeti siparişlerini otomatik alabilmeliyim
- Bir sistem olarak, Trendyol Yemek siparişlerini otomatik alabilmeliyim
- Bir sistem olarak, global platformları (Uber Eats, Deliveroo, Glovo) destekleyebilmeliyim

**US-9.2: Entegrasyon Özellikleri**
- Bir sistem olarak, menü senkronizasyonu yapabilmeliyim ki tüm platformlarda güncel olsun
- Bir sistem olarak, stok senkronizasyonu yapabilmeliyim ki tükenen ürünler otomatik kapansın
- Bir operatör olarak, sipariş durumunu güncelleyebilmeliyim ki platform bilgilensin

**US-9.3: White Label**
- Bir işletme olarak, kendi sipariş web sitemi kullanabilmeliyim ki komisyon ödemeyeyim
- Bir işletme olarak, kendi mobil app'imi kullanabilmeliyim ki marka bilinirliği artırsın

#### Kabul Kriterleri
- [ ] Sipariş alımı < 5 saniye
- [ ] Menü senkronizasyonu < 1 dakika
- [ ] %99.9 sipariş başarı oranı

---

### 3.10 MODÜL 10: Sadakat ve CRM (40 Özellik) - YÜKSEK

#### Kullanıcı Hikayeleri

**US-10.1: Müşteri Yönetimi**
- Bir kasiyer olarak, müşteri kaydı oluşturabilmeliyim ki sadakat programına dahil edebiliyim
- Bir sistem olarak, müşteri 360° profili gösterebilmeliyim ki kişiselleştirilmiş hizmet sunabiliyim
- Bir sistem olarak, alerjen/diyet tercihlerini kaydedebilmeliyim ki güvenli sipariş alabiliyim

**US-10.2: Puan Sistemi**
- Bir müşteri olarak, alışverişlerimden puan kazanabilmeliyim ki ödül alabiliyim
- Bir müşteri olarak, puanlarımı harcayabilmeliyim ki indirim alabiliyim
- Bir sistem olarak, sadakat seviyeleri (Bronze/Silver/Gold) sunabilmeliyim ki müşteri bağlılığı artırsın

**US-10.3: Kampanya Yönetimi**
- Bir pazarlama sorumlusu olarak, kampanya oluşturabilmeliyim ki satışları artırabiliyim
- Bir sistem olarak, doğum günü kampanyası otomatik gönderebilmeliyim
- Bir sistem olarak, referans programı yönetebilmeliyim ki yeni müşteri kazanabiliyim

**US-10.4: İletişim**
- Bir pazarlama sorumlusu olarak, SMS/Email/Push kampanyası gönderebilmeliyim
- Bir sistem olarak, WhatsApp Business entegrasyonu yapabilmeliyim ki müşterilerle iletişim kurabiliyim

#### Kabul Kriterleri
- [ ] Puan hesaplama anlık olmalı
- [ ] Kampanya hedefleme %95+ doğrulukta olmalı
- [ ] SMS/Email gönderim başarı oranı > %98


---

### 3.11 MODÜL 11: QR Menü (25 Özellik) - YÜKSEK

#### Kullanıcı Hikayeleri

**US-11.1: Temassız Menü**
- Bir müşteri olarak, QR kod ile menüye erişebilmeliyim ki hijyenik olsun
- Bir müşteri olarak, güncel fiyatları görebilmeliyim ki doğru bilgi alabiliyim
- Bir müşteri olarak, ürün görsellerini görebilmeliyim ki seçim yapabiliyim

**US-11.2: Menü Yönetimi**
- Bir yönetici olarak, POS menüsünü QR menüye otomatik aktarabilmeliyim
- Bir yönetici olarak, anlık fiyat güncellemesi yapabilmeliyim
- Bir yönetici olarak, alerjen uyarıları ekleyebilmeliyim ki müşteri güvenliği sağlansın

**US-11.3: Sipariş ve Ödeme**
- Bir müşteri olarak, QR menüden direkt sipariş verebilmeliyim
- Bir müşteri olarak, QR menüden ödeme yapabilmeliyim
- Bir müşteri olarak, garson çağırabilmeliyim

#### Kabul Kriterleri
- [ ] QR menü yüklenme süresi < 2 saniye
- [ ] Menü senkronizasyonu < 1 dakika
- [ ] Çoklu dil desteği (en az 5 dil)

---

### 3.12 MODÜL 12: Rezervasyon Sistemi (35 Özellik) - ORTA

#### Kullanıcı Hikayeleri

**US-12.1: Rezervasyon Kanalları**
- Bir müşteri olarak, web sitesinden rezervasyon yapabilmeliyim
- Bir müşteri olarak, WhatsApp'tan rezervasyon yapabilmeliyim
- Bir müşteri olarak, Google'dan rezervasyon yapabilmeliyim

**US-12.2: Rezervasyon Yönetimi**
- Bir host olarak, rezervasyon onay/red yapabilmeliyim
- Bir sistem olarak, otomatik masa ataması yapabilmeliyim
- Bir sistem olarak, SMS/Email hatırlatma gönderebilmeliyim

**US-12.3: No-Show Önleme**
- Bir sistem olarak, ön ödemeli rezervasyon alabilmeliyim
- Bir sistem olarak, kredi kartı provizyon alabilmeliyim
- Bir yönetici olarak, no-show takibi yapabilmeliyim

**US-12.4: AI Asistan**
- Bir sistem olarak, telefon rezervasyonlarını AI ile yanıtlayabilmeliyim
- Bir sistem olarak, 24/7 rezervasyon alabilmeliyim
- Bir sistem olarak, 35 dilde hizmet verebilmeliyim

#### Kabul Kriterleri
- [ ] Rezervasyon onayı < 1 dakika
- [ ] AI asistan %90+ başarı oranı
- [ ] No-show oranı < %5

---

### 3.13 MODÜL 13: Self-Servis Kiosk (25 Özellik) - ORTA

#### Kullanıcı Hikayeleri

**US-13.1: Kiosk Uygulaması**
- Bir müşteri olarak, görsel menüden sipariş verebilmeliyim
- Bir müşteri olarak, ürün seçeneklerini görebilmeliyim (boyut, sos, ekstra)
- Bir müşteri olarak, alerjen uyarılarını görebilmeliyim

**US-13.2: Ödeme**
- Bir müşteri olarak, kart ile ödeme yapabilmeliyim
- Bir müşteri olarak, NFC ile ödeme yapabilmeliyim
- Bir müşteri olarak, QR kod ile ödeme yapabilmeliyim

**US-13.3: Özelleştirme**
- Bir yönetici olarak, marka renklerini ayarlayabilmeliyim
- Bir yönetici olarak, kampanya gösterimi yapabilmeliyim
- Bir sistem olarak, upsell önerileri sunabilmeliyim

#### Kabul Kriterleri
- [ ] Sipariş süresi < 2 dakika
- [ ] Ödeme işlemi < 10 saniye
- [ ] Upsell dönüşüm oranı > %15

---

### 3.14 MODÜL 14: Garson El Terminali (20 Özellik) - YÜKSEK

#### Kullanıcı Hikayeleri

**US-14.1: Donanım Desteği**
- Bir garson olarak, akıllı telefon kullanabilmeliyim (iOS, Android)
- Bir garson olarak, tablet kullanabilmeliyim
- Bir garson olarak, kablosuz bağlantı ile çalışabilmeliyim

**US-14.2: Sipariş Alma**
- Bir garson olarak, ürün görsellerine dokunarak sipariş alabilmeliyim
- Bir garson olarak, ürün seçeneklerini görebilmeliyim
- Bir garson olarak, sipariş notu ekleyebilmeliyim

**US-14.3: Masa Yönetimi**
- Bir garson olarak, kat ve masa navigasyonu yapabilmeliyim
- Bir garson olarak, masa taşıyabilmeliyim
- Bir garson olarak, masa birleştirebilmeliyim

#### Kabul Kriterleri
- [ ] Sipariş gönderme < 2 saniye
- [ ] Offline modda çalışabilmeli
- [ ] Batarya ömrü > 8 saat

---

### 3.15 MODÜL 15: Mobil Yönetim Uygulaması (25 Özellik) - YÜKSEK

#### Kullanıcı Hikayeleri

**US-15.1: Dashboard**
- Bir yönetici olarak, özet bilgileri görebilmeliyim
- Bir yönetici olarak, son 7 gün ortalama kazancı görebilmeliyim
- Bir yönetici olarak, gerçek zamanlı işletme durumunu görebilmeliyim

**US-15.2: Raporlar**
- Bir yönetici olarak, gün sonu raporu görebilmeliyim
- Bir yönetici olarak, en çok satan ürünleri görebilmeliyim
- Bir yönetici olarak, personel performansını görebilmeliyim

**US-15.3: Ürün Yönetimi**
- Bir yönetici olarak, ürün fiyatını güncelleyebilmeliyim
- Bir yönetici olarak, ürün stok durumunu değiştirebilmeliyim

#### Kabul Kriterleri
- [ ] App yüklenme süresi < 3 saniye
- [ ] Push notification < 5 saniye
- [ ] iOS ve Android desteği

---

### 3.16 MODÜL 16: Franchise ve Çoklu Şube (50 Özellik) - KRİTİK

#### Kullanıcı Hikayeleri

**US-16.1: Şube Yönetimi**
- Bir merkez yöneticisi olarak, sınırsız şube tanımlayabilmeliyim
- Bir merkez yöneticisi olarak, tek panelden tüm şubeleri yönetebilmeliyim
- Bir merkez yöneticisi olarak, şube grupları/bölgeler oluşturabilmeliyim

**US-16.2: Merkezi Menü**
- Bir merkez yöneticisi olarak, merkezi ürün tanımları yapabilmeliyim
- Bir merkez yöneticisi olarak, şubelere menü dağıtabilmeliyim
- Bir merkez yöneticisi olarak, şube bazlı fiyat farklılaştırması yapabilmeliyim

**US-16.3: Merkezi Stok**
- Bir merkez yöneticisi olarak, merkezi depo tanımlayabilmeliyim
- Bir merkez yöneticisi olarak, şubelere dağıtım planı yapabilmeliyim
- Bir merkez yöneticisi olarak, konsolide stok görünümü alabilmeliyim

**US-16.4: Konsolide Raporlar**
- Bir merkez yöneticisi olarak, tüm şubeler toplam cirosunu görebilmeliyim
- Bir merkez yöneticisi olarak, şube karşılaştırma raporu alabilmeliyim
- Bir merkez yöneticisi olarak, konsolide kâr/zarar görebilmeliyim

**US-16.5: Franchise Özel**
- Bir merkez yöneticisi olarak, franchise partner tanımlayabilmeliyim
- Bir sistem olarak, royalty hesaplaması yapabilmeliyim
- Bir franchise partner olarak, kendi portalıma erişebilmeliyim

#### Kabul Kriterleri
- [ ] 100+ şube desteklenmeli
- [ ] Merkezi güncelleme < 5 dakika tüm şubelere yansımalı
- [ ] Konsolide raporlar < 10 saniyede yüklenmeli

---

### 3.17 MODÜL 17: E-Dönüşüm ve Yasal Uyum (30 Özellik) - KRİTİK

#### Kullanıcı Hikayeleri

**US-17.1: E-Fatura**
- Bir muhasebeci olarak, e-fatura oluşturabilmeliyim
- Bir muhasebeci olarak, e-fatura gönderebilmeliyim
- Bir muhasebeci olarak, gelen e-faturaları alabilmeliyim

**US-17.2: E-Arşiv**
- Bir muhasebeci olarak, e-arşiv fatura oluşturabilmeliyim
- Bir sistem olarak, GİB bildirimi yapabilmeliyim

**US-17.3: Yazarkasa**
- Bir sistem olarak, Ingenico/Verifone/Hugin/PAX entegrasyonu yapabilmeliyim
- Bir kasiyer olarak, mali fiş yazdırabilmeliyim
- Bir sistem olarak, Z raporu entegrasyonu yapabilmeliyim

#### Kabul Kriterleri
- [ ] E-fatura gönderimi < 30 saniye
- [ ] GİB uyumluluğu %100
- [ ] Tüm yazarkasa markaları desteklenmeli

---

### 3.18 MODÜL 18: Ödeme Çözümleri (35 Özellik) - KRİTİK

#### Kullanıcı Hikayeleri

**US-18.1: Ödeme Yöntemleri**
- Bir kasiyer olarak, nakit ödeme alabilmeliyim
- Bir kasiyer olarak, kredi kartı (temaslı/temassız) alabilmeliyim
- Bir kasiyer olarak, QR kod ile ödeme alabilmeliyim
- Bir kasiyer olarak, yemek kartı (Sodexo, Multinet) alabilmeliyim

**US-18.2: Online Ödeme**
- Bir sistem olarak, Iyzico entegrasyonu yapabilmeliyim
- Bir sistem olarak, Stripe entegrasyonu yapabilmeliyim
- Bir sistem olarak, 3D Secure destekleyebilmeliyim

**US-18.3: Ödeme İşlemleri**
- Bir kasiyer olarak, bölünmüş ödeme yapabilmeliyim
- Bir kasiyer olarak, bahşiş ekleyebilmeliyim
- Bir kasiyer olarak, iade işlemi yapabilmeliyim

**US-18.4: Güvenlik**
- Bir sistem olarak, PCI-DSS uyumlu olmalıyım
- Bir sistem olarak, tokenization desteklemeliyim
- Bir sistem olarak, fraud detection yapabilmeliyim

#### Kabul Kriterleri
- [ ] Ödeme işlemi < 3 saniye
- [ ] PCI-DSS Level 1 uyumluluğu
- [ ] Fraud detection %99+ doğruluk

---

### 3.19 MODÜL 19: Kampanya ve Promosyon (25 Özellik) - YÜKSEK

#### Kullanıcı Hikayeleri

**US-19.1: Kampanya Oluşturma**
- Bir pazarlama sorumlusu olarak, indirim kampanyası oluşturabilmeliyim
- Bir pazarlama sorumlusu olarak, X al Y öde kampanyası oluşturabilmeliyim
- Bir pazarlama sorumlusu olarak, happy hour kampanyası oluşturabilmeliyim

**US-19.2: Kampanya Kuralları**
- Bir pazarlama sorumlusu olarak, minimum tutar şartı koyabilmeliyim
- Bir pazarlama sorumlusu olarak, tarih/saat aralığı belirleyebilmeliyim
- Bir pazarlama sorumlusu olarak, müşteri segmenti hedefleyebilmeliyim

**US-19.3: Kampanya Analizi**
- Bir pazarlama sorumlusu olarak, kampanya performansını görebilmeliyim
- Bir pazarlama sorumlusu olarak, ROI hesaplayabilmeliyim

#### Kabul Kriterleri
- [ ] Kampanya aktifleştirme < 1 dakika
- [ ] Kampanya kuralları anlık uygulanmalı
- [ ] Performans raporu gerçek zamanlı

---

### 3.20 MODÜL 20: Ghost Kitchen (15 Özellik) - ORTA

#### Kullanıcı Hikayeleri

**US-20.1: Sanal Marka**
- Bir yönetici olarak, sanal marka oluşturabilmeliyim
- Bir yönetici olarak, marka bazlı menü tanımlayabilmeliyim
- Bir yönetici olarak, marka bazlı fiyatlandırma yapabilmeliyim

**US-20.2: Çoklu Platform**
- Bir sistem olarak, her markayı farklı platformlara bağlayabilmeliyim
- Bir sistem olarak, marka bazlı sipariş yönetimi yapabilmeliyim

#### Kabul Kriterleri
- [ ] Sınırsız sanal marka desteği
- [ ] Marka bazlı raporlama


---

### 3.21 MODÜL 21: Dijital Menuboard (15 Özellik) - ORTA

#### Kullanıcı Hikayeleri

**US-21.1: Ekran Yönetimi**
- Bir yönetici olarak, dijital menü ekranı tanımlayabilmeliyim
- Bir yönetici olarak, ekran içeriğini uzaktan güncelleyebilmeliyim
- Bir yönetici olarak, zamanlı içerik planlayabilmeliyim

**US-21.2: İçerik**
- Bir yönetici olarak, ürün görselleri gösterebilmeliyim
- Bir yönetici olarak, fiyatları dinamik güncelleyebilmeliyim
- Bir yönetici olarak, kampanya duyuruları gösterebilmeliyim

#### Kabul Kriterleri
- [ ] İçerik güncelleme < 1 dakika
- [ ] 4K çözünürlük desteği
- [ ] Çoklu ekran senkronizasyonu

---

### 3.22 MODÜL 22: Yapay Zeka Özellikleri (60 Özellik) - YÜKSEK

#### Kullanıcı Hikayeleri

**US-22.1: Talep Tahmini**
- Bir sistem olarak, satış tahmini yapabilmeliyim ki stok planlaması yapılsın
- Bir sistem olarak, hava durumu entegrasyonu yapabilmeliyim ki tahmin doğruluğu artsın
- Bir sistem olarak, personel ihtiyacı tahmini yapabilmeliyim ki vardiya planlaması yapılsın

**US-22.2: Akıllı Stok**
- Bir sistem olarak, otomatik sipariş önerisi yapabilmeliyim
- Bir sistem olarak, fire tahmini yapabilmeliyim ki kayıplar önlensin
- Bir sistem olarak, tedarikçi seçim önerisi yapabilmeliyim

**US-22.3: Menü Optimizasyonu**
- Bir sistem olarak, menü mühendisliği analizi yapabilmeliyim
- Bir sistem olarak, cross-sell/up-sell önerileri sunabilmeliyim
- Bir sistem olarak, combo oluşturma önerisi yapabilmeliyim

**US-22.4: Müşteri Analizi**
- Bir sistem olarak, otomatik segmentasyon yapabilmeliyim
- Bir sistem olarak, churn prediction yapabilmeliyim ki müşteri kaybı önlensin
- Bir sistem olarak, kişiselleştirilmiş öneri motoru sunabilmeliyim

**US-22.5: AI Chatbot**
- Bir sistem olarak, müşteri chatbot sunabilmeliyim (AWS Bedrock)
- Bir sistem olarak, sipariş chatbot sunabilmeliyim
- Bir sistem olarak, WhatsApp bot sunabilmeliyim

**US-22.6: Görüntü İşleme**
- Bir sistem olarak, porsiyon kontrolü yapabilmeliyim
- Bir sistem olarak, sunum kalite kontrolü yapabilmeliyim
- Bir sistem olarak, hijyen kontrolü yapabilmeliyim

**US-22.7: Optimizasyon**
- Bir sistem olarak, dinamik fiyatlandırma yapabilmeliyim
- Bir sistem olarak, vardiya optimizasyonu yapabilmeliyim
- Bir sistem olarak, kurye rota optimizasyonu yapabilmeliyim

**US-22.8: İçerik Üretimi**
- Bir sistem olarak, sosyal medya içerik üretebilmeliyim
- Bir sistem olarak, ürün açıklaması yazabilmeliyim
- Bir sistem olarak, yorum yanıtı önerisi sunabilmeliyim

#### Kabul Kriterleri
- [ ] Satış tahmini %85+ doğruluk
- [ ] Chatbot %90+ başarı oranı
- [ ] Öneri motoru %80+ dönüşüm artışı

---

### 3.23 MODÜL 23: Entegrasyon Merkezi (40 Özellik) - KRİTİK

#### Kullanıcı Hikayeleri

**US-23.1: Mevcut HSD Projeleri**
- Bir sistem olarak, İK Yazılımı ile entegre olabilmeliyim
- Bir sistem olarak, Muhasebe Yazılımı ile entegre olabilmeliyim
- Bir sistem olarak, PDKS ile entegre olabilmeliyim
- Bir sistem olarak, Clinisyn ile entegre olabilmeliyim
- Bir sistem olarak, Evraktar ile entegre olabilmeliyim

**US-23.2: Üçüncü Taraf**
- Bir sistem olarak, Getir/Yemeksepeti/Trendyol ile entegre olabilmeliyim
- Bir sistem olarak, Zirve/Logo/Mikro ile entegre olabilmeliyim
- Bir sistem olarak, Google Ads/Facebook Ads ile entegre olabilmeliyim

**US-23.3: API Yönetimi**
- Bir geliştirici olarak, REST API kullanabilmeliyim
- Bir geliştirici olarak, GraphQL kullanabilmeliyim
- Bir geliştirici olarak, Webhook alabilmeliyim

#### Kabul Kriterleri
- [ ] API response time < 200ms
- [ ] Uptime > 99.9%
- [ ] Webhook delivery < 5 saniye

---

### 3.24 MODÜL 24: Donanım Desteği (25 Özellik) - KRİTİK

#### Kullanıcı Hikayeleri

**US-24.1: POS Cihazları**
- Bir sistem olarak, Ingenico cihazları desteklemeliyim
- Bir sistem olarak, Verifone cihazları desteklemeliyim
- Bir sistem olarak, PAX cihazları desteklemeliyim

**US-24.2: Yazıcılar**
- Bir sistem olarak, termal yazıcıları desteklemeliyim
- Bir sistem olarak, mutfak yazıcılarını desteklemeliyim
- Bir sistem olarak, etiket yazıcılarını desteklemeliyim

**US-24.3: Diğer Donanımlar**
- Bir sistem olarak, barkod okuyucuları desteklemeliyim
- Bir sistem olarak, para çekmecelerini desteklemeliyim
- Bir sistem olarak, müşteri ekranlarını desteklemeliyim

#### Kabul Kriterleri
- [ ] Tüm major POS markaları desteklenmeli
- [ ] Plug & play kurulum
- [ ] Donanım arıza tespiti

---

### 3.25 MODÜL 25: Güvenlik ve Altyapı (30 Özellik) - KRİTİK

#### Kullanıcı Hikayeleri

**US-25.1: Kullanıcı Güvenliği**
- Bir sistem olarak, rol bazlı yetkilendirme yapabilmeliyim
- Bir sistem olarak, iki faktörlü doğrulama desteklemeliyim
- Bir sistem olarak, oturum yönetimi yapabilmeliyim

**US-25.2: Veri Güvenliği**
- Bir sistem olarak, KVKK uyumlu olmalıyım
- Bir sistem olarak, GDPR uyumlu olmalıyım
- Bir sistem olarak, PCI-DSS uyumlu olmalıyım
- Bir sistem olarak, verileri şifreleyebilmeliyim (AES-256)

**US-25.3: Altyapı**
- Bir sistem olarak, otomatik yedekleme yapabilmeliyim
- Bir sistem olarak, disaster recovery desteklemeliyim
- Bir sistem olarak, DDoS koruması sağlamalıyım

#### Kabul Kriterleri
- [ ] Uptime > 99.9%
- [ ] RTO < 4 saat
- [ ] RPO < 1 saat
- [ ] Penetration test geçmeli

---

### 3.26 MODÜL 26: İnsan Kaynakları (45 Özellik) - YÜKSEK

#### Kullanıcı Hikayeleri

**US-26.1: Vardiya**
- Bir yönetici olarak, vardiya planlama yapabilmeliyim
- Bir sistem olarak, otomatik vardiya oluşturabilmeliyim
- Bir personel olarak, vardiya değişimi talep edebilmeliyim

**US-26.2: Mesai (PDKS)**
- Bir personel olarak, parmak izi ile giriş/çıkış yapabilmeliyim
- Bir personel olarak, mobil giriş/çıkış yapabilmeliyim (GPS)
- Bir sistem olarak, mesai hesaplaması yapabilmeliyim

**US-26.3: İzin**
- Bir personel olarak, izin talebi oluşturabilmeliyim
- Bir yönetici olarak, izin onay/red yapabilmeliyim
- Bir personel olarak, izin bakiyemi görebilmeliyim

**US-26.4: Bordro**
- Bir sistem olarak, maaş hesaplaması yapabilmeliyim
- Bir sistem olarak, fazla mesai ücreti hesaplayabilmeliyim
- Bir sistem olarak, bahşiş dağıtımı yapabilmeliyim

**US-26.5: Performans**
- Bir yönetici olarak, KPI takibi yapabilmeliyim
- Bir yönetici olarak, satış hedefi belirleyebilmeliyim
- Bir yönetici olarak, performans raporu görebilmeliyim

#### Kabul Kriterleri
- [ ] PDKS entegrasyonu gerçek zamanlı
- [ ] Bordro hesaplama %100 doğru
- [ ] İzin onay süreci < 24 saat

---

### 3.27 MODÜL 27: Hijyen ve Gıda Güvenliği (25 Özellik) - YÜKSEK

#### Kullanıcı Hikayeleri

**US-27.1: HACCP**
- Bir yönetici olarak, HACCP kontrol listesi oluşturabilmeliyim
- Bir personel olarak, günlük kontrolleri kaydedebilmeliyim
- Bir sistem olarak, kritik kontrol noktası uyarısı verebilmeliyim

**US-27.2: Sıcaklık Takibi**
- Bir sistem olarak, buzdolabı sıcaklığını takip edebilmeliyim
- Bir sistem olarak, sıcaklık sapması uyarısı verebilmeliyim
- Bir sistem olarak, sıcaklık logları tutabilmeliyim

**US-27.3: Temizlik**
- Bir yönetici olarak, temizlik planı oluşturabilmeliyim
- Bir personel olarak, temizlik kaydı girebilmeliyim
- Bir sistem olarak, temizlik hatırlatması gönderebilmeliyim

#### Kabul Kriterleri
- [ ] HACCP uyumluluğu %100
- [ ] Sıcaklık takibi 5 dakika aralıklarla
- [ ] Temizlik kayıtları dijital arşivlenmeli

---

### 3.28 MODÜL 28: Ekipman ve Bakım (20 Özellik) - ORTA

#### Kullanıcı Hikayeleri

**US-28.1: Ekipman Yönetimi**
- Bir yönetici olarak, ekipman envanteri tutabilmeliyim
- Bir yönetici olarak, ekipman garanti takibi yapabilmeliyim
- Bir yönetici olarak, ekipman maliyetlerini takip edebilmeliyim

**US-28.2: Bakım Planlaması**
- Bir yönetici olarak, periyodik bakım planı oluşturabilmeliyim
- Bir sistem olarak, bakım hatırlatması gönderebilmeliyim
- Bir teknisyen olarak, bakım kaydı girebilmeliyim

**US-28.3: Arıza Yönetimi**
- Bir personel olarak, arıza bildirimi yapabilmeliyim
- Bir yönetici olarak, arıza takibi yapabilmeliyim
- Bir sistem olarak, arıza istatistikleri sunabilmeliyim

#### Kabul Kriterleri
- [ ] Bakım hatırlatması 7 gün önceden
- [ ] Arıza bildirimi < 1 dakika
- [ ] Ekipman ömrü takibi

---

### 3.29 MODÜL 29: Gelişmiş Özellikler (50 Özellik) - ORTA

#### Kullanıcı Hikayeleri

**US-29.1: Çoklu Dil**
- Bir sistem olarak, 35+ dil desteklemeliyim
- Bir yönetici olarak, menüyü çoklu dilde sunabilmeliyim
- Bir müşteri olarak, tercih ettiğim dilde kullanabilmeliyim

**US-29.2: Çoklu Para Birimi**
- Bir sistem olarak, döviz kurlarını güncelleyebilmeliyim
- Bir kasiyer olarak, döviz ile ödeme alabilmeliyim
- Bir sistem olarak, otomatik kur dönüşümü yapabilmeliyim

**US-29.3: Özel Raporlar**
- Bir yönetici olarak, özel rapor oluşturabilmeliyim
- Bir yönetici olarak, rapor şablonu kaydedebilmeliyim
- Bir sistem olarak, zamanlanmış rapor gönderebilmeliyim

#### Kabul Kriterleri
- [ ] 35+ dil desteği
- [ ] Döviz kurları günlük güncellenmeli
- [ ] Özel rapor oluşturma < 5 dakika

---

### 3.30 MODÜL 30: Servis Robotu (10 Özellik) - DÜŞÜK

#### Kullanıcı Hikayeleri

**US-30.1: Robot Entegrasyonu**
- Bir sistem olarak, servis robotları ile entegre olabilmeliyim
- Bir sistem olarak, robota sipariş atayabilmeliyim
- Bir sistem olarak, robot lokasyonunu takip edebilmeliyim

**US-30.2: Robot Yönetimi**
- Bir yönetici olarak, robot rotalarını tanımlayabilmeliyim
- Bir yönetici olarak, robot performansını görebilmeliyim

#### Kabul Kriterleri
- [ ] Major robot markaları desteklenmeli
- [ ] Robot-POS senkronizasyonu < 2 saniye

---

## 4. AI Agent Sistemi (Yeni Proje - Detaylı)

### 4.1 Sesli Yönetim Asistanı

#### Kullanıcı Hikayeleri
- Bir yönetici olarak, sesli komutlarla rapor alabilmeliyim ("Bugünkü satışları söyle")
- Bir yönetici olarak, sesli komutlarla işlem yapabilmeliyim ("Masa 5'i kapat")
- Bir sistem olarak, Türkçe doğal dil işleme yapabilmeliyim

#### Teknoloji
- AWS Transcribe (Türkçe STT)
- AWS Polly (Türkçe TTS)
- AWS Bedrock (Claude 3.5 Sonnet)

#### Kabul Kriterleri
- [ ] Türkçe tanıma doğruluğu > %95
- [ ] Yanıt süresi < 3 saniye
- [ ] Gürültülü ortamda çalışabilmeli

### 4.2 Rezervasyon Asistanı

#### Kullanıcı Hikayeleri
- Bir müşteri olarak, telefon ile rezervasyon yapabilmeliyim (AI yanıtlı)
- Bir müşteri olarak, WhatsApp ile rezervasyon yapabilmeliyim
- Bir sistem olarak, 24/7 rezervasyon alabilmeliyim

#### Teknoloji
- Twilio (Telefon)
- WhatsApp Business API
- AWS Bedrock

#### Kabul Kriterleri
- [ ] Telefon yanıtlama < 3 saniye
- [ ] Rezervasyon başarı oranı > %90
- [ ] 35 dil desteği

### 4.3 Sosyal Medya Otomasyonu

#### Kullanıcı Hikayeleri
- Bir pazarlama sorumlusu olarak, otomatik içerik üretebilmeliyim
- Bir sistem olarak, Instagram/Facebook post oluşturabilmeliyim
- Bir sistem olarak, Google yorumlarına otomatik yanıt verebilmeliyim

#### Teknoloji
- Instagram Graph API
- Facebook Graph API
- Google Business API
- AWS Bedrock

#### Kabul Kriterleri
- [ ] İçerik üretimi < 30 saniye
- [ ] Yorum yanıtı < 1 dakika
- [ ] Marka tutarlılığı > %95

### 4.4 Reklam Optimizasyonu

#### Kullanıcı Hikayeleri
- Bir pazarlama sorumlusu olarak, Google Ads optimizasyonu yapabilmeliyim
- Bir pazarlama sorumlusu olarak, Facebook Ads optimizasyonu yapabilmeliyim
- Bir sistem olarak, ROI bazlı bütçe dağıtımı yapabilmeliyim

#### Teknoloji
- Google Ads API
- Facebook Marketing API
- AWS SageMaker (ML)

#### Kabul Kriterleri
- [ ] ROAS artışı > %30
- [ ] Otomatik bid ayarlama
- [ ] A/B test otomasyonu

---

## 5. IoT Takip Sistemi (Yeni Proje - Detaylı)

### 5.1 Elektrik Tüketimi Takibi

#### Kullanıcı Hikayeleri
- Bir yönetici olarak, cihaz bazlı elektrik tüketimini görebilmeliyim
- Bir sistem olarak, anormallik tespiti yapabilmeliyim
- Bir sistem olarak, tüketim tahmini yapabilmeliyim

#### Seviyeler
1. **Manuel (₺0):** Sayaç fotoğrafı + OCR, manuel giriş
2. **Yarı Otomatik (₺5,000-15,000):** Akıllı priz, basit sensörler
3. **Tam Otomatik (₺20,000-50,000):** Schneider PowerTag, profesyonel IoT

#### Kabul Kriterleri
- [ ] Manuel: %95+ OCR doğruluğu
- [ ] Yarı Otomatik: Günlük okuma
- [ ] Tam Otomatik: 10 saniye aralıklarla gerçek zamanlı

### 5.2 Su Tüketimi Takibi

#### Kullanıcı Hikayeleri
- Bir yönetici olarak, su tüketimini takip edebilmeliyim
- Bir sistem olarak, sızıntı tespiti yapabilmeliyim
- Bir sistem olarak, maliyet hesaplaması yapabilmeliyim

#### Kabul Kriterleri
- [ ] Sızıntı tespiti < 1 saat
- [ ] Tüketim raporu günlük

### 5.3 Makine Bakım Takibi

#### Kullanıcı Hikayeleri
- Bir yönetici olarak, makine çalışma saatlerini takip edebilmeliyim
- Bir sistem olarak, bakım zamanı tahmini yapabilmeliyim
- Bir sistem olarak, arıza öncesi uyarı verebilmeliyim

#### Kabul Kriterleri
- [ ] Çalışma saati takibi %99 doğruluk
- [ ] Bakım tahmini 7 gün önceden

---

## 6. Fiyatlandırma ve Paketler

### 6.1 Paket Yapısı

| Paket | Aylık Fiyat | Kurulum | Hedef Müşteri |
|-------|-------------|---------|---------------|
| STARTER | ₺1,499 | ₺2,500 | Küçük kafe (50-80 sipariş/gün) |
| PROFESSIONAL | ₺3,999 | ₺7,500 | Orta restoran (150-250 sipariş/gün) |
| ENTERPRISE | ₺8,999 | ₺15,000 | Büyük restoran (400+ sipariş/gün) |
| FRANCHISE | ₺4,999/şube | ₺50,000 | Zincir (5-50 şube) |

### 6.2 Modül Eklentileri

| Modül | Aylık Fiyat | Kurulum |
|-------|-------------|---------|
| AI Agent | ₺2,499 | ₺7,500 |
| IoT Takip | ₺1,999 | ₺10,000 |
| Muhasebe Entegrasyon | ₺999 | ₺3,000 |
| Online Entegrasyon | ₺1,299 | ₺2,500 |
| White-Label App | ₺9,999 | ₺50,000 |

---

## 7. Uygulama Planı

### 7.1 Faz 1: MVP (14 Hafta)
- Hafta 1-4: Temel POS + QR Menü
- Hafta 5-8: Mutfak KDS + Masa Yönetimi
- Hafta 9-12: Stok + Raporlama
- Hafta 13-14: Test + Queen Waffle Pilot

### 7.2 Faz 2: AI Agent (12 Hafta)
- Hafta 15-18: Sesli yönetim + Rezervasyon
- Hafta 19-22: Sosyal medya + Google yorumları
- Hafta 23-26: Reklam optimizasyonu + ML

### 7.3 Faz 3: IoT Takip (8 Hafta)
- Hafta 27-30: Manuel takip (OCR + Excel)
- Hafta 31-34: Yarı otomatik (Akıllı priz)

### 7.4 Faz 4: Ölçekleme (Devam)
- Hafta 35+: Yeni müşteriler, yeni özellikler, optimizasyon

---

## 8. Başarı Kriterleri

### 8.1 Teknik Metrikler
- API response time < 200ms
- Uptime > 99.9%
- Veri tutarlılığı %100
- Sıfır veri kaybı

### 8.2 İş Metrikleri
- Yıl 1: 500 müşteri, ₺18M ARR
- Yıl 2: 1,500 müşteri, ₺54M ARR
- Yıl 3: 3,000 müşteri, ₺108M ARR

### 8.3 Müşteri Metrikleri
- Müşteri memnuniyeti > %90
- Churn rate < %5
- NPS > 50

---

## 9. Riskler ve Azaltma Stratejileri

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| Yüksek geliştirme maliyeti | Yüksek | Yüksek | Modüler yaklaşım, MVP öncelikli |
| Rakip tepkisi | Orta | Orta | Hızlı hareket, patent başvuruları |
| Müşteri adaptasyonu | Orta | Yüksek | Kapsamlı eğitim, kolay UI |
| Teknik zorluklar | Orta | Orta | Deneyimli ekip, AWS desteği |

---

## 10. Referanslar

- #[[file:00-PROJE-HARITASI.md]] - Proje haritası ve entegrasyon stratejisi
- #[[file:OZET-RAPOR.md]] - Kapsamlı özet rapor
- #[[file:full-task-listesi.md]] - Tam task listesi
- #[[file:module-breakdown.md]] - Modül detayları
- #[[file:ozellikler/README.md]] - Özellikler listesi

---

*Son Güncelleme: 13 Ocak 2026*
*Versiyon: 1.0*
*Durum: Taslak*
