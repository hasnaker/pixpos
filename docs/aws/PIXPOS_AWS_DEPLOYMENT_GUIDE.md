# PIXPOS AWS Deployment Rehberi

**Tarih:** 16 Ocak 2026  
**Proje:** PIXPOS - Enterprise Cafe/Restaurant POS Sistemi  
**Hedef:** Production-ready AWS deployment  
**Tahmini Süre:** 2-3 saat  
**Tahmini Maliyet:** ~$300-450/ay

---

## 📋 Proje Özeti

| Uygulama | Klasör | Teknoloji | Domain | Deployment |
|----------|--------|-----------|--------|------------|
| API | apps/api | NestJS | api.pixpos.cloud | EKS (Container) |
| POS | apps/pos | React | pos.pixpos.cloud | S3 + CloudFront |
| BOSS (OS) | apps/boss | React | os.pixpos.cloud | S3 + CloudFront |
| Kitchen | apps/kitchen | React | kitchen.pixpos.cloud | S3 + CloudFront |
| Waiter | apps/waiter | React | waiter.pixpos.cloud | S3 + CloudFront |
| QR Menu | apps/qr-menu | React | *.pixpos.site | S3 + CloudFront |

**Database:** PostgreSQL (RDS)  
**Cache:** Redis (ElastiCache - shared-redis mevcut)  
**Gelecek:** IoT, İK, PDKS, Ödeme (771 özellik)

---

## 🏗️ Mimari Diyagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                  INTERNET                                        │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        │                              │                              │
        ▼                              ▼                              ▼
┌───────────────┐            ┌───────────────┐            ┌───────────────┐
│   ROUTE 53    │            │  CLOUDFRONT   │            │     WAF       │
│               │            │    (CDN)      │            │  pixpos-waf   │
│ pixpos.cloud  │            │               │            │               │
│ pixpos.site   │            │ 5 React Apps  │            │ SQL/XSS/Rate  │
└───────┬───────┘            │ + QR Wildcard │            └───────┬───────┘
        │                    └───────┬───────┘                    │
        │                            │                            │
        └────────────────────────────┼────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────────────┐
│                     EKS CLUSTER (hsd-monitoring)                                 │
│                                    │                                             │
│  ┌─────────────────────────────────┼─────────────────────────────────────────┐  │
│  │                    NAMESPACE: pixpos                                       │  │
│  │                                                                            │  │
│  │  ┌─────────────────┐                    ┌─────────────────┐               │  │
│  │  │   pixpos-api    │                    │   pixpos-ws     │               │  │
│  │  │     NestJS      │                    │   WebSocket     │               │  │
│  │  │   Replicas: 2   │                    │   Replicas: 2   │               │  │
│  │  │   HPA: 2-10     │                    │   (Real-time)   │               │  │
│  │  └────────┬────────┘                    └────────┬────────┘               │  │
│  │           │                                      │                        │  │
│  │           └──────────────┬───────────────────────┘                        │  │
│  │                          │                                                │  │
│  │                    ┌─────┴─────┐                                          │  │
│  │                    │    ALB    │                                          │  │
│  │                    │ pixpos-lb │                                          │  │
│  │                    └───────────┘                                          │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                   │
│  Node Pool: general-pool (t3.large, m5.large)                                    │
└───────────────────────────────────────────────────────────────────────────────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
        ▼                            ▼                            ▼
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│      RDS      │          │  ELASTICACHE  │          │   DYNAMODB    │
│  PostgreSQL   │          │    REDIS      │          │  (Gelecek)    │
│               │          │               │          │               │
│ pixpos-db     │          │ shared-redis  │          │ IoT verileri  │
│ db.t3.medium  │          │ (MEVCUT)      │          │ Session cache │
│ 100GB         │          │               │          │               │
└───────────────┘          └───────────────┘          └───────────────┘
```

---

## 🚀 DEPLOYMENT ADIMLARI

### Ön Koşullar
- AWS CLI yapılandırılmış (clinisyn-deploy user)
- kubectl EKS'e bağlı (`aws eks update-kubeconfig --name hsd-monitoring --region eu-central-1`)
- Docker kurulu (ECR push için)
- Domain'ler satın alınmış (pixpos.cloud, pixpos.site)

---

## ADIM 1: Route 53 Hosted Zone Oluştur

```bash
# pixpos.cloud için hosted zone
aws route53 create-hosted-zone \
  --name pixpos.cloud \
  --caller-reference "pixpos-cloud-$(date +%s)" \
  --hosted-zone-config Comment="PIXPOS Platform Domain"

