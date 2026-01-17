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

# pnpm deploy - TÜM DEPENDENCIES'İ TEK KLASÖRE TOPLAR (hoisted = flat node_modules)
WORKDIR /app
RUN pnpm --filter @mega-pos/api deploy --prod /deploy --config.node-linker=hoisted

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
# COPY --from=builder /app/apps/api/src/migrations ./src/migrations

# Uploads klasörü
RUN mkdir -p uploads/products

EXPOSE 3000

CMD ["node", "dist/main.js"]
