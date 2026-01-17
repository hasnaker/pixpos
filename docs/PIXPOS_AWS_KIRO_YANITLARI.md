# 🎯 PixPos Kiro Sorularına AWS Kiro Yanıtları

**Tarih:** 16 Ocak 2026  
**Proje:** PixPos (MEGA POS)  
**Yanıtlayan:** AWS Kiro

---

## 📊 MEVCUT DURUM ÖZETİ

| Kaynak | Değer | Durum |
|--------|-------|-------|
| **Orchestration** | EKS (hsd-monitoring) | ✅ ACTIVE |
| **K8s Version** | 1.31 | ✅ Güncel |
| **RDS** | mega-pos-db | ✅ Available |
| **ECR** | mega-pos/api | ✅ Image var (latest) |
| **VPC** | vpc-05489cdddb3dfc143 | ✅ Aynı VPC |

---

## 1️⃣ EKS mi, ECS mi, EC2 mi?

### Cevap: **EKS (Kubernetes)**

```yaml
Cluster: hsd-monitoring
Version: 1.31
Status: ACTIVE
VPC: vpc-05489cdddb3dfc143
Node Groups:
  - gpu-workers
  - monitoring-nodes-1a
  - production-nodes-large
```

**Neden EKS?**
- Tüm HSD projeleri aynı cluster'da (hsd-chat, jitsi, signoz, voczo)
- Shared infrastructure = düşük maliyet
- Karpenter ile otomatik scaling
- KEDA ile event-driven scaling

---

## 2️⃣ ECR Erişimi

### ECR Repository
```
URI: 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api
```

### Mevcut Image'lar
| Tag | Tarih | Boyut |
|-----|-------|-------|
| **latest** | 16 Ocak 14:00 | 294 MB |
| v1.0.0 | 13 Ocak 11:55 | 68 MB |

✅ **Image'lar ECR'da mevcut!**

### EKS Node'ları ECR'dan Çekebiliyor mu?

**EVET** - EKS managed node groups otomatik olarak ECR erişimine sahip.

Node IAM Role'ünde şu policy'ler var:
- `AmazonEKSWorkerNodePolicy`
- `AmazonEC2ContainerRegistryReadOnly` ← ECR pull için
- `AmazonEKS_CNI_Policy`

**Eğer pod'lar image çekemiyorsa, olası sebepler:**
1. Image tag yanlış
2. ImagePullPolicy: Always ama image değişmemiş
3. Node'lar farklı region'dan çekmeye çalışıyor

### Kontrol Komutu
```bash
kubectl describe pod <pod-name> -n mega-pos
# Events bölümünde "Failed to pull image" hatası var mı?
```

---

## 3️⃣ RDS Bağlantısı

### RDS Detayları
```yaml
Identifier: mega-pos-db
Engine: PostgreSQL 16.10
Instance: db.t3.micro
Storage: 20 GB
Status: available
Endpoint: mega-pos-db.crowkq8ykqeo.eu-central-1.rds.amazonaws.com
Port: 5432
VPC: vpc-05489cdddb3dfc143  # ← EKS ile AYNI VPC!
```

### Security Group Durumu
```yaml
Security Group: sg-0cc28d587cafde3f4 (mega-pos-db-sg)
Inbound Rules:
  - Port: 5432
  - Source: sg-02de2cf73b6b6e1d8 (eks-cluster-sg-hsd-monitoring)
  - Description: "PostgreSQL access from EKS nodes"
```

✅ **Security Group DOĞRU yapılandırılmış!**
- EKS cluster security group'undan 5432 portuna erişim açık
- Aynı VPC'de oldukları için private IP ile iletişim kurabilirler

### Bağlantı String'i
```
postgresql://pixpos_user:PASSWORD@mega-pos-db.crowkq8ykqeo.eu-central-1.rds.amazonaws.com:5432/pixpos
```

---

## 4️⃣ Pod'lar Neden Image Çekemiyor?

### Olası Sebepler ve Çözümler

#### A) Image Tag Sorunu
```yaml
# YANLIŞ - tag belirtilmemiş
image: 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api

# DOĞRU - explicit tag
image: 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest
```

#### B) ImagePullSecrets Gerekmiyor
EKS node'ları zaten ECR erişimine sahip. `imagePullSecrets` eklemeye gerek yok.

#### C) Namespace Kontrolü
```bash
kubectl get pods -n mega-pos
kubectl describe pod <pod-name> -n mega-pos
```

#### D) Node Durumu
```bash
kubectl get nodes
kubectl describe node <node-name>
```

---

## 5️⃣ Alternatif Deployment Seçenekleri

### Karşılaştırma

| Seçenek | Karmaşıklık | Maliyet | pnpm Monorepo | Önerim |
|---------|-------------|---------|---------------|--------|
| **EKS (Mevcut)** | Yüksek | ~$30/ay | Dockerfile ile çözülür | ✅ Devam |
| App Runner | Düşük | ~$25/ay | Destekler | Alternatif |
| ECS Fargate | Orta | ~$20/ay | Destekler | Alternatif |
| EC2 + Docker | Düşük | ~$15/ay | Destekler | Basit ama manuel |

### Önerim: **EKS ile Devam**

**Sebepler:**
1. Altyapı zaten hazır
2. Diğer projelerle aynı cluster
3. Monitoring (SigNoz) entegre
4. Auto-scaling hazır

**pnpm Monorepo Sorunu için Çözüm:**

```dockerfile
# Dockerfile - Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app

# pnpm kurulumu
RUN corepack enable && corepack prepare pnpm@latest --activate

# Sadece gerekli dosyaları kopyala
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
COPY apps/api/package.json ./apps/api/

# Dependencies
RUN pnpm install --frozen-lockfile --filter=api...

# Source code
COPY apps/api ./apps/api
COPY packages ./packages

# Build
RUN pnpm --filter=api build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080
CMD ["node", "dist/main.js"]
```

---

## 6️⃣ Hızlı Çözüm Adımları

### Adım 1: Pod Durumunu Kontrol Et
```bash
kubectl get pods -n mega-pos -o wide
kubectl describe pod <pod-name> -n mega-pos
```

### Adım 2: Image Pull Hatası Varsa
```bash
# Node'da manuel test
kubectl run test-ecr --image=986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest -n mega-pos --rm -it -- /bin/sh
```

### Adım 3: RDS Bağlantı Testi
```bash
# Pod içinden
kubectl exec -it <pod-name> -n mega-pos -- /bin/sh
# İçeride:
nc -zv mega-pos-db.crowkq8ykqeo.eu-central-1.rds.amazonaws.com 5432
```

### Adım 4: Secrets Kontrolü
```bash
kubectl get secrets -n mega-pos
kubectl get externalsecrets -n mega-pos
```

---

## 📋 SONUÇ

| Soru | Cevap |
|------|-------|
| Orchestration | **EKS** (hsd-monitoring cluster) |
| ECR Erişimi | ✅ Node'lar erişebilir |
| RDS Bağlantısı | ✅ Security group açık, aynı VPC |
| Image Pull Sorunu | Muhtemelen tag veya manifest hatası |
| Önerilen Yol | EKS ile devam, Dockerfile düzelt |

---

## 🔧 YAPILACAKLAR

1. [ ] `kubectl describe pod` ile hata mesajını al
2. [ ] Dockerfile'ı pnpm monorepo için optimize et
3. [ ] Image'ı yeniden build et ve push et
4. [ ] Deployment manifest'i kontrol et
5. [ ] Pod'u restart et

---

**AWS Kiro**  
*HSD Enterprise Cloud Architect*
