# MEGA POS - Docker Build & Push Talebi

**Tarih:** 13 Ocak 2026  
**Durum:** 🔴 BEKLEMEDE

---

## 📦 Gerekli İşlem

Docker image'ı build edip ECR'a push etmek gerekiyor.

---

## 🛠️ Komutlar

### 1. Docker Build
```bash
cd /Users/hasanaker/Downloads/Queen\ Q

docker build -t mega-pos/api:latest -f apps/api/Dockerfile .
```

### 2. ECR Login
```bash
aws ecr get-login-password --region eu-central-1 | \
  docker login --username AWS --password-stdin \
  986906625644.dkr.ecr.eu-central-1.amazonaws.com
```

### 3. Tag Image
```bash
docker tag mega-pos/api:latest \
  986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest

docker tag mega-pos/api:latest \
  986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:v1.0.0
```

### 4. Push to ECR
```bash
docker push 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest
docker push 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:v1.0.0
```

---

## ✅ Doğrulama

```bash
# ECR'da image var mı kontrol et
aws ecr describe-images \
  --repository-name mega-pos/api \
  --region eu-central-1
```

---

## 📊 Mevcut Durum

### Kubernetes Kaynakları
- ✅ Namespace: mega-pos (oluşturuldu)
- ✅ Secret: mega-pos-secrets (oluşturuldu)
- ✅ ServiceAccount: mega-pos-api (oluşturuldu)
- ✅ Deployment: mega-pos-api (oluşturuldu)
- ✅ Service: mega-pos-api (oluşturuldu)
- ✅ Ingress: mega-pos-ingress (oluşturuldu)

### Pod Durumu
```
NAME                           READY   STATUS    RESTARTS   AGE
mega-pos-api-7cf448797-9lwnx   0/1     Pending   0          21s
mega-pos-api-7cf448797-cgrsv   0/1     Pending   0          22s
```

**Neden Pending?** Docker image ECR'da yok, pod başlayamıyor.

---

## 🎯 Sonraki Adım

Docker image ECR'a push edildikten sonra:

```bash
# Pod'lar otomatik olarak başlayacak
kubectl get pods -n mega-pos -w

# Veya manuel restart
kubectl rollout restart deployment/mega-pos-api -n mega-pos
```

---

**Hazırlayan:** Kiro Development Agent  
**Tarih:** 13 Ocak 2026
