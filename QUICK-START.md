# MEGA POS - Quick Start

## 🚀 Hızlı Deployment (5 Dakika)

### Ön Hazırlık
```bash
# 1. EKS cluster'a bağlan
aws eks update-kubeconfig --region eu-central-1 --name hsd-monitoring

# 2. Secrets'ları hazırla (AWS Secrets Manager'dan al)
kubectl create secret generic mega-pos-secrets \
  --from-literal=DATABASE_URL="postgresql://megapos_user:PASSWORD@mega-pos-db.crowkq8ykqeo.eu-central-1.rds.amazonaws.com:5432/megapos" \
  --from-literal=REDIS_URL="redis://master.shared-redis.uld2os.euc1.cache.amazonaws.com:6379" \
  --from-literal=JWT_SECRET="$(openssl rand -base64 64)" \
  --from-literal=NODE_ENV="production" \
  --namespace=mega-pos \
  --dry-run=client -o yaml > k8s/secret-generated.yaml

kubectl apply -f k8s/secret-generated.yaml
```

### API Deploy
```bash
./scripts/deploy-api.sh
```

### Frontend Deploy
```bash
./scripts/deploy-frontend.sh
```

### Test
```bash
# API
curl https://cafe.hsdcore.com/api/health

# Frontend
open https://cafe.hsdcore.com/boss/
```

## 🎯 URL'ler

| Uygulama | URL |
|----------|-----|
| Boss (Yönetim) | https://cafe.hsdcore.com/boss/ |
| POS (Satış) | https://cafe.hsdcore.com/pos/ |
| Waiter (Garson) | https://cafe.hsdcore.com/waiter/ |
| Kitchen (Mutfak) | https://cafe.hsdcore.com/kitchen/ |
| QR Menu | https://cafe.hsdcore.com/menu/ |
| API | https://cafe.hsdcore.com/api/ |

## 📊 Monitoring

```bash
# Pods
kubectl get pods -n mega-pos

# Logs
kubectl logs -n mega-pos -l app=mega-pos-api -f

# Ingress
kubectl get ingress -n mega-pos
```

## 🔄 Güncelleme

```bash
# API güncelle
./scripts/deploy-api.sh

# Frontend güncelle
./scripts/deploy-frontend.sh
```

## 🐛 Sorun Giderme

```bash
# Pod durumu
kubectl describe pod -n mega-pos -l app=mega-pos-api

# Logs
kubectl logs -n mega-pos -l app=mega-pos-api --tail=100

# Events
kubectl get events -n mega-pos --sort-by='.lastTimestamp'
```

Detaylı bilgi için: [DEPLOYMENT.md](./DEPLOYMENT.md)
