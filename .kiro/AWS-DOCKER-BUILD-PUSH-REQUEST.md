# AWS Yöneticisi - Docker Build & Push Talebi

**Tarih:** 13 Ocak 2026  
**Öncelik:** 🔴 YÜKSEK  
**Durum:** BEKLEMEDE

---

## 🎯 Talep

MEGA POS API için Docker image build edip ECR'a push etmek gerekiyor.

---

## 📍 Proje Konumu

```
/Users/hasanaker/Downloads/Queen Q
```

---

## 🐳 Docker Build Komutu

```bash
cd "/Users/hasanaker/Downloads/Queen Q"

docker build \
  -t mega-pos/api:latest \
  -t mega-pos/api:v1.0.0 \
  -f apps/api/Dockerfile \
  .
```

**Beklenen Süre:** 3-5 dakika

---

## 🔐 ECR Login

```bash
aws ecr get-login-password --region eu-central-1 | \
  docker login --username AWS --password-stdin \
  986906625644.dkr.ecr.eu-central-1.amazonaws.com
```

---

## 🏷️ Tag & Push

```bash
# Tag latest
docker tag mega-pos/api:latest \
  986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest

# Tag version
docker tag mega-pos/api:v1.0.0 \
  986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:v1.0.0

# Push latest
docker push 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest

# Push version
docker push 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:v1.0.0
```

**Beklenen Süre:** 2-3 dakika

---

## ✅ Doğrulama

```bash
# ECR'da image'ları listele
aws ecr describe-images \
  --repository-name mega-pos/api \
  --region eu-central-1 \
  --query 'imageDetails[*].[imageTags[0],imagePushedAt,imageSizeInBytes]' \
  --output table
```

**Beklenen Çıktı:**
```
---------------------------------------------------------
|                   DescribeImages                      |
+----------+---------------------------+----------------+
|  latest  |  2026-01-13T11:20:00.000Z |  ~150MB       |
|  v1.0.0  |  2026-01-13T11:20:00.000Z |  ~150MB       |
+----------+---------------------------+----------------+
```

---

## 🚀 Push Sonrası Otomatik Olacaklar

1. **Kubernetes Pod'ları Başlayacak**
   ```bash
   kubectl get pods -n mega-pos -w
   ```
   
   Pod'lar `Pending` → `ContainerCreating` → `Running` durumuna geçecek.

2. **ALB Health Check Başlayacak**
   ```bash
   kubectl get ingress -n mega-pos
   ```
   
   ALB oluşacak ve health check başlayacak.

3. **API Erişilebilir Olacak**
   ```bash
   curl https://cafe.hsdcore.com/api/health
   ```
   
   Response: `{"status":"ok"}`

---

## 📊 Mevcut Durum

### Kubernetes Kaynakları (HAZIR ✅)
- ✅ Namespace: mega-pos
- ✅ Secret: mega-pos-secrets
- ✅ ServiceAccount: mega-pos-api
- ✅ Deployment: mega-pos-api (2 replicas)
- ✅ Service: mega-pos-api
- ✅ Ingress: mega-pos-ingress

### Pod Durumu (BEKLEMEDE 🔴)
```
NAME                           READY   STATUS    RESTARTS   AGE
mega-pos-api-7cf448797-9lwnx   0/1     Pending   0          10m
mega-pos-api-7cf448797-cgrsv   0/1     Pending   0          10m
```

**Neden Pending?** ECR'da image yok, pod image'ı pull edemiyor.

### Frontend (ÇALIŞIYOR ✅)
- ✅ https://cafe.hsdcore.com/boss/
- ✅ https://cafe.hsdcore.com/pos/
- ✅ https://cafe.hsdcore.com/waiter/
- ✅ https://cafe.hsdcore.com/kitchen/
- ✅ https://cafe.hsdcore.com/menu/

---

## 🔍 Dockerfile İçeriği

**Dosya:** `apps/api/Dockerfile`

```dockerfile
# Multi-stage build for production
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm ci --workspace=apps/api --workspace=packages/shared

# Copy source code
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Build shared package first
RUN npm run build --workspace=packages/shared

# Build API
RUN npm run build --workspace=apps/api

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

RUN npm ci --workspace=apps/api --workspace=packages/shared --omit=dev

# Copy built files from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Copy migrations
COPY apps/api/src/migrations ./apps/api/src/migrations

# Create uploads directory
RUN mkdir -p /app/apps/api/uploads/products

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "apps/api/dist/main.js"]
```

---

## 💡 Notlar

- **Build Context:** Proje root dizini (`/Users/hasanaker/Downloads/Queen Q`)
- **Dockerfile:** `apps/api/Dockerfile`
- **Multi-stage build:** Builder + Production (optimize edilmiş)
- **Final Image Size:** ~150MB (Alpine Linux)
- **Health Check:** Built-in (30s interval)

---

## 🆘 Sorun Giderme

### Build hatası alırsan
```bash
# Cache'siz build
docker build --no-cache \
  -t mega-pos/api:latest \
  -f apps/api/Dockerfile \
  .
```

### ECR login hatası
```bash
# AWS credentials kontrol et
aws sts get-caller-identity

# Region kontrol et
aws configure get region
```

### Push hatası
```bash
# ECR repository var mı kontrol et
aws ecr describe-repositories \
  --repository-names mega-pos/api \
  --region eu-central-1
```

---

## 📞 İletişim

Build tamamlandığında bana haber ver, pod durumunu kontrol edeyim!

---

**Hazırlayan:** Kiro Development Agent  
**Tarih:** 13 Ocak 2026, 11:20
