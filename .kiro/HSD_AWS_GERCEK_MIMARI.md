# HSD AWS Gerçek Mimari - Tam Teknik Döküman

**Tarih:** 11 Ocak 2026  
**Hazırlayan:** AWS Infrastructure Kiro  
**Son Güncelleme:** Canlı sistem analizi

---

## 🎯 ÖZET

Bu döküman, HSD'nin gerçek AWS altyapısını detaylı şekilde açıklar. Tüm bilgiler canlı sistemden alınmıştır.

---

## 🏗️ MİMARİ GENEL BAKIŞ

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              HSD AWS MİMARİSİ                                        │
│                           Region: eu-central-1 (Frankfurt)                           │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                         KULLANICI İSTEKLERİ                                  │    │
│  │                    (Web, Mobile, API Clients)                                │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                         ROUTE 53 (DNS)                                       │    │
│  │         vozy.io │ api.voczo.com │ auth.hsdcore.com │ monitoring.hsdcore.com │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                      │                                               │
│              ┌───────────────────────┼───────────────────────┐                      │
│              ▼                       ▼                       ▼                      │
│  ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐             │
│  │   LOAD BALANCERS  │   │   API GATEWAY     │   │   CLOUDFRONT      │             │
│  │   (5 adet ALB/NLB)│   │   (REST APIs)     │   │   (CDN)           │             │
│  └─────────┬─────────┘   └─────────┬─────────┘   └───────────────────┘             │
│            │                       │                                                │
│            ▼                       ▼                                                │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                              │    │
│  │                    EKS CLUSTER: hsd-monitoring                               │    │
│  │                    Kubernetes v1.31 │ 5 Nodes                                │    │
│  │                                                                              │    │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │    │
│  │   │   JITSI     │  │   VOCZO     │  │   SIGNOZ    │  │  KARPENTER  │        │    │
│  │   │  (Vozy)     │  │  (AI/ML)    │  │ (Monitoring)│  │  (Autoscale)│        │    │
│  │   │  5 pods     │  │  0-10 pods  │  │  6 pods     │  │  2 pods     │        │    │
│  │   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │    │
│  │                                                                              │    │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │    │
│  │   │    KEDA     │  │ KUBE-SYSTEM │  │  HSD-AUTH   │  │  HSD-PORTAL │        │    │
│  │   │ (Autoscale) │  │  (Core)     │  │  (Planned)  │  │  (Planned)  │        │    │
│  │   │  3 pods     │  │  ~25 pods   │  │  0 pods     │  │  0 pods     │        │    │
│  │   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                      │                                               │
│              ┌───────────────────────┼───────────────────────┐                      │
│              ▼                       ▼                       ▼                      │
│  ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐             │
│  │      LAMBDA       │   │     DYNAMODB      │   │       SQS         │             │
│  │   (Serverless)    │   │   (NoSQL DB)      │   │   (Queues)        │             │
│  │   11 functions    │   │   5 tables        │   │   5 queues        │             │
│  └───────────────────┘   └───────────────────┘   └───────────────────┘             │
│                                      │                                               │
│              ┌───────────────────────┼───────────────────────┐                      │
│              ▼                       ▼                       ▼                      │
│  ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐             │
│  │    ELASTICACHE    │   │    OPENSEARCH     │   │     BEDROCK       │             │
│  │   (Shared Redis)  │   │  (Knowledge Base) │   │   (AI Models)     │             │
│  │   2 nodes         │   │   Serverless      │   │   Claude 4.5      │             │
│  └───────────────────┘   └───────────────────┘   └───────────────────┘             │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🖥️ EKS CLUSTER DETAYLARİ

### Cluster Bilgileri
```yaml
Cluster Name: hsd-monitoring
Status: ACTIVE
Kubernetes Version: 1.31
Region: eu-central-1 (Frankfurt)
Endpoint: https://BD467A006B322482520A9D4747B62876.gr7.eu-central-1.eks.amazonaws.com
```

