# MEGA POS RDS Bağlantı Sorunu - Detaylı Rapor

**Tarih:** 13 Ocak 2026, 13:25  
**Durum:** 🔴 ÇÖZÜM BEKLİYOR  
**Öncelik:** YÜKSEK

---

## 🎯 Özet

MEGA POS API pod'ları RDS PostgreSQL veritabanına bağlanamıyor. Network bağlantısı çalışıyor (`nc` ve `psql` başarılı) ama NestJS/TypeORM uygulaması `ECONNREFUSED` hatası veriyor.

---

## 📋 Kronolojik Olay Akışı

### 1. İlk Sorun: RDS Yanlış Subnet'lerde (09:00-09:15)

**Tespit:**
- RDS **public subnet**'lerde oluşturulmuştu:
  - `subnet-069cd5f6bbbb39471` (hsd-monitoring-public-1a)
  - `subnet-00b1480c9ee71009a` (hsd-monitoring-public-1b)
- Olması gereken **private subnet**'ler:
  - `subnet-01f9210eb0a8bc064` (hsd-monitoring-private-1a)
  - `subnet-04a3d25632fb96726` (hsd-monitoring-private-1b)

**Neden:** `terraform/terraform.tfvars` dosyasında `private_subnet_ids` değişkenine yanlışlıkla public subnet ID'leri verilmişti.

**Çözüm:**
```bash
# 1. terraform.tfvars düzeltildi
# 2. RDS silindi (2.5 dakika)
terraform destroy -target=module.rds.aws_db_instance.main -auto-approve

# 3. RDS yeniden oluşturuldu (7 dakika)
terraform apply -target=module.rds -auto-approve

# 4. Secrets güncellendi
terraform apply -target=module.secrets -auto-approve
```

**Sonuç:** ✅ RDS şimdi doğru subnet'lerde (private)

---

### 2. İkinci Sorun: Pod Yanlış Node'da (09:15-09:30)

**Tespit:**
- EKS node'ları hem public hem private subnet'lerde:
  - Node 1: `10.1.1.196` → `subnet-069cd5f6bbbb39471` (public-1a)
  - Node 2: `10.1.10.127` → `subnet-01f9210eb0a8bc064` (private-1a)
  - Node 3: `10.1.10.234` → `subnet-01f9210eb0a8bc064` (private-1a)
- Pod'lar public subnet'teki node'da çalışıyordu
- Public subnet'ten private subnet'teki RDS'e routing yok

**Çözüm:**
```bash
# Pod'u private subnet'teki node'a zorla
kubectl patch deployment mega-pos-api -n mega-pos -p '{
  "spec":{
    "template":{
      "spec":{
        "nodeName":"ip-10-1-10-127.eu-central-1.compute.internal"
      }
    }
  }
}'
```

**Sonuç:** ✅ Pod şimdi private subnet'teki node'da çalışıyor

---

### 3. Üçüncü Sorun: Network Çalışıyor Ama Uygulama Bağlanamıyor (09:30-11:25)

**Tespit:**

✅ **Network bağlantısı çalışıyor:**
```bash
# Port 5432'ye erişim var
kubectl exec -n mega-pos mega-pos-api-xxx -- nc -zv mega-pos-db.crowkq8ykqeo.eu-central-1.rds.amazonaws.com 5432
# Output: mega-pos-db.crowkq8ykqeo.eu-central-1.rds.amazonaws.com (10.1.10.98:5432) open

# PostgreSQL bağlantısı başarılı
kubectl exec -n mega-pos mega-pos-api-xxx -- psql "postgresql://megapos_user:PASSWORD@mega-pos-db.../megapos" -c "SELECT 1"
# Output: 
#  ?column? 
# ----------
#         1
```

❌ **Uygulama bağlanamıyor:**
```
[Nest] 1  - 01/13/2026, 11:19:49 AM   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (1)...
AggregateError [ECONNREFUSED]: 
    at internalConnectMultiple (node:net:1122:18)
    at afterConnectMultiple (node:net:1689:7)
```

**Denenen Çözümler:**

1. ❌ **URL Encoding:** Şifredeki özel karakterleri encode ettik
   ```
   Orijinal: I66}emTdPl4Bm3Xv?(7E{JIkPbWUy:q_
   Encoded:  I66%7DemTdPl4Bm3Xv%3F%287E%7BJIkPbWUy%3Aq_
   ```
   Sonuç: İşe yaramadı

2. ❌ **Secret Güncelleme:** NODE_ENV eklendi, secret yeniden oluşturuldu
   Sonuç: İşe yaramadı

---

## 🔍 Mevcut Durum

### RDS Bilgileri
```
Endpoint:     mega-pos-db.crowkq8ykqeo.eu-central-1.rds.amazonaws.com:5432
Private IP:   10.1.10.98
Status:       available
Subnet Group: mega-pos-db-subnet-group
Subnets:      subnet-01f9210eb0a8bc064 (private-1a)
              subnet-04a3d25632fb96726 (private-1b)
Security Group: sg-0cc28d587cafde3f4
```

### Security Group Kuralları
```
RDS Security Group (sg-0cc28d587cafde3f4):
  Ingress: TCP 5432 from sg-02de2cf73b6b6e1d8 (EKS nodes)
  
EKS Nodes Security Group (sg-02de2cf73b6b6e1d8):
  Attached to all EKS worker nodes
```

### Pod Durumu
```bash
kubectl get pods -n mega-pos
NAME                            READY   STATUS             RESTARTS
mega-pos-api-7d5b7c67cc-x9vxf   0/1     CrashLoopBackOff   5 (2m ago)
```

