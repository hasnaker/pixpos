# MEGA POS AWS Deployment Talebi

**Tarih:** 13 Ocak 2026  
**Talep Eden:** MEGA POS Development Team  
**Hedef Domain:** cafe.hsdcore.com

---

## 🎯 ÖZET

MEGA POS MVP sistemini mevcut HSD AWS altyapısına (EKS cluster: hsd-monitoring) deploy etmek istiyoruz.

---

## 📋 TALEP EDİLEN KAYNAKLAR

### 1. EKS Namespace

```bash
kubectl create namespace mega-pos
```

### 2. RDS PostgreSQL Instance

| Parametre | Değer |
|-----------|-------|
| Instance Class | db.t3.micro |
| Engine | PostgreSQL 16 |
| Database Name | megapos |
| Master Username | megapos_user |
| Storage | 20 GB gp3 |
| Multi-AZ | Hayır (test/MVP için) |
| VPC | Mevcut EKS VPC |
| Security Group | EKS node'larından 5432 port erişimi |
| Backup Retention | 7 gün |
| Public Access | Hayır (sadece VPC içinden) |

### 3. Route 53 DNS Kayıtları

| Subdomain | Hedef | Açıklama |
|-----------|-------|----------|
| cafe.hsdcore.com | ALB | Ana domain (frontend + API) |
| api.cafe.hsdcore.com | ALB | Sadece API (opsiyonel) |

### 4. S3 Bucket (Frontend Static Files)

```yaml
Bucket Name: mega-pos-frontend-hsdcore
Region: eu-central-1
Versioning: Enabled
Public Access: Block (CloudFront üzerinden erişim)

Folder Structure:
  /boss/      # Yönetim paneli
  /pos/       # Satış ekranı
  /waiter/    # Garson tablet
  /kitchen/   # Mutfak ekranı
  /menu/      # QR Menü
```

### 5. CloudFront Distribution

```yaml
Origin: S3 bucket (mega-pos-frontend-hsdcore)
Alternate Domain: cafe.hsdcore.com
SSL Certificate: ACM (*.hsdcore.com veya cafe.hsdcore.com)
Default Root Object: index.html
Error Pages: 
  - 404 → /index.html (SPA routing için)
  - 403 → /index.html
Cache Policy: CachingOptimized
Origin Access: OAI veya OAC
```

### 6. Application Load Balancer (ALB) - Ingress

```yaml
Host: cafe.hsdcore.com
SSL: ACM Certificate

Path Rules:
  /api/*      → mega-pos-api service (port 3000)
  /socket.io/* → mega-pos-api service (WebSocket)
  /*          → CloudFront (S3 static files)
```

### 7. Secrets Manager

```yaml
Secret Name: mega-pos/production

Keys:
  DATABASE_URL: postgresql://megapos_user:PASSWORD@RDS_ENDPOINT:5432/megapos
  REDIS_URL: redis://master.shared-redis.uld2os.euc1.cache.amazonaws.com:6379
  JWT_SECRET: (generate random 64 char)
  NODE_ENV: production
```

### 8. ECR Repository

```yaml
Repository Name: mega-pos/api
Scan on Push: Enabled
Image Tag Mutability: Mutable
Lifecycle Policy: Son 10 image'ı tut
```

---

