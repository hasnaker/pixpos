# AWS Docker Rebuild Request - RDS SSL Fix

**Tarih:** 13 Ocak 2026  
**Öncelik:** YÜKSEK  
**Durum:** 🔴 BEKLİYOR

---

## 🎯 İstek

MEGA POS API Docker image'ını yeniden build et ve ECR'a push et.

**Neden:** TypeORM konfigürasyonuna SSL desteği eklendi. RDS bağlantı sorunu çözülecek.

---

## 📋 Yapılacaklar

### 1. Docker Build & Push
```bash
cd /Users/hasanaker/Downloads/Queen\ Q

# Build
docker build -f apps/api/Dockerfile -t mega-pos-api:latest .

# Tag
docker tag mega-pos-api:latest 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest

# ECR Login
aws ecr get-login-password --region eu-central-1 | \
  docker login --username AWS --password-stdin 986906625644.dkr.ecr.eu-central-1.amazonaws.com

# Push
docker push 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest
```

### 2. Kubernetes Secret Güncelle
```bash
# Mevcut secret'ı sil
kubectl delete secret mega-pos-secrets -n mega-pos

# AWS Secrets Manager'dan şifreyi al
DB_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id mega-pos/production \
  --query 'SecretString' \
  --output text | jq -r '.password')

# Yeni secret oluştur
kubectl create secret generic mega-pos-secrets -n mega-pos \
  --from-literal=DB_HOST="mega-pos-db.crowkq8ykqeo.eu-central-1.rds.amazonaws.com" \
  --from-literal=DB_PORT="5432" \
  --from-literal=DB_USERNAME="megapos_user" \
  --from-literal=DB_PASSWORD="$DB_PASSWORD" \
  --from-literal=DB_DATABASE="megapos" \
  --from-literal=REDIS_URL="redis://master.shared-redis.uld2os.euc1.cache.amazonaws.com:6379" \
  --from-literal=JWT_SECRET="mega-pos-jwt-secret-2026" \
  --from-literal=NODE_ENV="production"
```

### 3. Deployment Güncelle
```bash
# Yeni manifest'i uygula
kubectl apply -f k8s/deployment.yaml

# Pod'ları yeniden başlat
kubectl rollout restart deployment/mega-pos-api -n mega-pos

# Durumu izle
kubectl rollout status deployment/mega-pos-api -n mega-pos
```

### 4. Doğrulama
```bash
# Pod durumunu kontrol et
kubectl get pods -n mega-pos

# Log'ları kontrol et
kubectl logs -n mega-pos -l app=mega-pos-api --tail=50

# Database bağlantısını test et
kubectl exec -n mega-pos deployment/mega-pos-api -- wget -qO- http://localhost:3000/health
```

---

## 🔧 Yapılan Değişiklikler

### 1. `apps/api/src/app.module.ts`
```typescript
// SSL desteği eklendi
ssl: configService.get('NODE_ENV') === 'production' ? {
  rejectUnauthorized: false
} : false,
```

### 2. `k8s/secret.yaml`
```yaml
# DATABASE_URL yerine ayrı değişkenler
DB_HOST: "mega-pos-db.crowkq8ykqeo.eu-central-1.rds.amazonaws.com"
DB_PORT: "5432"
DB_USERNAME: "megapos_user"
DB_PASSWORD: "CHANGE_ME"
DB_DATABASE: "megapos"
```

### 3. `k8s/deployment.yaml`
```yaml
# Environment variables güncellendi
- name: DB_HOST
  valueFrom:
    secretKeyRef:
      name: mega-pos-secrets
      key: DB_HOST
# ... (diğer DB_* değişkenleri)
```

---

## ✅ Beklenen Sonuç

- ✅ Docker image başarıyla build edildi
- ✅ ECR'a push edildi
- ✅ Kubernetes secret güncellendi
- ✅ Deployment güncellendi
- ✅ Pod'lar çalışıyor (Running)
- ✅ RDS bağlantısı başarılı
- ✅ Health check geçiyor

---

## 📊 Doğrulama Komutları

```bash
# Pod durumu
kubectl get pods -n mega-pos
# Beklenen: Running (2/2)

# Log kontrolü
kubectl logs -n mega-pos -l app=mega-pos-api --tail=20
# Beklenen: "Database connected successfully"

# Health check
kubectl exec -n mega-pos deployment/mega-pos-api -- wget -qO- http://localhost:3000/health
# Beklenen: {"status":"ok","database":"connected"}

# Service test
kubectl run -n mega-pos test-pod --rm -it --image=curlimages/curl -- \
  curl http://mega-pos-api:3000/health
# Beklenen: {"status":"ok"}
```

---

## 🚨 Sorun Çıkarsa

### Hata: Image pull failed
```bash
# ECR'da image var mı kontrol et
aws ecr describe-images \
  --repository-name mega-pos/api \
  --region eu-central-1
```

### Hata: Secret not found
```bash
# Secret'ı kontrol et
kubectl get secret mega-pos-secrets -n mega-pos -o yaml
```

### Hata: Pod still crashing
```bash
# Detaylı log al
kubectl logs -n mega-pos -l app=mega-pos-api --tail=100 --previous

# Pod describe
kubectl describe pod -n mega-pos -l app=mega-pos-api
```

---

**Hazırlayan:** Chat Kiro  
**Hedef:** AWS Yöneticisi  
**Tarih:** 13 Ocak 2026