### Environment Variables (Secret)
```
DATABASE_URL: postgresql://megapos_user:I66%7DemTdPl4Bm3Xv%3F%287E%7BJIkPbWUy%3Aq_@mega-pos-db.crowkq8ykqeo.eu-central-1.rds.amazonaws.com:5432/megapos
REDIS_URL:    redis://master.shared-redis.uld2os.euc1.cache.amazonaws.com:6379
JWT_SECRET:   mega-pos-jwt-secret-2026
NODE_ENV:     production
```

---

## 🤔 Olası Nedenler

### 1. TypeORM SSL Konfigürasyonu
RDS PostgreSQL varsayılan olarak SSL gerektirebilir ama uygulama SSL kullanmıyor olabilir.

**Test:**
```typescript
// TypeORM config'de SSL ayarı var mı?
{
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // Bu eksik olabilir
  }
}
```

### 2. DATABASE_URL Parse Sorunu
TypeORM, URL'deki özel karakterleri yanlış parse ediyor olabilir.

**Alternatif:** Ayrı environment variable'lar kullan:
```
DB_HOST=mega-pos-db.crowkq8ykqeo.eu-central-1.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=megapos_user
DB_PASSWORD=I66}emTdPl4Bm3Xv?(7E{JIkPbWUy:q_
DB_DATABASE=megapos
```

### 3. Connection Pool Ayarları
Uygulama çok fazla bağlantı açmaya çalışıyor olabilir.

**Test:**
```typescript
// TypeORM config'de pool ayarları
{
  extra: {
    max: 5,  // Maksimum bağlantı sayısı
    min: 1
  }
}
```

### 4. DNS Çözümleme Sorunu
Pod içinde DNS çözümlemesi farklı çalışıyor olabilir.

**Test:**
```bash
# Pod içinde DNS test et
kubectl exec -n mega-pos mega-pos-api-xxx -- nslookup mega-pos-db.crowkq8ykqeo.eu-central-1.rds.amazonaws.com
```

### 5. Uygulama Kodu Hatası
NestJS/TypeORM konfigürasyonunda hata olabilir.

**Kontrol Edilmesi Gerekenler:**
- `apps/api/src/app.module.ts` - TypeORM konfigürasyonu
- `apps/api/src/config/database.config.ts` - Database config
- Environment variable'ların nasıl okunduğu

---

## 🔧 Önerilen Çözüm Adımları

### Adım 1: Uygulama Kodunu İncele
```bash
# TypeORM konfigürasyonunu kontrol et
cat /Users/hasanaker/Downloads/Queen\ Q/apps/api/src/app.module.ts | grep -A 20 "TypeOrmModule"
```

### Adım 2: SSL Konfigürasyonu Ekle
Eğer TypeORM config'de SSL ayarı yoksa ekle:
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // ... diğer ayarlar
})
```

### Adım 3: Alternatif Environment Variables Dene
DATABASE_URL yerine ayrı ayrı değişkenler kullan:
```bash
kubectl create secret generic mega-pos-secrets -n mega-pos \
  --from-literal=DB_HOST="mega-pos-db.crowkq8ykqeo.eu-central-1.rds.amazonaws.com" \
  --from-literal=DB_PORT="5432" \
  --from-literal=DB_USERNAME="megapos_user" \
  --from-literal=DB_PASSWORD="I66}emTdPl4Bm3Xv?(7E{JIkPbWUy:q_" \
  --from-literal=DB_DATABASE="megapos" \
  --from-literal=REDIS_URL="redis://master.shared-redis.uld2os.euc1.cache.amazonaws.com:6379" \
  --from-literal=JWT_SECRET="mega-pos-jwt-secret-2026" \
  --from-literal=NODE_ENV="production"
```

### Adım 4: Debug Modu
Uygulamayı debug modda çalıştır:
```bash
# Deployment'a debug env ekle
kubectl set env deployment/mega-pos-api -n mega-pos DEBUG="typeorm:*"
```

### Adım 5: RDS Connection Logs
RDS'te connection log'larını aktifleştir:
```bash
aws rds modify-db-instance \
  --db-instance-identifier mega-pos-db \
  --cloudwatch-logs-export-configuration '{"EnableLogTypes":["postgresql"]}' \
  --apply-immediately
```

---

## 📊 Test Sonuçları Özeti

| Test | Sonuç | Detay |
|------|-------|-------|
| Network (nc) | ✅ Başarılı | Port 5432 açık |
| PostgreSQL (psql) | ✅ Başarılı | Bağlantı ve sorgu çalışıyor |
| Security Groups | ✅ Doğru | EKS → RDS kuralı var |
| Subnet Placement | ✅ Doğru | RDS private, Pod private node'da |
| DNS Resolution | ✅ Doğru | RDS endpoint çözümleniyor |
| TypeORM Connection | ❌ Başarısız | ECONNREFUSED hatası |

---

## 🎯 Sonraki Adımlar

1. **Acil:** Uygulama kodundaki TypeORM konfigürasyonunu incele
2. **Deneme 1:** SSL konfigürasyonu ekle
3. **Deneme 2:** Ayrı environment variable'lar kullan
4. **Deneme 3:** Debug mode aktif et ve detaylı log al
5. **Son Çare:** RDS'i geçici olarak public subnet'e taşı ve test et (sadece debug için)

---

## 📞 İletişim

Bu rapor Chat Kiro için hazırlanmıştır. Devam için uygulama kodunu incelemek gerekiyor.

**Hazırlayan:** AWS Kiro  
**Tarih:** 13 Ocak 2026, 13:25
