# CI/CD Pipeline Setup Guide

## Overview

This project implements a complete CI/CD pipeline with the following flow:

**GitHub → Jenkins (CI) → Docker Image → Docker Hub → AWS ECR → Deployment**

## Architecture

```
┌───────────┐    ┌──────────┐    ┌─────────────┐    ┌───────────┐    ┌──────────┐    ┌───────────┐
│  GitHub   │───▶│  Jenkins │───▶│ Docker Hub  │───▶│  AWS ECR  │───▶│   EC2    │───▶│ Production│
│ Repository│    │   (CI)   │    │  Registry   │    │ Registry  │    │ Instance │    │   App     │
└───────────┘    └──────────┘    └─────────────┘    └───────────┘    └──────────┘    └───────────┘
```

## Prerequisites

### 1. Jenkins Setup
- Jenkins server with Docker installed
- Required Jenkins plugins:
  - Docker Pipeline
  - AWS Credentials
  - SSH Agent
  - Git

### 2. Required Credentials in Jenkins
Configure these credentials in Jenkins (Manage Jenkins > Manage Credentials):

1. **GitHub Credentials**
   - Type: Username with password
   - ID: `github-credentials`
   - Description: GitHub Repository Access

2. **Docker Hub Credentials**
   - Type: Username with password
   - ID: `docker-hub-credentials`
   - Description: Docker Hub Registry Credentials

3. **AWS ECR Credentials**
   - Type: AWS Credentials
   - ID: `aws-ecr-credentials`
   - Description: AWS ECR Access

4. **EC2 SSH Key**
   - Type: SSH Username with private key
   - ID: `ec2-key`
   - Username: `ec2-user`

### 3. AWS Setup
- ECR repository created for both images
- EC2 instance with Docker and Docker Compose installed
- Security groups configured for required ports (80, 443, 8080)

## Pipeline Stages

### 1. Checkout Code
- Clones the repository from GitHub
- Uses the `main` branch

### 2. Build Docker Images
- Builds backend and frontend Docker images
- Tags images for both Docker Hub and ECR registries
- Uses build number for versioning

### 3. Docker Hub Operations
- Logs into Docker Hub registry
- Pushes images to Docker Hub with version tags

### 4. AWS ECR Operations
- Logs into AWS ECR registry
- Pushes images to ECR with version tags

### 5. Deployment
- Connects to EC2 instance via SSH
- Pulls latest images from ECR
- Updates running containers

### 6. Health Check
- Verifies application health
- Tests backend and frontend endpoints

## Image Tagging Strategy

Images are tagged with:
- **Docker Hub**: `docker.io/ankitrautalways/{image-name}:{build-number}`
- **ECR**: `{account-id}.dkr.ecr.{region}.amazonaws.com/{image-name}:{build-number}`
- **Latest**: Both registries also maintain `latest` tags

## Environment Variables

The pipeline uses these environment variables:
- `AWS_REGION`: AWS region (ap-south-1)
- `AWS_ACCOUNT_ID`: AWS account ID (851725646494)
- `ECR_REGISTRY`: ECR registry URL
- `DOCKER_HUB_REGISTRY`: Docker Hub registry URL
- `DOCKER_HUB_NAMESPACE`: Docker Hub namespace (ankitrautalways)
- `BUILD_TAG`: Jenkins build number

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/Ankitraut1507/deal-pipeline-kafka-project.git
cd deal-pipeline-kafka-project
```

### 2. Set up Docker Hub Credentials
Run the setup script:
```bash
chmod +x setup-docker-hub.sh
./setup-docker-hub.sh
```

### 3. Configure Jenkins
1. Install required plugins
2. Add credentials as specified above
3. Create new pipeline job
4. Use the provided `Jenkinsfile`

### 4. Configure EC2 Instance
```bash
# Install Docker
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create app directory
mkdir -p /home/ec2-user/app
mkdir -p /home/ec2-user/backups
```

### 5. Deploy Initial Setup
Copy the following files to EC2:
- `docker-compose.prod.yml`
- Environment files (`.env.production`)
- Secrets directory

## Deployment Scripts

### Standard Deployment
The Jenkins pipeline handles automatic deployment.

### Manual Deployment with Rollback
```bash
chmod +x deploy-with-rollback.sh
./deploy-with-rollback.sh
```

## Monitoring and Troubleshooting

### Jenkins Logs
- View pipeline logs in Jenkins console
- Check stage-specific logs for failures

### EC2 Instance Logs
```bash
# View container logs
docker logs deal-pipeline-backend-prod
docker logs deal-pipeline-frontend-prod

# View Docker Compose logs
docker compose logs -f
```

### Health Checks
```bash
# Backend health
curl http://localhost:8080/actuator/health

# Frontend health
curl http://localhost
```

## Security Considerations

1. **Credential Management**: Store all credentials in Jenkins credentials store
2. **Network Security**: Configure security groups properly
3. **Secrets Management**: Use Docker secrets for sensitive data
4. **Image Security**: Scan images for vulnerabilities

## Rollback Procedure

If deployment fails:
1. The pipeline automatically rolls back using the backup script
2. Manual rollback can be triggered using `deploy-with-rollback.sh`
3. Previous images are maintained in both registries

## Performance Optimizations

1. **Docker Layer Caching**: Optimize Dockerfiles for better caching
2. **Parallel Builds**: Jenkins builds images in parallel
3. **Resource Limits**: Configure appropriate resource limits in production
4. **Health Checks**: Implement comprehensive health checks

## Maintenance

### Regular Tasks
- Clean up old Docker images
- Update Jenkins plugins
- Rotate credentials regularly
- Monitor storage usage

### Backup Strategy
- Automated backups before each deployment
- Version tags maintained in registries
- Configuration files backed up

## Support

For issues:
1. Check Jenkins pipeline logs
2. Verify EC2 instance connectivity
3. Validate credential configuration
4. Review Docker container logs