# pixpos.site için hosted zone (QR menüler)
aws route53 create-hosted-zone \
  --name pixpos.site \
  --caller-reference "pixpos-site-$(date +%s)" \
  --hosted-zone-config Comment="PIXPOS QR Menu Domain"
```

**Önemli:** Hosted zone oluşturduktan sonra NS kayıtlarını domain registrar'a ekle!

---

## ADIM 2: ACM SSL Sertifikaları

### 2.1 CloudFront için (us-east-1 - ZORUNLU)
```bash
# Wildcard sertifika - pixpos.cloud
aws acm request-certificate \
  --domain-name "*.pixpos.cloud" \
  --subject-alternative-names "pixpos.cloud" \
  --validation-method DNS \
  --region us-east-1

# Wildcard sertifika - pixpos.site (QR menüler)
aws acm request-certificate \
  --domain-name "*.pixpos.site" \
  --subject-alternative-names "pixpos.site" \
  --validation-method DNS \
  --region us-east-1
```

### 2.2 ALB için (eu-central-1)
```bash
# API için sertifika
aws acm request-certificate \
  --domain-name "api.pixpos.cloud" \
  --subject-alternative-names "ws.pixpos.cloud" \
  --validation-method DNS \
  --region eu-central-1
```

### 2.3 DNS Validation
```bash
# Sertifika ARN'lerini al
aws acm list-certificates --region us-east-1
aws acm list-certificates --region eu-central-1

# Validation kayıtlarını Route 53'e ekle (her sertifika için)
aws acm describe-certificate --certificate-arn <ARN> --region <REGION>
# ResourceRecord değerlerini Route 53'e CNAME olarak ekle
```

---

## ADIM 3: RDS PostgreSQL Oluştur

```bash
# Subnet group (mevcut EKS private subnet'lerini kullan)
aws rds create-db-subnet-group \
  --db-subnet-group-name pixpos-db-subnet \
  --db-subnet-group-description "PIXPOS Database Subnets" \
  --subnet-ids subnet-01f9210eb0a8bc064 subnet-04a3d25632fb96726 \
  --region eu-central-1

# Security Group
aws ec2 create-security-group \
  --group-name pixpos-db-sg \
  --description "PIXPOS RDS Security Group" \
  --vpc-id vpc-05489cdddb3dfc143 \
  --region eu-central-1

# PostgreSQL 5432 portunu EKS node'larına aç
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 5432 \
  --source-group sg-eks-nodes \
  --region eu-central-1

# RDS Instance oluştur
aws rds create-db-instance \
  --db-instance-identifier pixpos-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 16.4 \
  --master-username pixpos_admin \
  --master-user-password "<GÜÇLÜ-ŞİFRE>" \
  --allocated-storage 100 \
  --storage-type gp3 \
  --db-subnet-group-name pixpos-db-subnet \
  --vpc-security-group-ids sg-xxxxx \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "Mon:04:00-Mon:05:00" \
  --storage-encrypted \
  --no-publicly-accessible \
  --region eu-central-1
```

---

## ADIM 4: Secrets Manager

```bash
# Database credentials
aws secretsmanager create-secret \
  --name pixpos/database \
  --description "PIXPOS Database Credentials" \
  --secret-string '{
    "host": "pixpos-db.xxxxx.eu-central-1.rds.amazonaws.com",
    "port": 5432,
    "database": "pixpos",
    "username": "pixpos_admin",
    "password": "<GÜÇLÜ-ŞİFRE>"
  }' \
  --region eu-central-1

# JWT Secret
aws secretsmanager create-secret \
  --name pixpos/jwt \
  --description "PIXPOS JWT Secret" \
  --secret-string '{
    "secret": "<32-KARAKTER-RANDOM-STRING>",
    "expiresIn": "7d"
  }' \
  --region eu-central-1