### Mevcut Node'lar (5 adet)
| Node | Instance Type | Capacity Type | IP | Durum |
|------|---------------|---------------|-----|-------|
| ip-10-1-10-127 | t3.large | ON_DEMAND | 10.1.10.127 | Ready |
| ip-10-1-10-234 | t3.large | ON_DEMAND | 10.1.10.234 | Ready |
| ip-10-1-2-165 | m7i.xlarge | SPOT | 10.1.2.165 | Ready (Video) |
| ip-10-1-20-28 | t3.large | ON_DEMAND | 10.1.20.28 | Ready |
| ip-10-1-20-89 | t3.large | ON_DEMAND | 10.1.20.89 | Ready |

### Node Kaynak Kullanımı
| Node | CPU | CPU% | Memory | Memory% |
|------|-----|------|--------|---------|
| ip-10-1-10-127 | 48m | 2% | 2085Mi | 29% |
| ip-10-1-10-234 | 40m | 2% | 1826Mi | 25% |
| ip-10-1-2-165 | 24m | 0% | 816Mi | 5% |
| ip-10-1-20-28 | 45m | 2% | 1138Mi | 16% |
| ip-10-1-20-89 | 132m | 6% | 2716Mi | 38% |

---

## 🔄 KARPENTER - OTOMATİK NODE YÖNETİMİ

### Karpenter Nedir?
Karpenter, Kubernetes için akıllı node provisioning sistemidir. Pod ihtiyacına göre otomatik olarak:
- Yeni node açar (scale-up)
- Boş node'ları kapatır (scale-down)
- En uygun instance tipini seçer
- Spot instance kullanarak maliyet düşürür

### Node Pool'lar (3 adet)

#### 1. General Pool (Genel İşler)
```yaml
Name: general-pool
Status: READY (0 nodes - şu anda boş, ihtiyaç olunca açılır)
Instance Types: t3.medium, t3.large, t3.xlarge, m5.large, m5.xlarge
Capacity Types: spot, on-demand
Consolidation: 1 dakika boş kalırsa kapat
Limits: Max 100 CPU, 200Gi Memory
Use Case: Web uygulamaları, API'ler, genel workload'lar
```

#### 2. GPU Pool (AI/ML İşleri)
```yaml
Name: gpu-pool
Status: READY (0 nodes - şu anda boş, ihtiyaç olunca açılır)
Instance Types: g6.xlarge, g6.2xlarge, g5.xlarge, g5.2xlarge
Capacity Types: spot, on-demand
Consolidation: 1 dakika boş kalırsa kapat
Limits: Max 1000 CPU, 1000Gi Memory
Taint: nvidia.com/gpu=true:NoSchedule
Use Case: Voczo transcription, AI model inference
```

#### 3. Video Pool (Video İşleme)
```yaml
Name: video-pool
Status: READY (1 node aktif - m7i.xlarge SPOT)
Instance Types: c5.xlarge, c5.2xlarge, c7i.xlarge, m7i.xlarge
Capacity Types: spot, on-demand
Consolidation: 5 dakika boş kalırsa kapat
Taint: workload=video:NoSchedule
Use Case: Jitsi video bridge, video encoding
```

### Karpenter Nasıl Çalışır?

