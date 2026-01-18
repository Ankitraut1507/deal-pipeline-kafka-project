pipeline {
    agent any

    environment {
        AWS_REGION     = 'ap-south-1'
        AWS_ACCOUNT_ID = '851725646494'
        ECR_REGISTRY   = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        BACKEND_IMAGE  = 'deal-pipeline-backend'
        FRONTEND_IMAGE = 'deal-pipeline-frontend'
        EC2_USER = 'ec2-user'
        EC2_HOST = '13.201.73.68'
        APP_DIR  = '/home/ec2-user/app'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Ankitraut1507/deal-pipeline-kafka-project.git',
                    credentialsId: 'github-credentials'
            }
        }

        stage('Build Docker Images') {
            steps {
                dir('deal-pipeline-backend') {
                    sh "docker build -t ${ECR_REGISTRY}/${BACKEND_IMAGE}:latest ."
                }
                dir('deal-pipeline-ui') {
                    sh "docker build -t ${ECR_REGISTRY}/${FRONTEND_IMAGE}:latest ."
                }
            }
        }

        stage('Login to AWS ECR') {
            steps {
                withAWS(credentials: 'aws-ecr-credentials', region: "${AWS_REGION}") {
                    sh '''
                      aws ecr get-login-password --region $AWS_REGION \
                      | docker login --username AWS --password-stdin $ECR_REGISTRY
                    '''
                }
            }
        }

        stage('Push Images to ECR') {
            steps {
                sh """
                  docker push ${ECR_REGISTRY}/${BACKEND_IMAGE}:latest
                  docker push ${ECR_REGISTRY}/${FRONTEND_IMAGE}:latest
                """
            }
        }

        stage('Deploy to EC2 (AUTO)') {
            steps {
                sshagent(['ec2-key']) {
                    sh """
                      ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                        mkdir -p ${APP_DIR}
                      '
                      scp -o StrictHostKeyChecking=no docker-compose.yml ${EC2_USER}@${EC2_HOST}:${APP_DIR}/
                      scp -o StrictHostKeyChecking=no docker-compose.prod.yml ${EC2_USER}@${EC2_HOST}:${APP_DIR}/
                      ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                        cd ${APP_DIR}
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
                        sudo mkdir -p /data/mongodb
                        sudo chown -R 1001:1001 /data/mongodb
                        mkdir -p secrets
                        echo "THIS_IS_A_VERY_LONG_RANDOM_SECRET_KEY_1234567890" > secrets/jwt_secret.txt
                        echo "admin" > secrets/mongo_root_username.txt
                        echo "password123" > secrets/mongo_root_password.txt
                        echo "password123" > secrets/mongo_app_password.txt
                        export CORS_ALLOWED_ORIGINS="http://${EC2_HOST}"
                        export MONGO_APP_PASSWORD="password123"
                        docker compose -f docker-compose.prod.yml down --remove-orphans || true
                        sudo fuser -k 80/tcp || true
                        sudo kill -9 $(sudo lsof -t -i:80) || true
                        sudo systemctl stop nginx || true
                        sudo pkill -f nginx || true
                        docker compose -f docker-compose.prod.yml pull
                        docker compose -f docker-compose.prod.yml up -d
                      '
                    """
                }
            }
        }

        stage('Health Check') {
            steps {
                sshagent(['ec2-key']) {
                    sh """
                      ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                        sleep 30
                        curl -f http://localhost/health || echo "Backend health check through proxy failed"
                        curl -f http://localhost || echo "Frontend health check through proxy failed"
                      '
                    """
                }
            }
        }
    }

    post {
        success {
            echo '🎉 Auto-deploy to EC2 completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Check logs.'
        }
        always {
            cleanWs()
        }
    }
}