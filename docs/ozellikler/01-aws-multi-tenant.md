# 🏗️ AWS Multi-Tenant Mimari

## Mevcut Durum ve Karar

**Karar:** Aynı AWS hesabını kullanıyoruz (HSD kredisi var)
**Gelecek:** Büyüdükçe ayrı hesaba taşınacak

---

## 🗄️ VERİTABANI İZOLASYONU

### Neden Ayrı Database?

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HSD AWS HESABI                                    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    AURORA POSTGRESQL CLUSTER                 │    │
│  │                                                              │    │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │    │
│  │  │ mega_pos  │ │ clinisyn  │ │ avukat_db │ │ diyetisyen│   │    │
│  │  │ _db       │ │ _db       │ │           │ │ _db       │   │    │
│  │  │           │ │           │ │           │ │           │   │    │
│  │  │ KVKK ✓    │ │ HIPAA ✓   │ │ Avukat    │ │ Sağlık    │   │    │
│  │  │ PCI-DSS   │ │ GDPR ✓    │ │ Gizlilik  │ │ Verileri  │   │    │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘   │    │
│  │                                                              │    │
│  │  Her DB:                                                     │    │
│  │  • Ayrı schema                                               │    │
│  │  • Ayrı credentials                                          │    │
│  │  • Ayrı backup policy                                        │    │
│  │  • Ayrı encryption key (KMS)                                 │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    DYNAMODB TABLES                           │    │
│  │                                                              │    │
│  │  mega-pos-*        clinisyn-*       avukat-*                │    │
│  │  ├── orders        ├── patients     ├── cases               │    │
│  │  ├── products      ├── sessions     ├── documents           │    │
│  │  └── tenants       └── notes        └── clients             │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### Compliance Gereksinimleri

| Proje | Veri Tipi | Compliance | Özel Gereksinim |
|-------|-----------|------------|-----------------|
| **Mega POS** | Finansal, Müşteri | KVKK, PCI-DSS | Kart verisi tutulmaz |
| **Clinisyn** | Sağlık, Psikoloji | HIPAA, GDPR | Şifreli notlar |
| **Avukat** | Hukuki, Gizli | Avukat-Müvekkil | Erişim logları |
| **Diyetisyen** | Sağlık | KVKK, GDPR | Anonimleştirme |

---

## 🔐 GÜVENLİK KATMANLARI

### IAM ve Erişim Kontrolü

```
┌─────────────────────────────────────────────────────────────────────┐
│                    IAM ROLE YAPISI                                   │
│                                                                      │
│  mega-pos-service-role                                              │
│  ├── DynamoDB: mega-pos-* tablolarına erişim                       │
│  ├── Aurora: mega_pos_db'ye erişim                                  │
│  ├── S3: mega-pos-assets bucket'ına erişim                         │
│  ├── KMS: mega-pos-key ile şifreleme                               │
│  └── SQS: mega-pos-* queue'larına erişim                           │
│                                                                      │
│  clinisyn-service-role                                              │
│  ├── DynamoDB: clinisyn-* tablolarına erişim                       │
│  ├── Aurora: clinisyn_db'ye erişim                                  │
│  └── ... (sadece kendi kaynaklarına)                               │
│                                                                      │
│  ❌ Cross-access YOK                                                │
│  mega-pos-role → clinisyn-* = DENIED                               │
│  clinisyn-role → mega-pos-* = DENIED                               │
└─────────────────────────────────────────────────────────────────────┘
```

### KMS Encryption Keys

```yaml
# Her proje için ayrı KMS key
mega-pos-encryption-key:
  alias: alias/mega-pos
  usage: 
    - Aurora encryption
    - S3 bucket encryption
    - DynamoDB encryption
    - Secrets Manager

clinisyn-encryption-key:
  alias: alias/clinisyn
  usage:
    - Patient data encryption
    - Session notes encryption
```

---

