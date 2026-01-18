#!/bin/bash

# Production Deployment Script
# Usage: ./deploy.sh [environment]
# Environments: dev, staging, prod

set -e

ENVIRONMENT=${1:-dev}
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"

echo "🚀 Starting deployment for environment: $ENVIRONMENT"

# Set environment-specific configurations
case $ENVIRONMENT in
    "prod")
        COMPOSE_FILE="docker-compose.prod.yml"
        ENV_FILE=".env.production"
        echo "🔒 Using production configuration"
        ;;
    "staging")
        COMPOSE_FILE="docker-compose.yml"
        ENV_FILE=".env.staging"
        echo "🧪 Using staging configuration"
        ;;
    "dev"|*)
        COMPOSE_FILE="docker-compose.yml"
        ENV_FILE=".env"
        echo "🛠️ Using development configuration"
        ;;
esac

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Environment file $ENV_FILE not found!"
    echo "Please create $ENV_FILE based on .env.example"
    exit 1
fi

# Check if secrets directory exists for production
if [ "$ENVIRONMENT" = "prod" ]; then
    if [ ! -d "secrets" ]; then
        echo "❌ Secrets directory not found!"
        echo "Please create secrets directory and add required secret files"
        exit 1
    fi
    
    # Check required secret files
    REQUIRED_SECRETS=("jwt_secret.txt" "mongo_root_username.txt" "mongo_root_password.txt" "mongo_app_password.txt")
    for secret in "${REQUIRED_SECRETS[@]}"; do
        if [ ! -f "secrets/$secret" ]; then
            echo "❌ Secret file secrets/$secret not found!"
            exit 1
        fi
    done
fi

# Load environment variables
export COMPOSE_FILE="$COMPOSE_FILE"
export ENV_FILE="$ENV_FILE"

echo "📦 Building and starting services..."

# Stop existing services
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down

# Build images
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache

# Start services
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
echo "🔍 Checking service health..."

# Check backend health
if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✅ Backend service is healthy"
else
    echo "❌ Backend service is not healthy"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs backend
fi

# Check frontend health
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ Frontend service is healthy"
else
    echo "❌ Frontend service is not healthy"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs frontend
fi

# Check MongoDB connection
if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB is healthy"
else
    echo "❌ MongoDB is not healthy"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs mongodb
fi

echo "🎉 Deployment completed successfully!"
echo "📊 Service status:"
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

echo "🌐 Application URLs:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:8080"
echo "   MongoDB: localhost:27017"

if [ "$ENVIRONMENT" = "prod" ]; then
    echo "🔒 Production deployment completed"
    echo "📝 Remember to:"
    echo "   - Set up SSL certificates"
    echo "   - Configure domain names"
    echo "   - Set up monitoring and logging"
    echo "   - Backup the database regularly"
fi