```
┌─────────────────────────────────────────────────────────────────────┐
│                    KARPENTER AKIŞI                                   │
│                                                                      │
│   1. Pod Oluşturulur (Pending)                                      │
│          │                                                           │
│          ▼                                                           │
│   2. Karpenter Pod'u İzler                                          │
│          │                                                           │
│          ▼                                                           │
│   3. Uygun Node Pool Seçilir                                        │
│      (Labels, Taints, Resources)                                    │
│          │                                                           │
│          ▼                                                           │
│   4. En Ucuz Instance Tipi Belirlenir                               │
│      (Spot öncelikli)                                               │
│          │                                                           │
│          ▼                                                           │
│   5. EC2 Instance Başlatılır (~60 saniye)                           │
│          │                                                           │
│          ▼                                                           │
│   6. Node EKS'e Katılır                                             │
│          │                                                           │
│          ▼                                                           │
│   7. Pod Schedule Edilir                                            │
│                                                                      │
│   ═══════════════════════════════════════════════════════════════   │
│                                                                      │
│   8. Pod Silinir / İş Biter                                         │
│          │                                                           │
│          ▼                                                           │
│   9. Node Boş Kalır (consolidateAfter süresi)                       │
│          │                                                           │
│          ▼                                                           │
│   10. Karpenter Node'u Terminate Eder                               │
│          │                                                           │
│          ▼                                                           │
│   11. EC2 Instance Kapanır (Maliyet Durur!)                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 KEDA - OTOMATİK POD SCALING

### KEDA Nedir?
KEDA (Kubernetes Event-Driven Autoscaling), pod sayısını otomatik olarak artırıp azaltır. HPA'dan farkı: **0'a kadar scale edebilir!**

### Aktif ScaledObjects (2 adet)

#### 1. Voczo GPU Scaler
```yaml
Name: voczo-gpu-scaler
Namespace: voczo
Target: voczo-worker deployment
Min Replicas: 0  ← İŞ YOKSA 0 POD!
Max Replicas: 10
Trigger: aws-sqs-queue (voczo-transcription-jobs)
Status: READY, ACTIVE=False (şu anda 0 pod)
```

**Nasıl Çalışır:**
```
SQS'te mesaj yok → 0 pod çalışır → $0 maliyet
SQS'te 1 mesaj → 1 pod açılır → GPU node başlar
SQS'te 10 mesaj → 10 pod'a kadar scale
İşler biter → Pod'lar kapanır → Node kapanır
```

#### 2. Jitsi JVB Scaler
```yaml
Name: jitsi-jvb-scaler
Namespace: jitsi
Target: jvb deployment
Min Replicas: 1  ← Her zaman en az 1 pod
Max Replicas: 100000
Trigger: cpu (70% threshold)
Status: READY, ACTIVE=True (1 pod çalışıyor)
```

**Nasıl Çalışır:**
```
CPU < 70% → 1 pod yeterli
CPU > 70% → Yeni pod'lar eklenir
Toplantı sayısı artar → Otomatik scale
Toplantılar biter → 1 pod'a düşer
```

---

## 🔗 EKS vs LAMBDA - NE ZAMAN HANGİSİ?

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EKS vs LAMBDA KARŞILAŞTIRMA                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────┐    ┌─────────────────────────┐         │
│  │         EKS             │    │        LAMBDA           │         │
│  │    (Kubernetes)         │    │     (Serverless)        │         │
│  ├─────────────────────────┤    ├─────────────────────────┤         │
│  │ ✅ Sürekli çalışan      │    │ ✅ Ara sıra çalışan     │         │
│  │    uygulamalar          │    │    işler                │         │
│  │                         │    │                         │         │
│  │ ✅ Karmaşık sistemler   │    │ ✅ Basit API'ler        │         │
│  │    (microservices)      │    │    (tek endpoint)       │         │
│  │                         │    │                         │         │
│  │ ✅ Özel network         │    │ ✅ Event-driven         │         │
│  │    gereksinimleri       │    │    (SQS, S3, API GW)    │         │
│  │                         │    │                         │         │
│  │ ✅ GPU workloads        │    │ ✅ Hızlı deployment     │         │
│  │                         │    │                         │         │
│  │ ❌ Daha karmaşık        │    │ ❌ 15 dk timeout        │         │
│  │ ❌ Minimum maliyet var  │    │ ❌ Cold start           │         │
│  ├─────────────────────────┤    ├─────────────────────────┤         │
│  │ ÖRNEKLER:               │    │ ÖRNEKLER:               │         │
│  │ • Jitsi (video conf)    │    │ • Auth API              │         │
│  │ • Voczo (AI/ML)         │    │ • Slack notifier        │         │
│  │ • SigNoz (monitoring)   │    │ • Cost guard            │         │
│  │ • Chat (Mattermost)     │    │ • Brand Kiro            │         │
│  └─────────────────────────┘    └─────────────────────────┘         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Brand Kiro İçin Neden Lambda?
```
Brand Kiro kullanım senaryosu:
- Günde belki 10-50 isim üretme isteği
- Her istek 5-10 saniye sürüyor
- Geri kalan zamanda hiç kullanılmıyor