## 🌐 EKS NAMESPACE İZOLASYONU

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EKS CLUSTER: hsd-production                       │
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ namespace:      │  │ namespace:      │  │ namespace:      │     │
│  │ mega-pos        │  │ clinisyn        │  │ shared          │     │
│  │                 │  │                 │  │                 │     │
│  │ • pos-api       │  │ • therapy-api   │  │ • zalt-auth     │     │
│  │ • pos-worker    │  │ • patient-api   │  │ • signoz        │     │
│  │ • kds-service   │  │ • ai-service    │  │ • redis         │     │
│  │                 │  │                 │  │                 │     │
│  │ NetworkPolicy:  │  │ NetworkPolicy:  │  │ NetworkPolicy:  │     │
│  │ Sadece kendi    │  │ Sadece kendi    │  │ Tüm namespace   │     │
│  │ + shared        │  │ + shared        │  │ erişebilir      │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

### Network Policy Örneği

```yaml
# mega-pos namespace için
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: mega-pos-isolation
  namespace: mega-pos
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: mega-pos
        - namespaceSelector:
            matchLabels:
              name: shared
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: mega-pos
        - namespaceSelector:
            matchLabels:
              name: shared
    - to:  # AWS servisleri için
        - ipBlock:
            cidr: 0.0.0.0/0
      ports:
        - port: 443
```

---

## 📊 KNOWLEDGE BASE VE VERİ STRATEJİSİ

### Merkezi Knowledge Base

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HSD KNOWLEDGE ARCHITECTURE                        │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    OPENSEARCH SERVERLESS                     │    │
│  │                    (Bedrock Knowledge Base)                  │    │
│  │                                                              │    │
│  │  Index: hsd-master-knowledge                                 │    │
│  │  ├── pos-data (anonimleştirilmiş satış trendleri)           │    │
│  │  ├── health-insights (anonimleştirilmiş sağlık verileri)    │    │
│  │  ├── business-patterns (iş zekası)                          │    │
│  │  └── market-analysis (pazar analizi)                        │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│              ┌───────────────┼───────────────┐                      │
│              ▼               ▼               ▼                      │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │
│  │ Mega POS      │  │ Clinisyn      │  │ Diğer         │           │
│  │ AI Insights   │  │ AI Insights   │  │ Projeler      │           │
│  │               │  │               │  │               │           │
│  │ "Bu saatte    │  │ "Benzer       │  │ Cross-project │           │
│  │  waffle       │  │  vakalar..."  │  │ insights      │           │
│  │  satışı ↑"    │  │               │  │               │           │
│  └───────────────┘  └───────────────┘  └───────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

### Veri Anonimleştirme Pipeline

```python
# Örnek: POS verisi anonimleştirme
def anonymize_pos_data(raw_data):
    return {
        "region": hash_region(raw_data["location"]),  # İstanbul → Region_A
        "business_type": raw_data["business_type"],   # Kafe
        "hour": raw_data["hour"],                     # 14:00
        "day_of_week": raw_data["day_of_week"],       # Pazartesi
        "category": raw_data["product_category"],     # Tatlı
        "quantity": raw_data["quantity"],             # 5
        # Müşteri bilgisi YOK
        # Fiyat bilgisi YOK (sadece trend)
        # Lokasyon detayı YOK
    }
```

---

## 🔄 GELECEK: HESAP TAŞIMA PLANI

```
AŞAMA 1 (Şimdi): Aynı hesapta izole
├── Namespace isolation
├── DB isolation
├── IAM isolation
└── Network policies

AŞAMA 2 (6 ay sonra): Hazırlık
├── Terraform modülleri hazırla
├── Cross-account IAM roles
├── Data migration scripts
└── DNS/domain hazırlığı

AŞAMA 3 (12 ay sonra): Taşıma
├── Yeni AWS hesabı oluştur
├── AWS Organization'a ekle
├── Veritabanı replikasyonu başlat
├── Gradual traffic shift
└── Eski kaynakları kapat
```

---

**Sonuç:** Aynı hesapta başlıyoruz ama her şey izole. Taşıma gerektiğinde minimum eforla yapılabilir.
