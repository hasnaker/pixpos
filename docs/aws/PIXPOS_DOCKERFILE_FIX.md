# 🔧 PixPos Dockerfile Düzeltmesi - ACIL

**Tarih:** 16 Ocak 2026  
**Sorun:** `Cannot find module 'express'`  
**Sebep:** pnpm monorepo symlink yapısı Docker'da çalışmıyor  
**Çözüm:** `pnpm deploy` komutu kullan

---

## ✅ ÇALIŞAN DOCKERFILE

Bu içeriği `apps/api/Dockerfile` dosyasına yapıştır:

```dockerfile
# ============================================
# PIXPOS API - PNPM MONOREPO DOCKERFILE
# ============================================
FROM node:20-alpine AS builder

# Build tools (canvas, bcrypt için)
RUN apk add --no-cache python3 make g++ cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev

# pnpm kurulumu
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Workspace dosyalarını kopyala
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY .npmrc ./

# Package.json dosyalarını kopyala
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Dependencies install
RUN pnpm install --frozen-lockfile

# Source code kopyala
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Shared package build
WORKDIR /app/packages/shared
RUN pnpm build

# API build
WORKDIR /app/apps/api
RUN pnpm build

# pnpm deploy - TÜM DEPENDENCIES'İ TEK KLASÖRE TOPLAR (symlink yok!)
WORKDIR /app
RUN pnpm --filter @mega-pos/api deploy --prod /deploy

# ============================================
# PRODUCTION IMAGE
# ============================================
FROM node:20-alpine

# Runtime dependencies (canvas için)
RUN apk add --no-cache cairo pango jpeg giflib librsvg

WORKDIR /app

# Deploy klasöründen kopyala (düz dosyalar, symlink yok)
COPY --from=builder /deploy .

# Migrations kopyala (varsa)
COPY --from=builder /app/apps/api/src/migrations ./src/migrations

# Uploads klasörü
RUN mkdir -p uploads/products

EXPOSE 8080

CMD ["node", "dist/main.js"]
```

---

## 🚀 UYGULAMA ADIMLARI

Queen Q klasöründe şu komutları çalıştır:

```bash
# 1. Dockerfile'ı güncelle (yukarıdaki içerikle)
# apps/api/Dockerfile dosyasını düzenle

# 2. ECR login
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 986906625644.dkr.ecr.eu-central-1.amazonaws.com

# 3. Build ve push (--no-cache önemli!)
docker buildx build --platform linux/amd64 \
  -f apps/api/Dockerfile \
  -t 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest \
  --push --no-cache .

# 4. Kubernetes deployment restart
kubectl rollout restart deployment/pixpos-api -n pixpos

# 5. Bekle ve kontrol et
sleep 90
kubectl get pods -n pixpos
kubectl logs -n pixpos -l app=pixpos-api --tail=50
```

---

## 💡 NEDEN ÇALIŞACAK?

| Önceki Yaklaşım | Yeni Yaklaşım |
|-----------------|---------------|
| `COPY node_modules` | `pnpm deploy` |
| Symlink'ler kopyalanıyor | Gerçek dosyalar kopyalanıyor |
| Kırık referanslar | İzole, çalışan yapı |

`pnpm deploy` komutu:
1. Hedef package'ın tüm dependencies'ini toplar
2. Symlink'leri gerçek dosyalara çevirir
3. `/deploy` klasörüne production-ready yapı oluşturur

---

## ⚠️ OLASI HATALAR

### Hata: `@mega-pos/api` bulunamadı
```bash
# package.json'daki name'i kontrol et
cat apps/api/package.json | grep name
# Eğer farklıysa, deploy komutundaki ismi değiştir
```

### Hata: `@mega-pos/shared` build hatası
```bash
# Shared package'ı manuel build et
cd packages/shared && pnpm build
```

### Hata: migrations klasörü yok
```bash
# Dockerfile'dan bu satırı kaldır veya || true ekle
COPY --from=builder /app/apps/api/src/migrations ./src/migrations 2>/dev/null || true
```

---

## ✅ BAŞARI KRİTERLERİ

Pod çalıştığında şunu görmelisin:
```
NAME                         READY   STATUS    RESTARTS   AGE
pixpos-api-xxxxx-xxxxx       1/1     Running   0          1m
```

Ve loglar:
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [NestApplication] Nest application successfully started
```

---

**AWS Kiro**