Lambda ile:
- 50 istek × 10 saniye = 500 saniye/gün
- Maliyet: ~$0.01/gün = $0.30/ay

EKS'te olsaydı:
- 7/24 çalışan pod gerekir
- En az t3.small = ~$15/ay
- Veya general-pool'da paylaşımlı = ~$5-10/ay

Sonuç: Lambda 50x daha ucuz!
```

---


## 💰 MALİYET ANALİZİ (Ocak 2026 - İlk 11 Gün)

### Servis Bazlı Maliyet
| Servis | Maliyet ($) | Açıklama |
|--------|-------------|----------|
| EC2 Compute | $227.30 | EKS node'ları (5 adet t3.large + 1 spot) |
| EKS Control Plane | $143.40 | Kubernetes yönetim ücreti ($0.10/saat) |
| Tax | $159.09 | Vergi |
| Domain (Registrar) | $101.00 | Domain yenilemeleri |
| Load Balancing | $48.36 | 5 adet ALB/NLB |
| AWS Config | $47.16 | ⚠️ Kapatılabilir |
| Detective | $45.15 | ⚠️ Kapatılabilir |
| EC2 Other | $46.66 | EBS, snapshots, data transfer |
| AWS Support | $29.00 | Developer support |
| VPC | $25.58 | NAT Gateway, Elastic IP |
| Security Hub | $16.90 | ⚠️ Kapatılabilir |
| CloudTrail | $13.40 | Audit logs |
| OpenSearch | $11.38 | Knowledge Base |
| WAF | $9.63 | API koruması |
| Inspector | $7.37 | Güvenlik taraması |
| Route 53 | $6.06 | DNS |
| CloudWatch | $6.52 | Monitoring |
| Amplify | $5.64 | Frontend hosting |
| GuardDuty | $2.88 | Threat detection |
| Jitsi Marketplace | $1.43 | Jitsi lisansı |
| Macie | $0.90 | Data security |
| Bedrock (Claude) | $0.32 | AI model kullanımı |
| Lambda | $0.00 | Çok düşük kullanım |
| API Gateway | $0.00 | Çok düşük kullanım |
| **TOPLAM** | **~$955** | 11 günlük |

### Aylık Projeksiyon
```
11 günlük maliyet: ~$955
Aylık tahmin: ~$2,600/ay

Budget: $2,500/ay
Durum: ⚠️ Biraz üstünde
```

### Tasarruf Önerileri
```
Kapatılabilir servisler:
- AWS Config: $47/ay → Kapatıldı ✅
- Detective: $45/ay → Kapatılabilir
- Security Hub: $17/ay → Kapatılabilir

Potansiyel tasarruf: ~$109/ay
Yeni tahmin: ~$2,490/ay ✅
```

---

## 🔧 LAMBDA FONKSİYONLARI (11 adet)

### Mevcut Lambda'lar
| Fonksiyon | Runtime | Memory | Kullanım |
|-----------|---------|--------|----------|
| hsd-auth-register | nodejs20.x | 512 MB | Auth kayıt |
| hsd-auth-login | nodejs20.x | 512 MB | Auth giriş |
| voczo-get-result | python3.11 | 256 MB | Transcription sonuç |
| voczo-submit-job | python3.11 | 256 MB | Transcription iş gönder |
| vozy-create-conference | python3.11 | 128 MB | Toplantı oluştur |
| vozy-api-authorizer | python3.11 | 128 MB | API yetkilendirme |
| jitsi-jibri-cleanup | python3.11 | 256 MB | Kayıt temizleme |
| jitsi-jibri-launcher | python3.11 | 512 MB | Kayıt başlatma |
| jitsi-cost-guard | python3.11 | 128 MB | Maliyet kontrolü |
| clinisyn-gpu-auto-scale | python3.12 | 128 MB | GPU scaling |
| hsd-slack-notifier | python3.11 | 128 MB | Slack bildirimleri |

### Lambda Maliyet Modeli
```
Lambda Fiyatlandırma:
- İstek başına: $0.20 / 1 milyon istek
- Süre başına: $0.0000166667 / GB-saniye

