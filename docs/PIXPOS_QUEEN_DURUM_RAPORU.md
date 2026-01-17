# PIXPOS - Queen Müşteri Durum Raporu

**Tarih:** 17 Ocak 2026  
**Proje:** PIXPOS SaaS POS Platform  
**İlk Müşteri:** Queen Waffle & Coffee

---

## 🎯 ÖZET

PIXPOS, Türkiye'nin Square'i olmayı hedefleyen multi-tenant SaaS POS platformu. Queen Waffle ilk pilot müşteri olarak sistemi kullanıyor.

---

## 🏗️ MİMARİ

### Domain Yapısı
| Domain | Kullanım | Durum |
|--------|----------|-------|
| `*.pixpos.cloud` | POS, Boss, Waiter, Kitchen uygulamaları | ✅ Aktif |
| `*.pixpos.site` | QR Menüler | ✅ Aktif |
| `api.pixpos.cloud` | Backend API | ✅ Aktif |

### Queen URL'leri
```
POS:      https://queen.pixpos.cloud/pos
Boss:     https://queen.pixpos.cloud/boss
Waiter:   https://queen.pixpos.cloud/waiter
Kitchen:  https://queen.pixpos.cloud/kitchen
Display:  https://queen.pixpos.cloud/pos/display (müşteri ekranı)
QR Menü:  https://queen.pixpos.site
```

---

## 💾 VERİTABANI

### Production (AWS RDS)
```yaml
Host: mega-pos-db.crowkq8ykqeo.eu-central-1.rds.amazonaws.com
Port: 5432
Database: megapos
Engine: PostgreSQL 16.10
Instance: db.t3.micro
Storage: 20 GB
Status: ✅ Available
```

### Local Development
```yaml
# docker-compose.yml
PostgreSQL: localhost:5432
Redis: localhost:6379
Database: megapos
User: postgres
Password: postgres
```

### Tablolar (Mevcut)
- `categories` - Ürün kategorileri
- `products` - Ürünler
- `tables` - Masalar
- `zones` - Bölgeler (Salon, Teras, Bahçe)
- `orders` - Siparişler
- `order_items` - Sipariş kalemleri
- `payments` - Ödemeler
- `users` - Kullanıcılar
- `printers` - Yazıcılar
- `menus` - QR Menüler
- `settings` - İşletme ayarları

---

## ☁️ AWS ALTYAPISI

### CloudFront Distributions

#### 1. PIXPOS Apps (*.pixpos.cloud)
```yaml
Distribution ID: E1WY916L5H2MY9
Domain: d1nifxv09gomqk.cloudfront.net
Aliases: *.pixpos.cloud
S3 Bucket: pixpos-apps-986906625644
CloudFront Function: pixpos-tenant-routing
```

#### 2. QR Menu (*.pixpos.site)
```yaml
Distribution ID: E2XXXXXXXXXX
Domain: dXXXXXXXX.cloudfront.net
Aliases: *.pixpos.site, pixpos.site
S3 Bucket: pixpos-qr-menu-986906625644
```

### S3 Bucket Yapısı
```
pixpos-apps-986906625644/
├── queen/
│   ├── boss/          # Boss Panel
│   │   ├── index.html
│   │   └── assets/
│   ├── pos/           # POS Uygulaması
│   │   ├── index.html
│   │   └── assets/
│   └── waiter/        # Garson Tablet
│       ├── index.html
│       └── assets/
├── cadininevi/        # (Gelecek müşteri)
│   └── ...
```

### ACM Sertifikaları
```yaml
# us-east-1 (CloudFront için zorunlu)
*.pixpos.cloud: arn:aws:acm:us-east-1:986906625644:certificate/8ac3816c-652f-4420-86af-e61aa1f03e27
*.pixpos.site:  arn:aws:acm:us-east-1:986906625644:certificate/XXXXXXXX

# eu-central-1 (API/ALB için)
api.pixpos.cloud: arn:aws:acm:eu-central-1:986906625644:certificate/XXXXXXXX
```

