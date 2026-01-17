# Chat Kiro - Handoff Belgesi

**Tarih:** 13 Ocak 2026, 13:25  
**Konu:** MEGA POS RDS Bağlantı Sorunu

---

## 🎯 Durum Özeti

MEGA POS API pod'ları RDS'e bağlanamıyor. Network seviyesinde her şey çalışıyor ama uygulama seviyesinde `ECONNREFUSED` hatası alınıyor.

---

## ✅ Tamamlanan İşler

1. **RDS Subnet Sorunu Çözüldü**
   - RDS yanlış subnet'lerde (public) oluşturulmuştu
   - Silip doğru subnet'lerde (private) yeniden oluşturduk
   - Dosya: `terraform/terraform.tfvars` düzeltildi

2. **Pod Placement Düzeltildi**
   - Pod'lar private subnet'teki node'a taşındı
   - `nodeName` ile zorlandı

3. **Network Doğrulandı**
   - ✅ `nc -zv` ile port 5432 erişilebilir
   - ✅ `psql` ile veritabanına bağlantı başarılı
   - ✅ Security group kuralları doğru

---

## 🔴 Çözülemeyen Sorun

**Hata:**
```
[TypeOrmModule] Unable to connect to the database
AggregateError [ECONNREFUSED]
```

**Paradoks:**
- Network bağlantısı çalışıyor (nc, psql başarılı)
- Ama NestJS/TypeORM bağlanamıyor

---

## 🔍 İncelenmesi Gereken Dosyalar

### Uygulama Kodu (Queen Q Projesi)
```
/Users/hasanaker/Downloads/Queen Q/apps/api/src/
├── app.module.ts              # TypeORM konfigürasyonu
├── config/
│   └── database.config.ts     # Database config
└── main.ts                    # Bootstrap
```

### Kontrol Edilmesi Gerekenler

1. **TypeORM SSL Ayarı:**
```typescript
// app.module.ts içinde
TypeOrmModule.forRoot({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {  // ← Bu var mı?
    rejectUnauthorized: false
  }
})
```

2. **Environment Variable Okuma:**
```typescript
// DATABASE_URL nasıl okunuyor?
// Özel karakterler sorun yaratıyor mu?
```

3. **Connection Pool Ayarları:**
```typescript
// Çok fazla bağlantı açılmaya çalışılıyor mu?
extra: {
  max: 5,
  min: 1
}
```

---

## 🔧 Önerilen Çözümler

### Çözüm 1: SSL Ekle (En Olası)
RDS varsayılan olarak SSL gerektirebilir:
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})
```

### Çözüm 2: Ayrı Environment Variables
DATABASE_URL yerine:
```bash
DB_HOST=mega-pos-db.crowkq8ykqeo.eu-central-1.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=megapos_user
DB_PASSWORD=I66}emTdPl4Bm3Xv?(7E{JIkPbWUy:q_
DB_DATABASE=megapos
```

### Çözüm 3: Debug Mode
```bash
kubectl set env deployment/mega-pos-api -n mega-pos DEBUG="typeorm:*"
```

---

## 📊 Mevcut Kaynaklar

### RDS
```
Endpoint: mega-pos-db.crowkq8ykqeo.eu-central-1.rds.amazonaws.com:5432
Status:   available
Subnets:  private-1a, private-1b
```

### Kubernetes
```bash
Namespace:   mega-pos
Deployment:  mega-pos-api
Pod Status:  CrashLoopBackOff
Node:        ip-10-1-10-127.eu-central-1.compute.internal (private subnet)
```

### Secret
```bash
kubectl get secret -n mega-pos mega-pos-secrets -o yaml
# DATABASE_URL, REDIS_URL, JWT_SECRET, NODE_ENV
```

---

## 📁 Önemli Dosyalar

1. **Detaylı Rapor:** `docs/MEGA_POS_RDS_CONNECTION_ISSUE.md`
2. **Terraform Config:** `terraform/terraform.tfvars`
3. **RDS Module:** `terraform/modules/rds/main.tf`
4. **Durum Raporu:** `docs/AWS_DURUM_RAPORU.md`

---

## 🎯 Sıradaki Adım

**Uygulama kodunu incele ve TypeORM konfigürasyonunu düzelt.**

Muhtemelen SSL ayarı eksik veya DATABASE_URL parse edilemiyor.

---

**Hazırlayan:** AWS Kiro  
**Devredilen:** Chat Kiro  
**Tarih:** 13 Ocak 2026, 13:25
