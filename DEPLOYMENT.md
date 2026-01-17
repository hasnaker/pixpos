# MEGA POS Deployment Guide

## 🎯 Ön Koşullar

### AWS CLI
```bash
aws --version
# AWS CLI 2.x gerekli
```

### kubectl
```bash
kubectl version --client
# v1.28+ gerekli
```

### Docker
```bash
docker --version
# Docker 20.x+ gerekli
```

### EKS Cluster Access
```bash
aws eks update-kubeconfig --region eu-central-1 --name hsd-monitoring
kubectl get nodes
```

---

## 🚀 Deployment Adımları

### 1. Secrets Manager'dan Secret'ları Al

```bash
# AWS Secrets Manager'dan production secret'ları çek
aws secretsmanager get-secret-value \
  --secret-id mega-pos/production \
  --region eu-central-1 \
  --query SecretString \
  --output text | jq .
```

### 2. Kubernetes Secret'ı Güncelle

```bash
# k8s/secret.yaml dosyasındaki değerleri güncelle
# DATABASE_URL, REDIS_URL, JWT_SECRET

# Veya doğrudan kubectl ile oluştur:
kubectl create secret generic mega-pos-secrets \
  --from-literal=DATABASE_URL="postgresql://..." \
  --from-literal=REDIS_URL="redis://..." \
  --from-literal=JWT_SECRET="..." \
  --from-literal=NODE_ENV="production" \
  --namespace=mega-pos \
  --dry-run=client -o yaml | kubectl apply -f -
```

### 3. API Deployment

```bash
# Tek komutla API deploy et
./scripts/deploy-api.sh

# Veya manuel:
# 1. Docker build
docker build -t mega-pos/api:latest -f apps/api/Dockerfile .

# 2. ECR login
aws ecr get-login-password --region eu-central-1 | \
  docker login --username AWS --password-stdin \
  986906625644.dkr.ecr.eu-central-1.amazonaws.com

# 3. Tag ve push
docker tag mega-pos/api:latest \
  986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest
docker push 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest

# 4. Kubernetes apply
kubectl apply -f k8s/
```

### 4. Database Migration

```bash
# Pod içinde migration çalıştır
kubectl exec -n mega-pos deploy/mega-pos-api -- \
  npm run migration:run --workspace=apps/api
```

### 5. Frontend Deployment

```bash
# Tek komutla frontend deploy et
./scripts/deploy-frontend.sh
```

### 6. Doğrulama

```bash
# API health check
curl https://cafe.hsdcore.com/api/health

# Frontend check
curl https://cafe.hsdcore.com/boss/
curl https://cafe.hsdcore.com/pos/
curl https://cafe.hsdcore.com/waiter/
curl https://cafe.hsdcore.com/kitchen/
curl https://cafe.hsdcore.com/menu/

# Kubernetes pods
kubectl get pods -n mega-pos

# Logs
kubectl logs -n mega-pos -l app=mega-pos-api --tail=100
```

---

## 🔄 Güncelleme (Update)

### API Güncelleme
```bash
# Yeni versiyon deploy et
./scripts/deploy-api.sh v1.0.1

# Rollback (gerekirse)
kubectl rollout undo deployment/mega-pos-api -n mega-pos
```

### Frontend Güncelleme
```bash
# Frontend'i yeniden deploy et
./scripts/deploy-frontend.sh
```

---

## 🐛 Troubleshooting

### Pod başlamıyor
```bash
# Pod durumunu kontrol et
kubectl describe pod -n mega-pos -l app=mega-pos-api

# Logs
kubectl logs -n mega-pos -l app=mega-pos-api --tail=200

# Events
kubectl get events -n mega-pos --sort-by='.lastTimestamp'
```

### Database bağlantı hatası
```bash
# Pod içinden database connectivity test
kubectl exec -n mega-pos deploy/mega-pos-api -- \
  nc -zv mega-pos-db.crowkq8ykqeo.eu-central-1.rds.amazonaws.com 5432

# Security group kontrolü
aws ec2 describe-security-groups \
  --group-ids sg-0cc28d587cafde3f4 \
  --region eu-central-1
```

### Frontend 404 hatası
```bash
# S3 bucket içeriğini kontrol et
aws s3 ls s3://mega-pos-frontend-hsdcore/ --recursive

# CloudFront cache temizle
aws cloudfront create-invalidation \
  --distribution-id E2M6213CML6FZC \
  --paths "/*"
```

### ALB oluşmadı
```bash
# Ingress durumunu kontrol et
kubectl describe ingress -n mega-pos

# ALB controller logs
kubectl logs -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller
```

---

## 📊 Monitoring

### Logs
```bash
# Real-time logs
kubectl logs -n mega-pos -l app=mega-pos-api -f

# Son 1 saat
kubectl logs -n mega-pos -l app=mega-pos-api --since=1h
```

### Metrics
```bash
# Pod resource kullanımı
kubectl top pods -n mega-pos

# Node resource kullanımı
kubectl top nodes
```

### SigNoz Dashboard
```
https://signoz.hsdcore.com
```

---

## 🔐 Güvenlik

### Secrets Rotation
```bash
# Yeni JWT secret oluştur
NEW_JWT_SECRET=$(openssl rand -base64 64)

# Secrets Manager'ı güncelle
aws secretsmanager update-secret \
  --secret-id mega-pos/production \
  --secret-string "{\"JWT_SECRET\":\"$NEW_JWT_SECRET\",...}" \
  --region eu-central-1

# Kubernetes secret'ı güncelle
kubectl create secret generic mega-pos-secrets \
  --from-literal=JWT_SECRET="$NEW_JWT_SECRET" \
  --namespace=mega-pos \
  --dry-run=client -o yaml | kubectl apply -f -

# Pod'ları restart et
kubectl rollout restart deployment/mega-pos-api -n mega-pos
```

---

## 💰 Maliyet Optimizasyonu

### Karpenter Node Scaling
```bash
# Node pool durumunu kontrol et
kubectl get nodepools

# Pod'ların node assignment'ını kontrol et
kubectl get pods -n mega-pos -o wide
```

### Replica Scaling
```bash
# Replica sayısını azalt (gece)
kubectl scale deployment/mega-pos-api -n mega-pos --replicas=1

# Replica sayısını artır (gündüz)
kubectl scale deployment/mega-pos-api -n mega-pos --replicas=3
```

---

## 📝 Notlar

- **Database Backup:** RDS otomatik backup 7 gün retention
- **Image Retention:** ECR'da son 10 image tutulur
- **CloudFront Cache:** 24 saat TTL
- **Pod Resources:** 256Mi-512Mi memory, 100m-500m CPU
- **Health Checks:** 30s interval, 3 failure threshold

---

## 🆘 Acil Durum

### Tüm sistemi durdur
```bash
kubectl scale deployment/mega-pos-api -n mega-pos --replicas=0
```

### Tüm sistemi başlat
```bash
kubectl scale deployment/mega-pos-api -n mega-pos --replicas=2
```

### Namespace'i tamamen sil (DİKKAT!)
```bash
kubectl delete namespace mega-pos
# Bu komut tüm kaynakları siler!
```

---

**Son Güncelleme:** 13 Ocak 2026