Örnek (hsd-auth-login):
- 1000 istek/gün × 30 gün = 30,000 istek/ay
- Her istek 200ms, 512MB = 0.1 GB-saniye
- 30,000 × 0.1 = 3,000 GB-saniye

Maliyet:
- İstek: 30,000 × $0.0000002 = $0.006
- Süre: 3,000 × $0.0000166667 = $0.05
- TOPLAM: ~$0.06/ay

Karşılaştırma:
- Lambda: $0.06/ay
- EKS pod (7/24): ~$15-30/ay
- Tasarruf: %99+
```

---

## 📦 NAMESPACE'LER VE POD'LAR

### Aktif Namespace'ler
| Namespace | Pod Sayısı | Durum | Açıklama |
|-----------|------------|-------|----------|
| jitsi | 5 | ✅ Aktif | Video conferencing |
| signoz | 6 | ✅ Aktif | Monitoring |
| karpenter | 2 | ✅ Aktif | Node autoscaling |
| keda | 3 | ✅ Aktif | Pod autoscaling |
| kube-system | ~25 | ✅ Aktif | Kubernetes core |
| voczo | 0 | ⏸️ Scale-to-zero | AI transcription |
| default | 2 | ✅ Test | nginx-test |

### Planlanan Namespace'ler (Boş)
| Namespace | Durum | Planlanan Kullanım |
|-----------|-------|-------------------|
| hsd-auth | Oluşturuldu | Auth servisi |
| hsd-portal | Oluşturuldu | Ana portal |
| hsd-chat | Oluşturuldu | Mattermost |
| hsd-docs | Oluşturuldu | Doküman yönetimi |
| hsd-crm | Oluşturuldu | CRM sistemi |
| gorev-yonetimi | Oluşturuldu | Task management |

---

## 🗄️ VERİTABANLARI

### DynamoDB Tables (5 adet)
| Tablo | Kullanım | Billing |
|-------|----------|---------|
| hsd-auth-users | Auth kullanıcıları | PAY_PER_REQUEST |
| hsd-auth-realms | Multi-tenant config | PAY_PER_REQUEST |
| hsd-auth-sessions | Oturum yönetimi | PAY_PER_REQUEST |
| jitsi-conference-registry | Toplantı kaydı | PAY_PER_REQUEST |
| vozy-api-keys | API anahtarları | PAY_PER_REQUEST |

### ElastiCache Redis
```yaml
Cluster: shared-redis
Status: CREATE_COMPLETE ✅
Engine: Redis 7.1
Nodes: 2 (Multi-AZ)
Type: cache.t3.micro
Primary: master.shared-redis.uld2os.euc1.cache.amazonaws.com
Reader: replica.shared-redis.uld2os.euc1.cache.amazonaws.com
Encryption: At-rest + In-transit
Maliyet: ~$25-30/ay
```

### OpenSearch Serverless
```yaml
Collection: hsd-knowledge-base
Type: Serverless (pay-per-use)
Use Case: Bedrock Knowledge Base
Maliyet: ~$11/ay
```

---

## 📨 MESAJLAŞMA SİSTEMLERİ

### SQS Queues (5 adet)
| Queue | Kullanım | DLQ |
|-------|----------|-----|
| voczo-transcription-jobs | AI işleri | ✅ |
| voczo-transcription-dlq | Başarısız işler | - |
| vozy-meeting-events | Toplantı olayları | ✅ |
| vozy-meeting-events-dlq | Başarısız olaylar | - |
| hsd-monitoring | Monitoring olayları | - |

### EventBridge
```yaml
Event Buses:
  - default (AWS varsayılan)
  - hsd-events (Tüm HSD projeleri için)