## 🏗️ MİMARİ DİYAGRAM

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MEGA POS on HSD AWS                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      Route 53 DNS                                │    │
│  │                   cafe.hsdcore.com                               │    │
│  └─────────────────────────────┬───────────────────────────────────┘    │
│                                │                                         │
│              ┌─────────────────┴─────────────────┐                      │
│              ▼                                   ▼                      │
│  ┌───────────────────────┐         ┌───────────────────────┐           │
│  │     CloudFront        │         │         ALB           │           │
│  │   (Static Files)      │         │   (API + WebSocket)   │           │
│  │   /boss, /pos, etc.   │         │      /api/*           │           │
│  └───────────┬───────────┘         └───────────┬───────────┘           │
│              │                                  │                        │
│              ▼                                  ▼                        │
│  ┌───────────────────────┐    ┌────────────────────────────────────┐   │
│  │      S3 Bucket        │    │     EKS Cluster: hsd-monitoring    │   │
│  │ mega-pos-frontend     │    │                                    │   │
│  │                       │    │   ┌────────────────────────────┐   │   │
│  │  /boss/index.html     │    │   │   Namespace: mega-pos      │   │   │
│  │  /pos/index.html      │    │   │                            │   │   │
│  │  /waiter/index.html   │    │   │   ┌──────────────────┐     │   │   │
│  │  /kitchen/index.html  │    │   │   │  mega-pos-api    │     │   │   │
│  │  /menu/index.html     │    │   │   │  (NestJS)        │     │   │   │
│  │                       │    │   │   │  Port: 3000      │     │   │   │
│  └───────────────────────┘    │   │   │  Replicas: 1-3   │     │   │   │
│                               │   │   └────────┬─────────┘     │   │   │
│                               │   │            │               │   │   │
│                               │   └────────────┼───────────────┘   │   │
│                               └────────────────┼───────────────────┘   │
│                                                │                        │
│              ┌─────────────────────────────────┼─────────────────┐      │
│              │                                 │                 │      │
│              ▼                                 ▼                 ▼      │
│  ┌───────────────────────┐    ┌───────────────────┐  ┌─────────────┐   │
│  │    RDS PostgreSQL     │    │  ElastiCache      │  │  Secrets    │   │
│  │    (megapos DB)       │    │  (shared-redis)   │  │  Manager    │   │
│  │    db.t3.micro        │    │  (mevcut)         │  │             │   │
│  └───────────────────────┘    └───────────────────┘  └─────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 KUBERNETES MANIFESTS (Referans)

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mega-pos-api
  namespace: mega-pos
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mega-pos-api
  template:
    metadata:
      labels:
        app: mega-pos-api
    spec:
      containers:
      - name: api
        image: ECR_REPO_URL:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: mega-pos-secrets
              key: DATABASE_URL
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: mega-pos-secrets
              key: REDIS_URL
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mega-pos-api
  namespace: mega-pos
spec:
  type: ClusterIP
  ports:
  - port: 3000
    targetPort: 3000
  selector:
    app: mega-pos-api
```

### Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mega-pos-ingress
  namespace: mega-pos
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/certificate-arn: ACM_CERT_ARN
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTPS":443}]'
    alb.ingress.kubernetes.io/ssl-redirect: '443'
spec:
  rules:
  - host: cafe.hsdcore.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: mega-pos-api
            port:
              number: 3000
      - path: /socket.io
        pathType: Prefix
        backend:
          service:
            name: mega-pos-api
            port:
              number: 3000
```

---

## 💰 TAHMİNİ MALİYET

| Kaynak | Aylık Maliyet |
|--------|---------------|
| RDS db.t3.micro | ~$15-20 |
| S3 + CloudFront | ~$5-10 |
| ALB (paylaşımlı) | ~$5 |
| ECR | ~$1 |
| Secrets Manager | ~$1 |
| EKS Pod (general-pool) | ~$10-15 |
| **TOPLAM** | **~$40-50/ay** |

---

## ✅ CHECKLIST

AWS Yöneticisi için yapılacaklar:

- [ ] EKS namespace oluştur: `mega-pos`
- [ ] RDS PostgreSQL instance oluştur
- [ ] S3 bucket oluştur: `mega-pos-frontend-hsdcore`
- [ ] CloudFront distribution oluştur
- [ ] ACM SSL sertifikası (cafe.hsdcore.com)
- [ ] Route 53 DNS kaydı ekle
- [ ] Secrets Manager secret oluştur
- [ ] ECR repository oluştur
- [ ] Security Group kuralları ayarla
- [ ] IAM role/policy (IRSA) oluştur

---

## 📞 İLETİŞİM

Sorular için: Development Team

**Beklenen Tamamlanma:** Altyapı hazır olduğunda deployment yapılacak.

---

*Son Güncelleme: 13 Ocak 2026*