### Route 53 DNS
```yaml
Hosted Zone: pixpos.cloud
Records:
  - *.pixpos.cloud → CloudFront (E1WY916L5H2MY9)
  - api.pixpos.cloud → EC2/ALB (3.64.134.129)

Hosted Zone: pixpos.site
Records:
  - *.pixpos.site → CloudFront
  - pixpos.site → CloudFront
```

### EKS Cluster
```yaml
Cluster: hsd-monitoring
Region: eu-central-1
K8s Version: 1.31
Namespace: mega-pos (veya pixpos)
VPC: vpc-05489cdddb3dfc143
```

### ECR Repository
```yaml
URI: 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api
Latest Tag: latest (294 MB)
```

---

## 📱 UYGULAMALAR

### 1. POS (apps/pos) - Port 3003
- ✅ Masa planı
- ✅ Sipariş alma
- ✅ Ödeme ekranı
- ✅ Müşteri ekranı (/display)
- ✅ Electron EXE desteği (Windows)
- ✅ Yazıcı tarama (Electron'da lokal ağ tarama)
- ✅ Offline cache desteği (localStorage)

### 2. Boss Panel (apps/boss) - Port 3002
- ✅ Dashboard
- ✅ Ürün yönetimi
- ✅ Kategori yönetimi
- ✅ Masa/Bölge yönetimi
- ✅ Raporlar
- ✅ Ayarlar
- ✅ Yazıcı tarama butonu

### 3. Garson Tablet (apps/waiter) - Port 3004
- ✅ Masa listesi
- ✅ Sipariş alma
- ✅ Android APK desteği (Capacitor)
- ✅ Offline cache desteği (localStorage)
- ✅ Offline sipariş queue (internet gelince sync)
- ✅ Offline indicator component

### 4. Mutfak Ekranı (apps/kitchen) - Port 3005
- ✅ Sipariş kartları
- ✅ Hazır işaretleme
- ✅ WebSocket real-time

### 5. QR Menü (apps/qr-menu) - Port 3006
- ✅ Menü görüntüleme
- ✅ Kategori filtreleme
- ✅ Ürün detayı

### 6. API (apps/api) - Port 3001
- ✅ NestJS + TypeORM
- ✅ PostgreSQL bağlantısı
- ✅ WebSocket (Socket.io)
- ✅ Yazıcı entegrasyonu
- ✅ OKC/Ingenico entegrasyonu

---

## 🔒 GÜVENLİK

### Web Erişim Kısıtlamaları
CloudFront function ile POS ve Waiter web erişimi engellendi:
- `/pos` → `/boss`'a yönlendirilir
- `/waiter` → "APK gerekli" mesajı gösterilir
- Sadece Boss, Kitchen ve QR Menu web'den erişilebilir
- POS sadece EXE ile, Waiter sadece APK ile kullanılabilir

---

## 🔧 CLOUDFRONT FUNCTION

Tenant routing için CloudFront Function kullanılıyor:

```javascript
// scripts/cf-function-tenant-routing.js
function handler(event) {
    var request = event.request;
    var host = request.headers.host.value;
    var uri = request.uri;
    
    // queen.pixpos.cloud -> tenant = "queen"
    var tenant = host.split('.')[0];
    
    // /boss, /pos, /waiter, /kitchen, /display
    var app = 'pos'; // default
    if (uri.startsWith('/boss')) app = 'boss';
    else if (uri.startsWith('/waiter')) app = 'waiter';
    else if (uri.startsWith('/kitchen')) app = 'kitchen';
    
    // Static asset veya SPA route
    var hasExtension = uri.lastIndexOf('.') > uri.lastIndexOf('/');
    
    if (hasExtension) {
        request.uri = '/' + tenant + uri;
    } else {
        request.uri = '/' + tenant + '/' + app + '/index.html';
    }
    
    return request;
}
```

---

## 📦 BUILD & DEPLOY

### Frontend Deploy
```bash
# Build
cd apps/pos && pnpm build
cd apps/boss && pnpm build
cd apps/waiter && pnpm build

# S3'e yükle
aws s3 sync apps/pos/dist s3://pixpos-apps-986906625644/queen/pos/ --delete
aws s3 sync apps/boss/dist s3://pixpos-apps-986906625644/queen/boss/ --delete
aws s3 sync apps/waiter/dist s3://pixpos-apps-986906625644/queen/waiter/ --delete

# CloudFront cache temizle
aws cloudfront create-invalidation --distribution-id E1WY916L5H2MY9 --paths "/*"
```

### API Deploy
```bash
# Docker build
docker build -t mega-pos/api:latest -f apps/api/Dockerfile .

# ECR push
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 986906625644.dkr.ecr.eu-central-1.amazonaws.com
docker tag mega-pos/api:latest 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest
docker push 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest

# K8s deploy
kubectl apply -f k8s/pixpos/
kubectl rollout restart deployment/pixpos-api -n pixpos
```

### Android APK Build
```bash
cd apps/waiter
pnpm build
pnpm exec cap sync android
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

### Windows EXE Build
```bash
cd apps/pos
pnpm build
pnpm run electron:build
# EXE: dist-electron/PIXPOS-Setup-1.0.0.exe
```

---

## 🔑 ENV VARIABLES

### Production (.env.production)
```bash
# apps/pos/.env.production
VITE_API_URL=https://api.pixpos.cloud/api
VITE_WS_URL=https://api.pixpos.cloud

# apps/boss/.env.production
VITE_API_URL=https://api.pixpos.cloud/api
VITE_WS_URL=https://api.pixpos.cloud

# apps/qr-menu/.env.production
VITE_API_URL=https://api.pixpos.cloud
```

### API Environment
```bash
DB_HOST=mega-pos-db.crowkq8ykqeo.eu-central-1.rds.amazonaws.com
DB_PORT=5432
DB_DATABASE=megapos
DB_USERNAME=megapos_user
DB_PASSWORD=***
NODE_ENV=production
```

---

## ⚠️ EKSİKLER (Multi-tenant için)

### Kritik
1. ❌ `organization_id` tüm tablolarda yok
2. ❌ Tenant middleware yok
3. ❌ JWT'de tenant bilgisi yok
4. ❌ Onboarding flow yok
5. ❌ Billing/subscription yok

### Orta Öncelik
6. ❌ Admin panel (tüm tenant'ları yönet)
7. ❌ White-label ayarları (logo, renk)
8. ❌ Custom domain desteği

### Düşük Öncelik
9. ❌ API rate limiting per tenant
10. ❌ Usage analytics per tenant

---

## 📊 MALİYET TAHMİNİ

| Kaynak | Aylık |
|--------|-------|
| RDS db.t3.micro | ~$15 |
| EC2/EKS | ~$60 |
| CloudFront | ~$20 |
| S3 | ~$5 |
| Route 53 | ~$2 |
| **TOPLAM** | **~$100/ay** |

---

## 📁 ÖNEMLİ DOSYALAR

```
/
├── apps/
│   ├── api/                    # NestJS Backend
│   ├── pos/                    # POS Uygulaması
│   ├── boss/                   # Yönetim Paneli
│   ├── waiter/                 # Garson Tablet
│   │   └── android/            # Android APK projesi
│   ├── kitchen/                # Mutfak Ekranı
│   └── qr-menu/                # QR Menü
├── k8s/
│   └── pixpos/                 # Kubernetes manifests
├── scripts/
│   ├── cf-function-tenant-routing.js
│   ├── pixpos-cloud-cf-config.json
│   └── aws/                    # AWS config dosyaları
├── docs/
│   ├── PIXPOS_AWS_DEPLOYMENT_GUIDE.md
│   ├── PIXPOS_DEPLOYMENT_HANDOFF.md
│   ├── PIXPOS_AWS_KIRO_YANITLARI.md
│   └── SQUARE_BUSINESS_MODEL_ANALYSIS.md
└── docker-compose.yml          # Local development
```

---

## 🚀 SONRAKİ ADIMLAR

1. **Multi-tenant altyapı** - organization_id, tenant middleware
2. **Onboarding flow** - Yeni müşteri kayıt
3. **Billing** - iyzico/Stripe entegrasyonu
4. **Admin panel** - Tüm tenant'ları yönet
5. **Ödeme entegrasyonu** - POS'ta kart okuyucu

---

**Hazırlayan:** Kiro  
**Tarih:** 17 Ocak 2026
