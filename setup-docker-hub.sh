#!/bin/bash

# Docker Hub Setup Script for CI/CD Pipeline
# This script helps set up Docker Hub credentials in Jenkins

echo "=== Docker Hub Setup for CI/CD Pipeline ==="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Docker is installed"

# Prompt for Docker Hub credentials
echo ""
echo "Please enter your Docker Hub credentials:"
read -p "Docker Hub Username: " DOCKER_USERNAME
read -s -p "Docker Hub Password/Access Token: " DOCKER_PASSWORD
echo ""

# Test Docker Hub login
echo "🔐 Testing Docker Hub login..."
echo "$DOCKER_PASSWORD" | docker login docker.io --username "$DOCKER_USERNAME" --password-stdin

if [ $? -eq 0 ]; then
    echo "✅ Docker Hub login successful!"
    echo ""
    echo "📋 Jenkins Setup Instructions:"
    echo "1. Go to Jenkins Dashboard > Manage Jenkins > Manage Credentials"
    echo "2. Click on 'global' domain > Add Credentials"
    echo "3. Choose 'Username with password' credential type"
    echo "4. Enter the following details:"
    echo "   - Username: $DOCKER_USERNAME"
    echo "   - Password: [your Docker Hub password/token]"
    echo "   - ID: docker-hub-credentials"
    echo "   - Description: Docker Hub Registry Credentials"
    echo ""
    echo "5. Click 'OK' to save the credentials"
    echo ""
    echo "🎯 Your Jenkinsfile is already configured to use these credentials!"
else
    echo "❌ Docker Hub login failed. Please check your credentials."
    exit 1
fi

# Logout after testing
docker logout docker.io
echo "✅ Setup completed successfully!"