Pattern: source = "hsd.{project}"
Örnek: hsd.auth, hsd.portal, hsd.chat
```

---

## 🌐 LOAD BALANCERS (5 adet)

| Load Balancer | Type | Kullanım |
|---------------|------|----------|
| k8s-jitsi-jvbudp | NLB | Jitsi UDP traffic |
| k8s-jitsi-jitsivoz | ALB | Jitsi web interface |
| k8s-signoz-signozot | NLB | SigNoz OTEL collector |
| k8s-signoz-signozin | ALB | SigNoz ingestion |
| k8s-signoz-signozui | ALB | SigNoz dashboard |

---

## 🤖 BEDROCK AI MODELLERİ

### Kullanılabilir Claude Modelleri
| Model | ID | Kullanım |
|-------|-----|----------|
| Claude Opus 4.5 | anthropic.claude-opus-4-5-20251101-v1:0 | En güçlü, yaratıcı |
| Claude Sonnet 4.5 | anthropic.claude-sonnet-4-5-20250929-v1:0 | Dengeli |
| Claude Sonnet 4 | anthropic.claude-sonnet-4-20250514-v1:0 | Hızlı |
| Claude Haiku 4.5 | anthropic.claude-haiku-4-5-20251001-v1:0 | En hızlı, ucuz |
| Claude 3.7 Sonnet | anthropic.claude-3-7-sonnet-20250219-v1:0 | Eski versiyon |
| Claude 3.5 Sonnet | anthropic.claude-3-5-sonnet-20240620-v1:0 | Eski versiyon |

### Ocak 2026 Kullanımı
```
Claude Opus 4.5: $0.21
Claude Sonnet 4.5: $0.11
TOPLAM: $0.32
```

---

## 🔐 GÜVENLİK

### IAM
- 2 IAM User (hsdadmin, clinisyn-deploy)
- MFA aktif
- IRSA (EKS Service Accounts)

### Secrets Manager
- vozy/jwt-secret
- clinisyn/production/database-url
- clinisyn/production/config
- shared/redis/connection
- hsd-auth/jwt-secrets

### WAF
- voczo-api-waf
- vozy-api-waf
- Rules: SQL injection, XSS, Rate limit (2000/5min)

### Encryption
- DynamoDB: SSE enabled
- S3: SSE-S3
- Redis: At-rest + In-transit
- SQS: KMS encrypted

---

## 📋 CLOUDFORMATION STACKS

### Aktif Stacks
| Stack | Status | Açıklama |
|-------|--------|----------|
| hsd-auth-platform | CREATE_COMPLETE | Auth servisi |
| shared-redis | CREATE_COMPLETE | Redis cache |
| vozy-api-gateway | CREATE_COMPLETE | Vozy API |
| jibri-pool-therapy | UPDATE_COMPLETE | Jitsi recording |
| eksctl-hsd-monitoring-* | CREATE_COMPLETE | IRSA roles |

---

## 🎯 SONUÇ VE ÖNERİLER

### Mevcut Durum
- ✅ EKS cluster sağlıklı çalışıyor
- ✅ Karpenter ile otomatik node scaling aktif
- ✅ KEDA ile pod scaling aktif (scale-to-zero)
- ✅ Shared Redis deploy edildi
- ✅ Auth platform altyapısı hazır
- ⚠️ Maliyet budget'a yakın

### Brand Kiro İçin Öneri
```
Lambda kullan çünkü:
1. Düşük kullanım (günde 10-50 istek)
2. Maliyet: ~$1/ay vs EKS'te ~$15/ay
3. Hızlı deployment
4. Bedrock entegrasyonu kolay
5. Function URL ile direkt erişim
```

### Genel Öneriler
1. Detective ve Security Hub kapatılabilir (~$62/ay tasarruf)
2. Brand Kiro Lambda olarak deploy edilmeli
3. Küçük projeler Lambda'da, büyük projeler EKS'te
4. GPU pool sadece ihtiyaç olunca açılıyor (maliyet optimum)

---

## 📝 DEVAM EDEN İŞLER

### Brand Kiro Deployment (Beklemede)
```
Status: Lambda zip'leri hazır
Next: Lambda oluştur, Function URL al
Dosyalar:
- /Users/hasanaker/Desktop/Brand Kiro/lambda/generate-names/generate-names.zip
- /Users/hasanaker/Desktop/Brand Kiro/lambda/check-domains/check-domains.zip
```

---

**Hazırlayan:** AWS Infrastructure Kiro  
**Tarih:** 11 Ocak 2026
