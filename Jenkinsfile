pipeline {
    agent any

    environment {
        AWS_REGION     = 'ap-south-1'
        AWS_ACCOUNT_ID = '851725646494'
        ECR_REGISTRY   = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        DOCKER_HUB_REGISTRY = 'docker.io'
        DOCKER_HUB_NAMESPACE = 'ankitrautalways'
        BACKEND_IMAGE  = 'deal-pipeline-backend'
        FRONTEND_IMAGE = 'deal-pipeline-frontend'
        EC2_USER = 'ec2-user'
        EC2_HOST = '13.201.73.68'
        APP_DIR  = '/home/ec2-user/app'
        BUILD_TAG = "${env.BUILD_NUMBER ?: 'latest'}"
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
                    sh """
                        docker build -t ${DOCKER_HUB_REGISTRY}/${DOCKER_HUB_NAMESPACE}/${BACKEND_IMAGE}:${BUILD_TAG} .
                        docker build -t ${DOCKER_HUB_REGISTRY}/${DOCKER_HUB_NAMESPACE}/${BACKEND_IMAGE}:latest .
                        docker build -t ${ECR_REGISTRY}/${BACKEND_IMAGE}:${BUILD_TAG} .
                        docker build -t ${ECR_REGISTRY}/${BACKEND_IMAGE}:latest .
                    """
                }
                dir('deal-pipeline-ui') {
                    sh """
                        docker build -t ${DOCKER_HUB_REGISTRY}/${DOCKER_HUB_NAMESPACE}/${FRONTEND_IMAGE}:${BUILD_TAG} .
                        docker build -t ${DOCKER_HUB_REGISTRY}/${DOCKER_HUB_NAMESPACE}/${FRONTEND_IMAGE}:latest .
                        docker build -t ${ECR_REGISTRY}/${FRONTEND_IMAGE}:${BUILD_TAG} .
                        docker build -t ${ECR_REGISTRY}/${FRONTEND_IMAGE}:latest .
                    """
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_HUB_USER', passwordVariable: 'DOCKER_HUB_PASS')]) {
                    sh """
                        echo "${DOCKER_HUB_PASS}" | docker login ${DOCKER_HUB_REGISTRY} --username "${DOCKER_HUB_USER}" --password-stdin
                    """
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                sh """
                    docker push ${DOCKER_HUB_REGISTRY}/${DOCKER_HUB_NAMESPACE}/${BACKEND_IMAGE}:${BUILD_TAG}
                    docker push ${DOCKER_HUB_REGISTRY}/${DOCKER_HUB_NAMESPACE}/${BACKEND_IMAGE}:latest
                    docker push ${DOCKER_HUB_REGISTRY}/${DOCKER_HUB_NAMESPACE}/${FRONTEND_IMAGE}:${BUILD_TAG}
                    docker push ${DOCKER_HUB_REGISTRY}/${DOCKER_HUB_NAMESPACE}/${FRONTEND_IMAGE}:latest
                """
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
                  docker push ${ECR_REGISTRY}/${BACKEND_IMAGE}:${BUILD_TAG}
                  docker push ${ECR_REGISTRY}/${BACKEND_IMAGE}:latest
                  docker push ${ECR_REGISTRY}/${FRONTEND_IMAGE}:${BUILD_TAG}
                  docker push ${ECR_REGISTRY}/${FRONTEND_IMAGE}:latest
                """
            }
        }

        stage('Deploy to EC2 (AUTO)') {
            steps {
                sshagent(['ec2-key']) {
                    sh """
                      ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                        cd ${APP_DIR}
                        docker compose pull
                        docker compose up -d
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
                        curl -f http://localhost:8080/actuator/health
                        curl -f http://localhost
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