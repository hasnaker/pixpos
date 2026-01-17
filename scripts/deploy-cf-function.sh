#!/bin/bash

# PIXPOS CloudFront Function Deploy Script
# Bu script CloudFront function'ı günceller ve publish eder

set -e

FUNCTION_NAME="pixpos-tenant-routing"
DISTRIBUTION_ID="E1WY916L5H2MY9"
FUNCTION_FILE="scripts/cf-function-tenant-routing.js"

echo "🚀 PIXPOS CloudFront Function Deploy"
echo "======================================"

# 1. Mevcut function'ı al
echo "📥 Mevcut function bilgisi alınıyor..."
ETAG=$(aws cloudfront describe-function --name $FUNCTION_NAME --query 'ETag' --output text 2>/dev/null || echo "")

if [ -z "$ETAG" ]; then
    echo "❌ Function bulunamadı: $FUNCTION_NAME"
    echo "Yeni function oluşturuluyor..."
    
    aws cloudfront create-function \
        --name $FUNCTION_NAME \
        --function-config Comment="PIXPOS tenant routing with POS/Waiter blocking",Runtime="cloudfront-js-2.0" \
        --function-code fileb://$FUNCTION_FILE
    
    ETAG=$(aws cloudfront describe-function --name $FUNCTION_NAME --query 'ETag' --output text)
fi

# 2. Function'ı güncelle
echo "📝 Function güncelleniyor..."
aws cloudfront update-function \
    --name $FUNCTION_NAME \
    --function-config Comment="PIXPOS tenant routing with POS/Waiter blocking",Runtime="cloudfront-js-2.0" \
    --function-code fileb://$FUNCTION_FILE \
    --if-match $ETAG

# 3. Yeni ETag al
ETAG=$(aws cloudfront describe-function --name $FUNCTION_NAME --query 'ETag' --output text)

# 4. Function'ı publish et
echo "🚀 Function publish ediliyor..."
aws cloudfront publish-function \
    --name $FUNCTION_NAME \
    --if-match $ETAG

echo ""
echo "✅ CloudFront Function başarıyla güncellendi!"
echo ""
echo "📋 Değişiklikler:"
echo "   - /pos ve / → /boss'a yönlendirilir"
echo "   - /waiter → 'APK gerekli' mesajı gösterilir"
echo "   - Boss, Kitchen, QR Menu web'den erişilebilir"
echo ""
echo "⏳ Değişikliklerin yayılması 1-2 dakika sürebilir."
echo ""
echo "🔄 Cache temizlemek için:"
echo "   aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths '/*'"
