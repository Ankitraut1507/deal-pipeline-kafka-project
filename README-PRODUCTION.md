# Production Deployment Guide

## Overview

This guide covers the production deployment of the Deal Pipeline application using Docker Compose with proper secrets management, security configurations, and monitoring.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- SSL certificates (for HTTPS)
- Production server with sufficient resources
- Host directory: `/data/mongodb` (for MongoDB persistence)

## Environment Setup

### 1. Host Directory Setup

Create required host directory on EC2:
```bash
# Create MongoDB data directory
sudo mkdir -p /data/mongodb
sudo chown -R ec2-user:ec2-user /data/mongodb
```

### 2. Environment Variables

Copy the example environment file:
```bash
cp .env.example .env.production
```

Update `.env.production` with your production values:
- `CORS_ALLOWED_ORIGINS`: Your production domain
- Resource limits and monitoring settings

### 2. Secrets Management

Create the secrets directory and required secret files:

```bash
mkdir -p secrets
```

Create the following files in the `secrets/` directory:

#### `secrets/jwt_secret.txt`
```
YOUR_SUPER_SECRET_JWT_KEY_MINIMUM_256_BITS_LONG
```

#### `secrets/mongo_root_username.txt`
```
admin
```

#### `secrets/mongo_root_password.txt`
```
YOUR_SECURE_MONGO_ROOT_PASSWORD
```

#### `secrets/mongo_app_password.txt`
```
YOUR_SECURE_MONGO_APP_PASSWORD
```

**Important**: Never commit these secret files to version control!

### 3. SSL Configuration

Place your SSL certificates in the `ssl/` directory:
- `ssl/cert.pem` - SSL certificate
- `ssl/key.pem` - SSL private key

## Deployment

### Quick Deploy

```bash
chmod +x deploy.sh
./deploy.sh prod
```

### Manual Deploy

1. **Build and start services:**
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

2. **Pull latest images and deploy:**
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

## Configuration

### Production Features

- **Security**: SSL termination, security headers, rate limiting
- **Performance**: Connection pooling, gzip compression, resource limits
- **Monitoring**: Health checks, metrics, structured logging
- **Scalability**: Multiple replicas, load balancing
- **Reliability**: Automatic restarts, health monitoring

### Service Configuration

#### Backend
- **Profile**: `prod`
- **Port**: 8080
- **Replicas**: 2
- **Memory**: 1GB limit, 512MB reservation
- **CPU**: 1.0 limit, 0.5 reservation

#### Frontend
- **Port**: 80/443
- **Replicas**: 2
- **Memory**: 256MB limit, 128MB reservation
- **CPU**: 0.25 limit, 0.1 reservation

#### MongoDB
- **Version**: 7.0
- **Memory**: 1GB limit, 512MB reservation
- **CPU**: 0.5 limit, 0.25 reservation
- **Storage**: Named volume with persistence

## Monitoring

### Health Checks

All services include health checks:
- **Backend**: `/actuator/health`
- **Frontend**: HTTP 200 response
- **MongoDB**: Database ping

### Logs

View logs for all services:
```bash
docker compose -f docker-compose.prod.yml logs -f
```

View logs for specific service:
```bash
docker compose -f docker-compose.prod.yml logs -f backend
```

### Metrics

Backend exposes metrics at `/actuator/metrics` when enabled.

## Security

### Network Security
- Custom bridge network isolation
- Internal service communication
- SSL/TLS encryption

### Application Security
- JWT authentication
- CORS protection
- Security headers
- Rate limiting
- Input validation

### Secrets Management
- Docker secrets for sensitive data
- Environment variable injection
- No secrets in images

## Backup and Recovery

### Database Backup

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec mongodb mongodump --out /backup/$(date +%Y%m%d_%H%M%S)

# Restore backup
docker-compose -f docker-compose.prod.yml exec mongodb mongorestore /backup/backup_directory
```

### Volume Backup

```bash
# Backup MongoDB volume
docker run --rm -v mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb_backup.tar.gz -C /data .
```

## Troubleshooting

### Common Issues

1. **Services not starting**
   - Check environment variables
   - Verify secret files exist
   - Review logs: `docker-compose logs`

2. **Database connection issues**
   - Verify MongoDB is running
   - Check authentication credentials
   - Review network configuration

3. **SSL issues**
   - Verify certificate paths
   - Check certificate validity
   - Review nginx configuration

### Debug Commands

```bash
# Check service status
docker compose -f docker-compose.prod.yml ps

# View detailed logs
docker compose -f docker-compose.prod.yml logs --tail=100

# Execute commands in container
docker compose -f docker-compose.prod.yml exec backend bash

# Inspect volumes
docker volume ls
docker volume inspect mongodb_data
```

## Maintenance

### Updates

1. Update images:
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production pull
```

2. Redeploy:
```bash
./deploy.sh prod
```

### Scaling

Scale services manually:
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --scale backend=3 --scale frontend=3
```

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Spring profile | `prod` |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRATION` | JWT expiration time | `3600000` |
| `MONGO_ROOT_USERNAME` | MongoDB root user | `admin` |
| `MONGO_ROOT_PASSWORD` | MongoDB root password | Required |
| `MONGO_APP_USER` | MongoDB app user | `app_user` |
| `MONGO_APP_PASSWORD` | MongoDB app password | Required |

## Support

For deployment issues:
1. Check logs and health status
2. Verify environment configuration
3. Review this troubleshooting guide
4. Contact the development team