# Redis (shared-redis kullanılacak - MEVCUT)
aws secretsmanager create-secret \
  --name pixpos/redis \
  --description "PIXPOS Redis Connection" \
  --secret-string '{
    "host": "master.shared-redis.uld2os.euc1.cache.amazonaws.com",
    "port": 6379
  }' \
  --region eu-central-1
```

---

## ADIM 5: ECR Repository

```bash
# API için ECR repo
aws ecr create-repository \
  --repository-name pixpos/api \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256 \
  --region eu-central-1

# Lifecycle policy (eski image'ları temizle)
aws ecr put-lifecycle-policy \
  --repository-name pixpos/api \
  --lifecycle-policy-text '{
    "rules": [{
      "rulePriority": 1,
      "description": "Keep last 10 images",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {"type": "expire"}
    }]
  }' \
  --region eu-central-1
```

---

## ADIM 6: S3 Buckets (React Apps)

```bash
# Her React app için S3 bucket
for app in pos boss kitchen waiter qr-menu; do
  aws s3api create-bucket \
    --bucket pixpos-${app}-986906625644 \
    --region eu-central-1 \
    --create-bucket-configuration LocationConstraint=eu-central-1

  # Static website hosting
  aws s3 website s3://pixpos-${app}-986906625644 \
    --index-document index.html \
    --error-document index.html

  # Block public access (CloudFront OAI kullanacağız)
  aws s3api put-public-access-block \
    --bucket pixpos-${app}-986906625644 \
    --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
done
```

---

## ADIM 7: CloudFront Distributions

### 7.1 Origin Access Identity (OAI)
```bash
aws cloudfront create-origin-access-identity \
  --origin-access-identity-config \
  CallerReference="pixpos-oai-$(date +%s)",Comment="PIXPOS S3 Access"
```

### 7.2 CloudFront Distribution (Her app için)

**pos.pixpos.cloud örneği:**
```bash
aws cloudfront create-distribution \
  --distribution-config '{
    "CallerReference": "pixpos-pos-'$(date +%s)'",
    "Aliases": {"Quantity": 1, "Items": ["pos.pixpos.cloud"]},
    "DefaultRootObject": "index.html",
    "Origins": {
      "Quantity": 1,
      "Items": [{
        "Id": "S3-pixpos-pos",
        "DomainName": "pixpos-pos-986906625644.s3.eu-central-1.amazonaws.com",
        "S3OriginConfig": {"OriginAccessIdentity": "origin-access-identity/cloudfront/EXXXXX"}
      }]
    },
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3-pixpos-pos",
      "ViewerProtocolPolicy": "redirect-to-https",
      "AllowedMethods": {"Quantity": 2, "Items": ["GET", "HEAD"]},
      "CachedMethods": {"Quantity": 2, "Items": ["GET", "HEAD"]},
      "ForwardedValues": {"QueryString": false, "Cookies": {"Forward": "none"}},
      "MinTTL": 0,
      "DefaultTTL": 86400,
      "MaxTTL": 31536000,
      "Compress": true
    },
    "CustomErrorResponses": {
      "Quantity": 1,
      "Items": [{
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }]
    },
    "ViewerCertificate": {
      "ACMCertificateArn": "arn:aws:acm:us-east-1:986906625644:certificate/xxxxx",
      "SSLSupportMethod": "sni-only",
      "MinimumProtocolVersion": "TLSv1.2_2021"
    },
    "Enabled": true,
    "Comment": "PIXPOS POS App"
  }'
