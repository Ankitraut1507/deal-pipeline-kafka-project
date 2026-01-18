#!/bin/bash

# Deployment Script with Rollback Capability
# This script handles deployment with automatic rollback on failure

set -e

# Configuration
EC2_USER="ec2-user"
EC2_HOST="13.201.73.68"
APP_DIR="/home/ec2-user/app"
BACKUP_DIR="/home/ec2-user/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=== Deployment Script with Rollback ==="
echo "Timestamp: $TIMESTAMP"

# Function to execute commands on EC2
execute_on_ec2() {
    ssh -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "$1"
}

# Function to handle rollback
rollback() {
    echo "🔄 Rolling back deployment..."
    if execute_on_ec2 "[ -d '$BACKUP_DIR/backup_$TIMESTAMP' ]"; then
        execute_on_ec2 "cp -r $BACKUP_DIR/backup_$TIMESTAMP/* $APP_DIR/ && cd $APP_DIR && docker compose up -d"
        echo "✅ Rollback completed successfully"
    else
        echo "❌ No backup found for rollback"
    fi
}

# Trap to handle failures
trap 'echo "❌ Deployment failed! Initiating rollback..."; rollback; exit 1' ERR

echo "📦 Creating backup of current deployment..."
execute_on_ec2 "mkdir -p $BACKUP_DIR && cp -r $APP_DIR $BACKUP_DIR/backup_$TIMESTAMP"

echo "🔄 Pulling latest images from ECR..."
execute_on_ec2 "cd $APP_DIR && docker compose pull"

echo "🚀 Deploying new version..."
execute_on_ec2 "cd $APP_DIR && docker compose up -d"

echo "⏳ Waiting for services to start..."
sleep 30

echo "🏥 Performing health checks..."
execute_on_ec2 "curl -f http://localhost:8080/actuator/health"
execute_on_ec2 "curl -f http://localhost"

echo "🧹 Cleaning up old images..."
execute_on_ec2 "docker image prune -f"

echo "✅ Deployment completed successfully!"
echo "📁 Backup stored at: $BACKUP_DIR/backup_$TIMESTAMP"
