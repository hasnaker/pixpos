# PIXPOS AWS Deployment - Handoff Özeti

**Tarih:** 16 Ocak 2026  
**Kaynak:** AWS Kiro  
**Hedef:** PIXPOS Geliştirici / DevOps

---

## 🎯 Proje Özeti

PIXPOS, Square benzeri bir cafe/restaurant POS sistemi. 6 uygulama + 771 gelecek özellik (IoT, İK, PDKS, Ödeme).

| Uygulama | Teknoloji | Domain | AWS Servisi |
|----------|-----------|--------|-------------|
| API | NestJS | api.pixpos.cloud | EKS |
| POS | React | pos.pixpos.cloud | CloudFront + S3 |
| BOSS | React | os.pixpos.cloud | CloudFront + S3 |
| Kitchen | React | kitchen.pixpos.cloud | CloudFront + S3 |
| Waiter | React | waiter.pixpos.cloud | CloudFront + S3 |
| QR Menu | React | *.pixpos.site | CloudFront + S3 |

---

## 🏗️ Mevcut HSD Altyapısı (Kullanılacak)

```yaml
VPC: vpc-05489cdddb3dfc143 (hsd-monitoring-vpc, 10.1.0.0/16)
EKS: hsd-monitoring (K8s 1.31)
Redis: master.shared-redis.uld2os.euc1.cache.amazonaws.com:6379
OIDC: BD467A006B322482520A9D4747B62876

Private Subnets (RDS için):
  - subnet-01f9210eb0a8bc064 (eu-central-1a)
  - subnet-04a3d25632fb96726 (eu-central-1b)
```

---

## 📋 Deployment Sırası

### Faz 1: Altyapı (1-2 saat)
1. ✅ Route 53 Hosted Zones (pixpos.cloud, pixpos.site)
2. ✅ ACM Sertifikaları (us-east-1 + eu-central-1)
3. ✅ RDS PostgreSQL (pixpos-db)
4. ✅ Secrets Manager (database, jwt, redis)
5. ✅ ECR Repository (pixpos/api)
6. ✅ S3 Buckets (5 adet)

### Faz 2: CDN & Security (30 dk)
7. ✅ CloudFront OAI
8. ✅ CloudFront Distributions (5 adet)
9. ✅ WAF Web ACL
10. ✅ S3 Bucket Policies

### Faz 3: EKS Deployment (30 dk)
11. ✅ Namespace: pixpos
12. ✅ IRSA (IAM Role + Service Account)
13. ✅ ConfigMap + Secrets
14. ✅ Deployment + Service + Ingress + HPA

### Faz 4: DNS & Validation (15 dk)
15. ✅ Route 53 Records
16. ✅ Health Checks
17. ✅ CloudWatch Alarms

---

## 💰 Tahmini Maliyet

| Kaynak | Aylık |
|--------|-------|
| RDS db.t3.medium | ~$50 |
| EKS ek node | ~$60 |
| ALB | ~$25 |
| CloudFront | ~$30 |
| S3 + WAF + Diğer | ~$20 |
| **TOPLAM** | **~$185-215** |

---

## 📄 Detaylı Rehber

Tüm komutlar ve konfigürasyonlar için:
**`docs/PIXPOS_AWS_DEPLOYMENT_GUIDE.md`**

---

## ⚠️ Önemli Notlar

1. **Domain satın alınmalı**: pixpos.cloud, pixpos.site
2. **NS kayıtları**: Hosted zone oluşturduktan sonra registrar'a ekle
3. **ACM validation**: DNS validation kayıtlarını Route 53'e ekle
4. **Shared Redis**: Mevcut shared-redis kullanılacak, ek maliyet yok
5. **Node Pool**: general-pool kullanılacak (t3.large/m5.large)

---

## 🔗 İlgili Dosyalar

- `docs/PIXPOS_AWS_DEPLOYMENT_GUIDE.md` - Detaylı deployment rehberi
- `docs/aws-docs/10-YENI-PROJE-EKLEME.md` - Genel proje ekleme kılavuzu
- `terraform/modules/` - Mevcut Terraform modülleri (referans)

---

**Hazırlayan:** AWS Kiro  
**Tarih:** 16 Ocak 2026
