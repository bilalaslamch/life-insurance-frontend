This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Docker Setup

This project is containerized with Docker for the frontend only. The backend is already dockerized separately.

### Running the Frontend

To run the frontend in a Docker container:

```bash
# Build and start the frontend
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop the frontend
docker-compose down
```

### Individual Frontend Commands

```bash
# Build and run only the frontend
docker build -t life-insurance-frontend .
docker run -p 3000:3000 life-insurance-frontend

# View logs
docker-compose logs -f frontend
```

### Development vs Production

The docker-compose.yml is configured for development with:
- Hot reloading enabled
- Source code mounted as volumes for live changes

For production deployment:
1. Comment out the volume mounts in docker-compose.yml
2. Change the command from `npm run dev` to `npm start`

### Environment Variables

**Frontend:**
- `NEXT_PUBLIC_API_URL`: Set to `http://localhost:3001` (assumes backend is running on localhost:3001)

### Ports

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001 (run separately)

## DevOps & Deployment

### AWS Deployment Options

This application can be deployed to AWS using several approaches. Below are the recommended deployment strategies:

#### Option 1: Amazon ECS (Elastic Container Service) - Recommended

**Prerequisites:**
- AWS CLI configured
- Docker installed locally
- AWS ECR repository created

**Deployment Steps:**

1. **Create ECR Repository:**
```bash
aws ecr create-repository --repository-name life-insurance-frontend
```

2. **Build and Push Docker Image:**
```bash
# Get ECR login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t life-insurance-frontend .

# Tag image
docker tag life-insurance-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/life-insurance-frontend:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/life-insurance-frontend:latest
```

3. **Create ECS Cluster:**
```bash
aws ecs create-cluster --cluster-name life-insurance-cluster
```

4. **Create Task Definition:**
```json
{
  "family": "life-insurance-frontend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/life-insurance-frontend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NEXT_PUBLIC_API_URL",
          "value": "https://your-backend-api.com"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/life-insurance-frontend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

5. **Create Application Load Balancer and Target Group**
6. **Create ECS Service**

#### Option 2: AWS Elastic Beanstalk

**Prerequisites:**
- EB CLI installed (`pip install awsebcli`)
- Dockerfile configured for production

**Deployment Steps:**

1. **Initialize EB Application:**
```bash
eb init life-insurance-frontend --platform docker --region us-east-1
```

2. **Create Environment:**
```bash
eb create production --instance-type t3.small --envvars NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

3. **Deploy:**
```bash
eb deploy
```

#### Option 3: AWS App Runner

**Prerequisites:**
- Docker image pushed to ECR
- Source code in GitHub/GitLab

**Deployment Steps:**

1. **Create App Runner Service:**
   - Go to AWS App Runner console
   - Choose "Container registry"
   - Select ECR repository
   - Configure environment variables
   - Set up auto-scaling

#### Option 4: AWS Lambda + API Gateway (Serverless)

For serverless deployment, you would need to:
1. Use `@vercel/nft` for bundling
2. Configure API Gateway
3. Set up Lambda functions for each route

### CI/CD Pipeline

#### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1
    
    - name: Build, tag, and push image to Amazon ECR
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: life-insurance-frontend
        IMAGE_TAG: latest
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
    
    - name: Update ECS service
      run: |
        aws ecs update-service --cluster life-insurance-cluster --service life-insurance-frontend --force-new-deployment
```

### Infrastructure as Code (IaC)

#### AWS CDK Example

```typescript
import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';

export class LifeInsuranceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'LifeInsuranceVPC');

    // ECR Repository
    const repository = new ecr.Repository(this, 'FrontendRepository', {
      repositoryName: 'life-insurance-frontend'
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'LifeInsuranceCluster', {
      vpc: vpc
    });

    // ECS Service
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'FrontendTask', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    taskDefinition.addContainer('FrontendContainer', {
      image: ecs.ContainerImage.fromEcrRepository(repository),
      portMappings: [{ containerPort: 3000 }],
      environment: {
        'NEXT_PUBLIC_API_URL': 'https://your-backend-api.com'
      }
    });

    new ecs.FargateService(this, 'FrontendService', {
      cluster: cluster,
      taskDefinition: taskDefinition,
      desiredCount: 2
    });
  }
}
```

### Environment Configuration

#### Production Environment Variables

```bash
# Production environment variables
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

#### Staging Environment Variables

```bash
# Staging environment variables
NEXT_PUBLIC_API_URL=https://staging-api.yourdomain.com
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Monitoring and Logging

#### CloudWatch Integration

- Set up CloudWatch Logs for application logs
- Configure CloudWatch Alarms for CPU, memory, and error rates
- Use CloudWatch Dashboards for monitoring

#### Application Performance Monitoring

Consider integrating:
- AWS X-Ray for distributed tracing
- New Relic or DataDog for APM
- Sentry for error tracking

### Security Considerations

1. **Container Security:**
   - Use AWS ECR for image scanning
   - Implement least privilege IAM roles
   - Regular security updates

2. **Network Security:**
   - Use VPC with private subnets
   - Configure Security Groups properly
   - Enable WAF for web application firewall

3. **Secrets Management:**
   - Use AWS Secrets Manager for sensitive data
   - Implement environment variable encryption
   - Rotate credentials regularly

### Cost Optimization

1. **Resource Sizing:**
   - Start with minimal resources and scale up
   - Use Spot instances for non-critical workloads
   - Implement auto-scaling policies

2. **Storage:**
   - Use S3 for static assets
   - Implement CDN (CloudFront) for global distribution
   - Optimize Docker image size

### Backup and Disaster Recovery

1. **Data Backup:**
   - Regular ECR image backups
   - Configuration backups
   - Database backups (backend responsibility)

2. **Disaster Recovery:**
   - Multi-AZ deployment
   - Cross-region replication
   - Automated failover procedures