```

**Diğer app'ler için aynı pattern'i kullan:**
- os.pixpos.cloud → pixpos-boss bucket
- kitchen.pixpos.cloud → pixpos-kitchen bucket
- waiter.pixpos.cloud → pixpos-waiter bucket
- *.pixpos.site → pixpos-qr-menu bucket (wildcard)

---

## ADIM 8: WAF Web ACL

```bash
aws wafv2 create-web-acl \
  --name pixpos-waf \
  --scope CLOUDFRONT \
  --default-action Allow={} \
  --visibility-config SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=pixpos-waf \
  --rules '[
    {
      "Name": "AWSManagedRulesCommonRuleSet",
      "Priority": 1,
      "Statement": {
        "ManagedRuleGroupStatement": {
          "VendorName": "AWS",
          "Name": "AWSManagedRulesCommonRuleSet"
        }
      },
      "OverrideAction": {"None": {}},
      "VisibilityConfig": {
        "SampledRequestsEnabled": true,
        "CloudWatchMetricsEnabled": true,
        "MetricName": "CommonRuleSet"
      }
    },
    {
      "Name": "AWSManagedRulesSQLiRuleSet",
      "Priority": 2,
      "Statement": {
        "ManagedRuleGroupStatement": {
          "VendorName": "AWS",
          "Name": "AWSManagedRulesSQLiRuleSet"
        }
      },
      "OverrideAction": {"None": {}},
      "VisibilityConfig": {
        "SampledRequestsEnabled": true,
        "CloudWatchMetricsEnabled": true,
        "MetricName": "SQLiRuleSet"
      }
    },
    {
      "Name": "RateLimitRule",
      "Priority": 3,
      "Statement": {
        "RateBasedStatement": {
          "Limit": 2000,
          "AggregateKeyType": "IP"
        }
      },
      "Action": {"Block": {}},
      "VisibilityConfig": {
        "SampledRequestsEnabled": true,
        "CloudWatchMetricsEnabled": true,
        "MetricName": "RateLimit"
      }
    }
  ]' \
  --region us-east-1
```

---

## ADIM 9: EKS Namespace ve IRSA

### 9.1 Namespace
```bash
kubectl create namespace pixpos
kubectl label namespace pixpos product=pixpos environment=production
```

### 9.2 IAM Role (IRSA)
```bash
# Trust policy
cat > pixpos-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::986906625644:oidc-provider/oidc.eks.eu-central-1.amazonaws.com/id/BD467A006B322482520A9D4747B62876"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "oidc.eks.eu-central-1.amazonaws.com/id/BD467A006B322482520A9D4747B62876:sub": "system:serviceaccount:pixpos:pixpos-api-sa"
      }
    }
  }]
}
EOF

aws iam create-role \
  --role-name pixpos-api-role \
  --assume-role-policy-document file://pixpos-trust-policy.json

# Permissions policy
cat > pixpos-permissions.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:eu-central-1:986906625644:secret:pixpos/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::pixpos-*/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::pixpos-*"
    }
  ]
}
EOF

aws iam put-role-policy \
  --role-name pixpos-api-role \
  --policy-name pixpos-api-policy \
  --policy-document file://pixpos-permissions.json
```

### 9.3 Service Account
```yaml
# pixpos-service-account.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: pixpos-api-sa
  namespace: pixpos
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::986906625644:role/pixpos-api-role
```

```bash
kubectl apply -f pixpos-service-account.yaml
```

---

## ADIM 10: Kubernetes Manifests

### 10.1 ConfigMap
```yaml
# pixpos-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: pixpos-config
  namespace: pixpos
data:
  NODE_ENV: "production"
  PORT: "3000"
  DATABASE_HOST: "pixpos-db.xxxxx.eu-central-1.rds.amazonaws.com"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "pixpos"
  REDIS_HOST: "master.shared-redis.uld2os.euc1.cache.amazonaws.com"
  REDIS_PORT: "6379"
  CORS_ORIGINS: "https://pos.pixpos.cloud,https://os.pixpos.cloud,https://kitchen.pixpos.cloud,https://waiter.pixpos.cloud"
```

### 10.2 Deployment
```yaml
# pixpos-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pixpos-api
  namespace: pixpos
  labels:
    app: pixpos-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: pixpos-api
  template:
    metadata:
      labels:
        app: pixpos-api
    spec:
      serviceAccountName: pixpos-api-sa
      containers:
      - name: pixpos-api
        image: 986906625644.dkr.ecr.eu-central-1.amazonaws.com/pixpos/api:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: pixpos-config
        env:
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: pixpos-db-secret
              key: password
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: pixpos-jwt-secret
              key: secret
        resources:
          requests:
            cpu: "250m"
            memory: "512Mi"
          limits:
            cpu: "1000m"
            memory: "1Gi"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 10.3 Service
```yaml
# pixpos-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: pixpos-api
  namespace: pixpos
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
  selector:
    app: pixpos-api
```

