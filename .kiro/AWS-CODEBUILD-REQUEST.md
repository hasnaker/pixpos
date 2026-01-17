# AWS CodeBuild ile AMD64 Docker Build

**Tarih:** 13 Ocak 2026  
**Öncelik:** 🔴 ACİL  
**Durum:** BEKLİYOR

---

## 🎯 Sorun

- Mac'te Docker yok
- Önceki build ARM64 yapıldı, EKS AMD64 istiyor
- Döngüden çıkmak için cloud build gerekli

---

## 📋 AWS Yöneticisi Yapacaklar

### Seçenek 1: AWS CodeBuild (Önerilen)

```bash
# 1. buildspec.yml oluştur
cat > buildspec.yml << 'EOF'
version: 0.2
phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 986906625644.dkr.ecr.eu-central-1.amazonaws.com
  build:
    commands:
      - echo Build started on `date`
      - docker build -f apps/api/Dockerfile -t mega-pos-api .
      - docker tag mega-pos-api:latest 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest
  post_build:
    commands:
      - echo Pushing the Docker image...
      - docker push 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest
EOF

# 2. CodeBuild project oluştur ve çalıştır
aws codebuild create-project \
  --name mega-pos-api-build \
  --source type=NO_SOURCE \
  --artifacts type=NO_ARTIFACTS \
  --environment type=LINUX_CONTAINER,computeType=BUILD_GENERAL1_SMALL,image=aws/codebuild/amazonlinux2-x86_64-standard:4.0,privilegedMode=true \
  --service-role arn:aws:iam::986906625644:role/codebuild-service-role \
  --region eu-central-1

# 3. Build başlat
aws codebuild start-build --project-name mega-pos-api-build
```

### Seçenek 2: EC2 Instance ile Build

```bash
# 1. Geçici EC2 başlat (Amazon Linux 2, t3.medium)
aws ec2 run-instances \
  --image-id ami-0faab6bdbac9486fb \
  --instance-type t3.medium \
  --key-name hsd-key \
  --security-group-ids sg-02de2cf73b6b6e1d8 \
  --subnet-id subnet-01f9210eb0a8bc064 \
  --iam-instance-profile Name=ec2-ecr-push-role \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=mega-pos-builder}]'

# 2. SSH ile bağlan ve build yap
ssh -i hsd-key.pem ec2-user@<INSTANCE_IP>

# EC2 içinde:
sudo yum install -y docker git
sudo systemctl start docker
sudo usermod -aG docker ec2-user

# Repo'yu clone et
git clone <REPO_URL> /tmp/mega-pos
cd /tmp/mega-pos

# ECR login
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 986906625644.dkr.ecr.eu-central-1.amazonaws.com

# Build ve push
docker build -f apps/api/Dockerfile -t 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest .
docker push 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest

# 3. EC2'yi terminate et
aws ec2 terminate-instances --instance-ids <INSTANCE_ID>
```

### Seçenek 3: GitHub Actions (Repo varsa)

```yaml
# .github/workflows/build.yml
name: Build and Push
on: workflow_dispatch
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-central-1
      - uses: aws-actions/amazon-ecr-login@v2
      - run: |
          docker build -f apps/api/Dockerfile -t 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest .
          docker push 986906625644.dkr.ecr.eu-central-1.amazonaws.com/mega-pos/api:latest
```

---

## ✅ Build Sonrası

```bash
# 1. Secret güncelle
kubectl delete secret mega-pos-secrets -n mega-pos 2>/dev/null || true

DB_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id mega-pos/production \
  --query 'SecretString' \
  --output text | jq -r '.password')

kubectl create secret generic mega-pos-secrets -n mega-pos \
  --from-literal=DB_HOST="mega-pos-db.crowkq8ykqeo.eu-central-1.rds.amazonaws.com" \
  --from-literal=DB_PORT="5432" \
  --from-literal=DB_USERNAME="megapos_user" \
  --from-literal=DB_PASSWORD="$DB_PASSWORD" \
  --from-literal=DB_DATABASE="megapos" \
  --from-literal=REDIS_URL="redis://master.shared-redis.uld2os.euc1.cache.amazonaws.com:6379" \
  --from-literal=JWT_SECRET="mega-pos-jwt-secret-2026" \
  --from-literal=NODE_ENV="production"

# 2. Deployment başlat
kubectl scale deployment mega-pos-api -n mega-pos --replicas=2

# 3. Durumu izle
kubectl get pods -n mega-pos -w
```

---

**ÖNEMLİ:** Build mutlaka x86_64/AMD64 makinede yapılmalı!

**Hazırlayan:** Chat Kiro  
**Tarih:** 13 Ocak 2026
