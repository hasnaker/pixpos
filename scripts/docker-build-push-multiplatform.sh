#!/bin/bash

# MEGA POS API - Multi-platform Docker Build & Push Script

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "MEGA POS API - Multi-platform Build & Push"
echo "=========================================="
echo ""

PROJECT_DIR="/Users/hasanaker/Downloads/Queen Q"
DOCKER_CMD="/Applications/Docker.app/Contents/Resources/bin/docker"
ECR_REGISTRY="986906625644.dkr.ecr.eu-central-1.amazonaws.com"
ECR_REPOSITORY="mega-pos/api"
IMAGE_TAG_LATEST="latest"
IMAGE_TAG_VERSION="v1.0.0"
AWS_REGION="eu-central-1"

# Step 1: ECR Login
echo -e "${YELLOW}Step 1: Logging into ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | \
  $DOCKER_CMD login --username AWS --password-stdin $ECR_REGISTRY
echo -e "${GREEN}✓ ECR login successful${NC}"
echo ""

# Step 2: Create buildx builder
echo -e "${YELLOW}Step 2: Setting up multi-platform builder...${NC}"
$DOCKER_CMD buildx create --name multiplatform-builder --use 2>/dev/null || $DOCKER_CMD buildx use multiplatform-builder
$DOCKER_CMD buildx inspect --bootstrap
echo -e "${GREEN}✓ Builder ready${NC}"
echo ""

# Step 3: Build and push multi-platform image
echo -e "${YELLOW}Step 3: Building and pushing multi-platform image...${NC}"
cd "$PROJECT_DIR"

$DOCKER_CMD buildx build \
  --platform linux/amd64,linux/arm64 \
  -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG_LATEST \
  -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG_VERSION \
  -f apps/api/Dockerfile \
  --push \
  .

echo -e "${GREEN}✓ Multi-platform build and push complete${NC}"
echo ""

# Step 4: Verify
echo -e "${YELLOW}Step 4: Verifying images in ECR...${NC}"
aws ecr describe-images \
  --repository-name $ECR_REPOSITORY \
  --region $AWS_REGION \
  --query 'imageDetails[*].[imageTags[0],imagePushedAt,imageSizeInBytes]' \
  --output table

echo ""
echo "=========================================="
echo -e "${GREEN}✓ MULTI-PLATFORM BUILD COMPLETE!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Restart deployment: kubectl rollout restart deployment/mega-pos-api -n mega-pos"
echo "2. Check pods: kubectl get pods -n mega-pos -w"
echo "3. Test API: curl https://cafe.hsdcore.com/api/health"
echo ""