### 10.4 Ingress (ALB)
```yaml
# pixpos-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pixpos-ingress
  namespace: pixpos
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:eu-central-1:986906625644:certificate/xxxxx
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTPS":443}]'
    alb.ingress.kubernetes.io/ssl-redirect: '443'
    alb.ingress.kubernetes.io/healthcheck-path: /health
    alb.ingress.kubernetes.io/healthcheck-interval-seconds: '15'
    alb.ingress.kubernetes.io/healthcheck-timeout-seconds: '5'
    alb.ingress.kubernetes.io/healthy-threshold-count: '2'
    alb.ingress.kubernetes.io/unhealthy-threshold-count: '2'
spec:
  rules:
  - host: api.pixpos.cloud
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: pixpos-api
            port:
              number: 80
```

### 10.5 HPA (Horizontal Pod Autoscaler)
```yaml
# pixpos-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: pixpos-api-hpa
  namespace: pixpos
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: pixpos-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## ADIM 11: External Secrets (Opsiyonel)

```yaml
# pixpos-external-secrets.yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: pixpos-db-secret
  namespace: pixpos
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore
  target:
    name: pixpos-db-secret
  data:
  - secretKey: password
    remoteRef:
      key: pixpos/database
      property: password
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: pixpos-jwt-secret
  namespace: pixpos
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore
  target:
    name: pixpos-jwt-secret
  data:
  - secretKey: secret
    remoteRef:
      key: pixpos/jwt
      property: secret
```

---

## ADIM 12: Route 53 DNS Kayıtları

```bash
# API için A record (ALB alias)
aws route53 change-resource-record-sets \
  --hosted-zone-id ZXXXXX \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.pixpos.cloud",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z215JYRZR1TBD5",
          "DNSName": "k8s-pixpos-xxxxx.eu-central-1.elb.amazonaws.com",
          "EvaluateTargetHealth": true
        }
      }
    }]
  }'

# CloudFront için CNAME (her app için)
for subdomain in pos os kitchen waiter; do
  aws route53 change-resource-record-sets \
    --hosted-zone-id ZXXXXX \
    --change-batch '{
      "Changes": [{
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "'${subdomain}'.pixpos.cloud",
          "Type": "CNAME",
          "TTL": 300,
          "ResourceRecords": [{"Value": "dxxxxx.cloudfront.net"}]
        }
      }]
    }'
done
```

---

## ADIM 13: Docker Build & Push

```bash
# ECR login
aws ecr get-login-password --region eu-central-1 | \
  docker login --username AWS --password-stdin 986906625644.dkr.ecr.eu-central-1.amazonaws.com

# API build
cd apps/api
docker build -t pixpos-api:latest .
docker tag pixpos-api:latest 986906625644.dkr.ecr.eu-central-1.amazonaws.com/pixpos/api:latest
docker push 986906625644.dkr.ecr.eu-central-1.amazonaws.com/pixpos/api:latest

# React apps build & S3 upload
for app in pos boss kitchen waiter qr-menu; do
  cd apps/${app}
  npm run build
  aws s3 sync dist/ s3://pixpos-${app}-986906625644/ --delete
  # CloudFront cache invalidate
  aws cloudfront create-invalidation --distribution-id EXXXXX --paths "/*"
  cd ../..
done
```

---

## ADIM 14: Deploy to EKS

```bash
# Tüm manifest'leri uygula
kubectl apply -f pixpos-configmap.yaml
kubectl apply -f pixpos-external-secrets.yaml  # veya manual secret
kubectl apply -f pixpos-deployment.yaml
kubectl apply -f pixpos-service.yaml
kubectl apply -f pixpos-ingress.yaml
kubectl apply -f pixpos-hpa.yaml

# Durumu kontrol et
kubectl get pods -n pixpos
kubectl get svc -n pixpos
kubectl get ingress -n pixpos
kubectl get hpa -n pixpos
```

---

## ADIM 15: CloudWatch Alarms

```bash
# API 5xx errors
aws cloudwatch put-metric-alarm \
  --alarm-name pixpos-api-5xx-errors \
  --alarm-description "PIXPOS API 5xx errors" \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --dimensions Name=LoadBalancer,Value=app/k8s-pixpos-xxxxx/xxxxx \
  --alarm-actions arn:aws:sns:eu-central-1:986906625644:hsd-alerts

# RDS CPU
aws cloudwatch put-metric-alarm \
  --alarm-name pixpos-db-cpu-high \
  --alarm-description "PIXPOS DB CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 3 \
  --dimensions Name=DBInstanceIdentifier,Value=pixpos-db \
  --alarm-actions arn:aws:sns:eu-central-1:986906625644:hsd-alerts

