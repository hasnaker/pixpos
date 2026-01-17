# MEGA POS Deployment Checklist

**Tarih:** 13 Ocak 2026  
**Hedef:** cafe.hsdcore.com

---

## ✅ AWS Altyapısı (TAMAMLANDI)

- [x] RDS PostgreSQL oluşturuldu
- [x] S3 Bucket oluşturuldu
- [x] CloudFront Distribution oluşturuldu
- [x] ACM SSL Certificate oluşturuldu
- [x] Route 53 DNS yapılandırıldı
- [x] Secrets Manager secret oluşturuldu
- [x] ECR Repository oluşturuldu
- [x] IAM IRSA Role oluşturuldu

---

## 📦 Kod Hazırlığı (TAMAMLANDI)

- [x] Dockerfile oluşturuldu
- [x] .dockerignore oluşturuldu
- [x] Kubernetes manifests oluşturuldu
  - [x] namespace.yaml
  - [x] service-account.yaml
  - [x] secret.yaml
  - [x] deployment.yaml
  - [x] service.yaml
  - [x] ingress.yaml
- [x] Deployment scripts oluşturuldu
  - [x] deploy-api.sh
  - [x] deploy-frontend.sh
- [x] Documentation oluşturuldu
  - [x] DEPLOYMENT.md
  - [x] QUICK-START.md

---

## 🚀 Deployment Adımları (BEKLEMEDE)

### 1. Secrets Hazırlama
```bash
# AWS Secrets Manager'dan değerleri al
aws secretsmanager get-secret-value \
  --secret-id mega-pos/production \
  --region eu-central-1

# Kubernetes secret oluştur
kubectl create secret generic mega-pos-secrets \
  --from-literal=DATABASE_URL="..." \
  --from-literal=REDIS_URL="..." \
  --from-literal=JWT_SECRET="..." \
  --from-literal=NODE_ENV="production" \
  --namespace=mega-pos
```

- [ ] Secrets Manager'dan değerler alındı
- [ ] Kubernetes secret oluşturuldu

### 2. API Deployment
```bash
./scripts/deploy-api.sh
```

- [ ] Docker image build edildi
- [ ] ECR'a push edildi
- [ ] Kubernetes manifests apply edildi
- [ ] Pod'lar çalışıyor
- [ ] Health check başarılı

### 3. Database Migration
```bash
kubectl exec -n mega-pos deploy/mega-pos-api -- \
  npm run migration:run --workspace=apps/api
```

- [ ] Migration çalıştırıldı
- [ ] Tablolar oluşturuldu

### 4. Frontend Deployment
```bash
./scripts/deploy-frontend.sh
```

- [ ] Boss build edildi ve S3'e yüklendi
- [ ] POS build edildi ve S3'e yüklendi
- [ ] Waiter build edildi ve S3'e yüklendi
- [ ] Kitchen build edildi ve S3'e yüklendi
- [ ] QR Menu build edildi ve S3'e yüklendi
- [ ] CloudFront cache invalidate edildi

### 5. Doğrulama
```bash
# API
curl https://cafe.hsdcore.com/api/health

# Frontend
curl https://cafe.hsdcore.com/boss/
curl https://cafe.hsdcore.com/pos/
```

- [ ] API health check başarılı
- [ ] Boss frontend erişilebilir
- [ ] POS frontend erişilebilir
- [ ] Waiter frontend erişilebilir
- [ ] Kitchen frontend erişilebilir
- [ ] QR Menu frontend erişilebilir

---

## 🧪 Test Senaryosu

### Boss Ekranı
- [ ] Kategori ekle
- [ ] Ürün ekle
- [ ] Masa ekle
- [ ] Yazıcı ayarla

### POS Ekranı
- [ ] Masa listesi görünüyor
- [ ] Sipariş oluştur
- [ ] Ürün ekle
- [ ] Ödeme al

### Garson Tablet
- [ ] Masa seç
- [ ] Sipariş al
- [ ] Mutfağa gönder

### Mutfak Ekranı
- [ ] Sipariş görünüyor
- [ ] Hazır işaretle

### QR Menü
- [ ] Menü görünüyor
- [ ] Garson çağır

---

## 📊 Monitoring Setup

- [ ] SigNoz dashboard kontrol edildi
- [ ] CloudWatch logs kontrol edildi
- [ ] ALB metrics kontrol edildi
- [ ] RDS metrics kontrol edildi

---

## 🔐 Güvenlik Kontrolleri

- [ ] RDS public access kapalı
- [ ] S3 bucket public access kapalı
- [ ] HTTPS zorunlu
- [ ] Secrets encrypted
- [ ] IAM roles least privilege

---

## 💰 Maliyet Kontrolü

- [ ] Karpenter node scaling çalışıyor
- [ ] Pod resource limits ayarlandı
- [ ] CloudFront cache ayarları optimize
- [ ] RDS backup retention ayarlandı

---

## 📝 Deployment Komutu (Tek Seferde)

```bash
# 1. Secrets hazırla
kubectl apply -f k8s/secret.yaml

# 2. API deploy
./scripts/deploy-api.sh

# 3. Migration
kubectl exec -n mega-pos deploy/mega-pos-api -- \
  npm run migration:run --workspace=apps/api

# 4. Frontend deploy
./scripts/deploy-frontend.sh

# 5. Test
curl https://cafe.hsdcore.com/api/health
open https://cafe.hsdcore.com/boss/
```

---

## 🎉 Başarı Kriterleri

Deployment başarılı sayılır eğer:
- ✅ Tüm pod'lar Running durumda
- ✅ Health check 200 dönüyor
- ✅ Frontend'ler erişilebilir
- ✅ Database bağlantısı çalışıyor
- ✅ WebSocket bağlantısı çalışıyor
- ✅ Test senaryosu başarılı

---

**Hazırlayan:** Development Team  
**Tarih:** 13 Ocak 2026
