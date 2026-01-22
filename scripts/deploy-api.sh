#!/bin/bash
set -e

echo "🚀 MEGA POS API Deployment Script"
echo "=================================="

# Variables
AWS_REGION="eu-central-1"
AWS_ACCOUNT_ID="986906625644"
ECR_REPO="mega-pos/api"
IMAGE_TAG="${1:-latest}"
TIMESTAMP_TAG=$(date +%Y%m%d-%H%M%S)
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"

echo ""
echo "📦 Step 1: Building Docker image (linux/amd64)..."
cd "$(dirname "$0")/.."
docker build --platform linux/amd64 -t ${ECR_REPO}:${IMAGE_TAG} -f apps/api/Dockerfile .

echo ""
echo "🔐 Step 2: Login to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | \
  docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

echo ""
echo "🏷️  Step 3: Tagging image..."
docker tag ${ECR_REPO}:${IMAGE_TAG} ${ECR_URI}:${IMAGE_TAG}
docker tag ${ECR_REPO}:${IMAGE_TAG} ${ECR_URI}:${TIMESTAMP_TAG}

echo ""
echo "⬆️  Step 4: Pushing to ECR..."
docker push ${ECR_URI}:${IMAGE_TAG}
docker push ${ECR_URI}:${TIMESTAMP_TAG}

echo ""
echo "☸️  Step 5: Applying Kubernetes manifests..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/service-account.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

echo ""
echo "⏳ Step 6: Restarting deployment..."
kubectl rollout restart deployment/mega-pos-api -n mega-pos

echo ""
echo "⏳ Step 7: Waiting for deployment..."
kubectl rollout status deployment/mega-pos-api -n mega-pos --timeout=5m

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Checking pods..."
kubectl get pods -n mega-pos

echo ""
echo "🌐 Checking ingress..."
kubectl get ingress -n mega-pos

echo ""
echo "🎉 API deployed successfully!"
echo "   URL: https://api.pixpos.cloud/api"