# RDS Storage
aws cloudwatch put-metric-alarm \
  --alarm-name pixpos-db-storage-low \
  --alarm-description "PIXPOS DB Storage < 20GB" \
  --metric-name FreeStorageSpace \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 21474836480 \
  --comparison-operator LessThanThreshold \
  --evaluation-periods 1 \
  --dimensions Name=DBInstanceIdentifier,Value=pixpos-db \
  --alarm-actions arn:aws:sns:eu-central-1:986906625644:hsd-alerts
```

---

## 📊 Doğrulama Checklist

```bash
# 1. DNS çözümleme
nslookup api.pixpos.cloud
nslookup pos.pixpos.cloud

# 2. SSL sertifikaları
curl -I https://api.pixpos.cloud/health
curl -I https://pos.pixpos.cloud

# 3. API health check
curl https://api.pixpos.cloud/health

# 4. Pod durumu
kubectl get pods -n pixpos -o wide

# 5. Logs
kubectl logs -n pixpos -l app=pixpos-api --tail=100

# 6. RDS bağlantısı
kubectl exec -it -n pixpos deploy/pixpos-api -- nc -zv pixpos-db.xxxxx.rds.amazonaws.com 5432

# 7. Redis bağlantısı
kubectl exec -it -n pixpos deploy/pixpos-api -- nc -zv master.shared-redis.uld2os.euc1.cache.amazonaws.com 6379
```

---

## 💰 Maliyet Özeti

| Kaynak | Birim | Aylık Maliyet |
|--------|-------|---------------|
| EKS Node (ek t3.large x1) | $0.0832/saat | ~$60 |
| RDS db.t3.medium | $0.068/saat | ~$50 |
| RDS Storage 100GB gp3 | $0.115/GB | ~$12 |
| ALB | $0.0225/saat + LCU | ~$25 |
| CloudFront (5 dist) | Transfer + Request | ~$20-50 |
| S3 (5 bucket) | Storage + Request | ~$5 |
| Route 53 (2 zone) | $0.50/zone | ~$1 |
| Secrets Manager (3) | $0.40/secret | ~$1.20 |
| WAF | $5 + $1/rule | ~$10 |
| **TOPLAM** | | **~$185-215/ay** |

**Not:** Mevcut shared-redis kullanıldığı için ek Redis maliyeti yok.

---

## 🔮 Gelecek Modüller İçin Hazırlık

### IoT Modülü
```bash
# AWS IoT Core
aws iot create-thing --thing-name pixpos-device-001
aws iot create-policy --policy-name pixpos-iot-policy --policy-document file://iot-policy.json

# DynamoDB (time-series data)
aws dynamodb create-table \
  --table-name pixpos-iot-data \
  --attribute-definitions AttributeName=deviceId,AttributeType=S AttributeName=timestamp,AttributeType=N \
  --key-schema AttributeName=deviceId,KeyType=HASH AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

### İK/PDKS Modülü
```bash
# Mevcut hsd-pdks pattern'ini kullan
# DynamoDB tabloları: pixpos-employees, pixpos-attendance, pixpos-shifts
```

### Ödeme Modülü
```bash
# SQS Queue (webhook processing)
aws sqs create-queue --queue-name pixpos-payment-webhooks
aws sqs create-queue --queue-name pixpos-payment-webhooks-dlq

# Lambda (iyzico/stripe webhook handler)
# PCI-DSS için ayrı subnet önerilir
```

---

## 📞 Destek

| Konu | İletişim |
|------|----------|
| AWS Altyapı | AWS Kiro (bu doküman) |
| Uygulama Geliştirme | PIXPOS Dev Team |
| Güvenlik | Security Hub + GuardDuty alerts |
| Monitoring | SigNoz Dashboard |

---

## 📝 Değişiklik Geçmişi

| Tarih | Değişiklik | Yapan |
|-------|------------|-------|
| 16 Ocak 2026 | İlk versiyon | AWS Kiro |

---

**Hazırlayan:** AWS Kiro  
**Tarih:** 16 Ocak 2026  
**Durum:** ✅ Production-Ready Guide
