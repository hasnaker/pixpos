# AWS Multi-Platform Docker Build Request

**Tarih:** 13 Ocak 2026  
**Öncelik:** 🔴 ACİL  
**Durum:** BEKLİYOR

---

## 🎯 Sorun

Docker image Mac'te (ARM64) build edilmiş, EKS node'ları AMD64 (x86_64) kullanıyor.

**Hata:**
```
Failed to pull image: no match for platform in manifest: not found
```

## ⚠️ ÖNEMLİ

Mac'te Docker yok! AWS Yöneticisi bu işlemi yapmalı.

**Tamamlanan adımlar:**
- ✅ Pending pod'lar silindi
- ✅ Deployment 0'a scale edildi
- ⏳ Docker build bekliyor (AWS Yöneticisi yapacak)

---

## 📋 Yapılacaklar

### 1. Mevcut Pod'ları Temizle
```bash
# Önce tüm pending pod'ları sil
kubectl delete pods -n mega-pos --field-selector=status.phase=Pending

# Deployment'ı scale down et
kubectl scale deployment mega-pos-api -n mega-pos --replicas=0
```

### 2. Multi-Platform Docker Build (AMD64)
```bash
cd /Users/hasanaker/Downloads/Queen\ Q

# Docker buildx kullan (multi-platform için)
docker buildx create --name multiplatform --use 2>/dev/null || docker buildx use multiplatform

# AMD64 için build et ve push et
docker buildx build \
  --platform linux/amd64 \
  -f apps/api/Dockerfile \
  -t 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest \
  --push \
  .
```

### 3. Alternatif: Sadece AMD64 Build
```bash
# ECR Login
aws ecr get-login-password --region eu-central-1 | \
  docker login --username AWS --password-stdin 986906625644.dkr.ecr.eu-central-1.amazonaws.com

# AMD64 için build (--platform flag ile)
docker build \
  --platform linux/amd64 \
  -f apps/api/Dockerfile \
  -t 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest \
  .

# Push
docker push 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest
```

### 4. Secret Güncelle (Gerçek Şifre ile)
```bash
# AWS Secrets Manager'dan şifreyi al
DB_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id mega-pos/production \
  --query 'SecretString' \
  --output text | jq -r '.password')

# Mevcut secret'ı sil
kubectl delete secret mega-pos-secrets -n mega-pos

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

### 5. Deployment'ı Yeniden Başlat
```bash
# Scale up
kubectl scale deployment mega-pos-api -n mega-pos --replicas=2

# Durumu izle
kubectl get pods -n mega-pos -w
```

### 6. Doğrulama
```bash
# Pod durumu
kubectl get pods -n mega-pos

# Logları kontrol et
kubectl logs -n mega-pos -l app=mega-pos-api --tail=50

# Health check
kubectl exec -n mega-pos deployment/mega-pos-api -- wget -qO- http://localhost:3000/health
```

---

## 🔧 Yapılan Kod Değişiklikleri

### 1. `apps/api/src/app.module.ts` - SSL Eklendi
```typescript
ssl: configService.get('NODE_ENV') === 'production' ? {
  rejectUnauthorized: false
} : false,
```

### 2. `k8s/secret.yaml` - Ayrı DB Değişkenleri
```yaml
DB_HOST: "mega-pos-db.crowkq8ykqeo.eu-central-1.rds.amazonaws.com"
DB_PORT: "5432"
DB_USERNAME: "megapos_user"
DB_PASSWORD: "CHANGE_ME"
DB_DATABASE: "megapos"
```

### 3. `k8s/deployment.yaml` - Env Vars Güncellendi
- DATABASE_URL yerine ayrı DB_* değişkenleri kullanılıyor

---

## ✅ Beklenen Sonuç

1. ✅ Docker image AMD64 platformu için build edildi
2. ✅ ECR'a push edildi
3. ✅ Secret gerçek şifre ile güncellendi
4. ✅ Pod'lar Running durumunda
5. ✅ RDS bağlantısı başarılı (SSL ile)
6. ✅ Health check geçiyor

---

**Hazırlayan:** Chat Kiro  
**Hedef:** AWS Yöneticisi  
**Tarih:** 13 Ocak 2026
