# Deal Pipeline Application

A full-stack application for managing deal pipelines with Spring Boot backend and Angular frontend.

## 🏗️ Architecture

- **Backend**: Spring Boot with MongoDB
- **Frontend**: Angular with Nginx
- **Database**: MongoDB
- **Containerization**: Docker & Docker Compose

## 🚀 Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ankitraut1507/deal-pipeline-kafka-project.git
   cd deal-pipeline-kafka-project
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:8080
   - MongoDB: localhost:27017

### Production Setup

1. **Set up production environment**
   ```bash
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

2. **Create secrets directory and files**
   ```bash
   mkdir -p secrets
   # Create required secret files:
   # - secrets/jwt_secret.txt
   # - secrets/mongo_root_username.txt
   # - secrets/mongo_root_password.txt
   # - secrets/mongo_app_password.txt
   ```

3. **Create MongoDB data directory**
   ```bash
   sudo mkdir -p /data/mongodb
   sudo chown -R $(whoami):$(whoami) /data/mongodb
   ```

4. **Deploy with production configuration**
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
   ```

## 📁 Project Structure

```
deal-pipeline-docker/
├── deal-pipeline-backend/          # Spring Boot application
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile                 # Backend Docker configuration
├── deal-pipeline-ui/              # Angular application
│   ├── src/
│   ├── package.json
│   ├── nginx.conf                # Nginx configuration
│   └── Dockerfile               # Frontend Docker configuration
├── docker-compose.yml            # Development configuration
├── docker-compose.prod.yml       # Production configuration
├── mongo-init.js               # MongoDB initialization script
├── secrets/                    # Production secrets (not tracked)
├── .env.example               # Environment variables template
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Spring profile | `dev` |
| `MONGO_ROOT_USERNAME` | MongoDB root username | `admin` |
| `MONGO_ROOT_PASSWORD` | MongoDB root password | `change-this-password` |
| `MONGO_DATABASE` | Database name | `deal_pipeline_db` |
| `MONGO_APP_PASSWORD` | Application user password | `change-this-app-password` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-jwt-key` |
| `JWT_EXPIRATION` | JWT expiration time (ms) | `3600000` |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | `http://localhost:4200,http://localhost:80` |

### Production Secrets

For production deployment, create these files in the `secrets/` directory:

- `jwt_secret.txt` - JWT signing secret (minimum 256 characters)
- `mongo_root_username.txt` - MongoDB root username
- `mongo_root_password.txt` - MongoDB root password
- `mongo_app_password.txt` - MongoDB application user password

## 🏥 Health Checks

All services include health checks:

- **Backend**: `http://localhost:8080/actuator/health`
- **Frontend**: `http://localhost:80`
- **MongoDB**: Database ping

## 📊 Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Service Status
```bash
docker-compose ps
```

## 🔒 Security Features

- **Production**: Docker secrets for sensitive data
- **Network isolation**: Custom bridge network
- **Non-root users**: Containers run as non-root users
- **Resource limits**: Production resource constraints
- **Health checks**: Automated service monitoring

## 🚀 Deployment Commands

### Development
```bash
# Start development environment
docker-compose up -d

# Stop services
docker-compose down

# Rebuild and start
docker-compose up -d --build
```

### Production
```bash
# Deploy production
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Stop production
docker-compose -f docker-compose.prod.yml down

# View production logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🛠️ Development Workflow

1. **Backend Development**
   ```bash
   cd deal-pipeline-backend
   # Run Spring Boot application
   ./mvnw spring-boot:run
   ```

2. **Frontend Development**
   ```bash
   cd deal-pipeline-ui
   # Install dependencies
   npm install
   # Start development server
   ng serve
   ```

## 📝 API Documentation

Once the backend is running, access API documentation at:
- Swagger UI: http://localhost:8080/swagger-ui.html
- Actuator: http://localhost:8080/actuator

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**
   - Ensure ports 80, 8080, 27017 are available
   - Use `docker-compose down` to stop existing containers

2. **Permission issues**
   - Ensure proper permissions for MongoDB data directory
   - Check Docker daemon permissions

3. **Build failures**
   - Clear Docker cache: `docker system prune -a`
   - Rebuild: `docker-compose build --no-cache`

### Debug Commands
```bash
# Check container logs
docker-compose logs <service-name>

# Execute commands in container
docker-compose exec backend bash
docker-compose exec mongodb mongosh

# Inspect volumes
docker volume ls
docker volume inspect deal-pipeline-docker_mongodb_data
```

## 📄 License

This project is licensed under the MIT License.
