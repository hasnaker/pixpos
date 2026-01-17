#!/bin/bash
set -e

echo "🎨 MEGA POS Frontend Deployment Script"
echo "======================================="

# Variables
S3_BUCKET="mega-pos-frontend-hsdcore"
CLOUDFRONT_ID="E2M6213CML6FZC"
API_URL="https://cafe.hsdcore.com/api"

echo ""
echo "📦 Step 1: Building frontend applications..."

# Build Boss
echo "  → Building Boss..."
cd apps/boss
VITE_API_URL=${API_URL} npm run build
cd ../..

# Build POS
echo "  → Building POS..."
cd apps/pos
VITE_API_URL=${API_URL} npm run build
cd ../..

# Build Waiter
echo "  → Building Waiter..."
cd apps/waiter
VITE_API_URL=${API_URL} npm run build
cd ../..

# Build Kitchen
echo "  → Building Kitchen..."
cd apps/kitchen
VITE_API_URL=${API_URL} npm run build
cd ../..

# Build QR Menu
echo "  → Building QR Menu..."
cd apps/qr-menu
VITE_API_URL=${API_URL} npm run build
cd ../..

echo ""
echo "⬆️  Step 2: Uploading to S3..."

# Upload Boss
echo "  → Uploading Boss..."
aws s3 sync apps/boss/dist s3://${S3_BUCKET}/boss/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html"

aws s3 cp apps/boss/dist/index.html s3://${S3_BUCKET}/boss/index.html \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html"

# Upload POS
echo "  → Uploading POS..."
aws s3 sync apps/pos/dist s3://${S3_BUCKET}/pos/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html"

aws s3 cp apps/pos/dist/index.html s3://${S3_BUCKET}/pos/index.html \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html"

# Upload Waiter
echo "  → Uploading Waiter..."
aws s3 sync apps/waiter/dist s3://${S3_BUCKET}/waiter/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "manifest.webmanifest" \
  --exclude "sw.js" \
  --exclude "registerSW.js"

aws s3 cp apps/waiter/dist/index.html s3://${S3_BUCKET}/waiter/index.html \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html"

# Upload PWA files with no-cache
for file in manifest.webmanifest sw.js registerSW.js workbox-*.js; do
  if [ -f "apps/waiter/dist/$file" ]; then
    aws s3 cp "apps/waiter/dist/$file" "s3://${S3_BUCKET}/waiter/$file" \
      --cache-control "public, max-age=0, must-revalidate"
  fi
done

# Upload Kitchen
echo "  → Uploading Kitchen..."
aws s3 sync apps/kitchen/dist s3://${S3_BUCKET}/kitchen/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html"

aws s3 cp apps/kitchen/dist/index.html s3://${S3_BUCKET}/kitchen/index.html \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html"

# Upload QR Menu
echo "  → Uploading QR Menu..."
aws s3 sync apps/qr-menu/dist s3://${S3_BUCKET}/menu/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html"

aws s3 cp apps/qr-menu/dist/index.html s3://${S3_BUCKET}/menu/index.html \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html"

# Upload root index (redirect to POS)
echo "  → Creating root index..."
cat > /tmp/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=/pos/">
  <title>MEGA POS</title>
</head>
<body>
  <p>Redirecting to POS...</p>
</body>
</html>
EOF

aws s3 cp /tmp/index.html s3://${S3_BUCKET}/index.html \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html"

echo ""
echo "🔄 Step 3: Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id ${CLOUDFRONT_ID} \
  --paths "/*" \
  --no-cli-pager

echo ""
echo "✅ Frontend deployment complete!"
echo ""
echo "🌐 URLs:"
echo "   Boss:    https://cafe.hsdcore.com/boss/"
echo "   POS:     https://cafe.hsdcore.com/pos/"
echo "   Waiter:  https://cafe.hsdcore.com/waiter/"
echo "   Kitchen: https://cafe.hsdcore.com/kitchen/"
echo "   Menu:    https://cafe.hsdcore.com/menu/"
