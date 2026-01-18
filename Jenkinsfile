pipeline {
    agent any

    environment {
        // Docker Hub
        DOCKER_REGISTRY = 'ankitrautalways'
        DOCKER_REPO_BACKEND = 'deal-pipeline-backend'
        DOCKER_REPO_FRONTEND = 'deal-pipeline-frontend'

        // AWS ECR (for later)
        AWS_REGION = 'ap-south-1'
        AWS_ACCOUNT_ID = 'YOUR_AWS_ACCOUNT_ID'
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

        EC2_USER = 'ec2-user'
        EC2_HOST = '13.201.73.68'
        APP_DIR = '/home/ec2-user/app'
    }

    stages {

        stage('Checkout Code') {
            steps {
                git url: 'https://github.com/Ankitraut1507/deal-pipeline-kafka-project.git',
                    branch: 'main',
                    credentialsId: 'github-credentials'
            }
        }

        stage('Build Backend') {
            steps {
                dir('deal-pipeline-backend') {
                    sh """
                        docker build -t ${DOCKER_REGISTRY}/${DOCKER_REPO_BACKEND}:${BUILD_NUMBER} .
                        docker tag ${DOCKER_REGISTRY}/${DOCKER_REPO_BACKEND}:${BUILD_NUMBER} ${DOCKER_REGISTRY}/${DOCKER_REPO_BACKEND}:latest
                    """
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('deal-pipeline-ui') {
                    sh """
                        docker build -t ${DOCKER_REGISTRY}/${DOCKER_REPO_FRONTEND}:${BUILD_NUMBER} .
                        docker tag ${DOCKER_REGISTRY}/${DOCKER_REPO_FRONTEND}:${BUILD_NUMBER} ${DOCKER_REGISTRY}/${DOCKER_REPO_FRONTEND}:latest
                    """
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'docker-hub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh """
                    docker push ${DOCKER_REGISTRY}/${DOCKER_REPO_BACKEND}:latest
                    docker push ${DOCKER_REGISTRY}/${DOCKER_REPO_FRONTEND}:latest
                """
            }
        }

        /* =====================================================
           🚀 AWS ECR SUPPORT (ENABLE LATER)
           =====================================================

        stage('Login to ECR') {
            steps {
                sh '''
                  aws ecr get-login-password --region $AWS_REGION \
                  | docker login --username AWS --password-stdin $ECR_REGISTRY
                '''
            }
        }

        stage('Tag & Push to ECR') {
            steps {
                sh '''
                  docker tag ${DOCKER_REGISTRY}/${DOCKER_REPO_BACKEND}:latest \
                    $ECR_REGISTRY/${DOCKER_REPO_BACKEND}:latest

                  docker tag ${DOCKER_REGISTRY}/${DOCKER_REPO_FRONTEND}:latest \
                    $ECR_REGISTRY/${DOCKER_REPO_FRONTEND}:latest

                  docker push $ECR_REGISTRY/${DOCKER_REPO_BACKEND}:latest
                  docker push $ECR_REGISTRY/${DOCKER_REPO_FRONTEND}:latest
                '''
            }
        }

        ===================================================== */

        stage('Deploy to EC2') {
            steps {
                sshagent(['ec2-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} 'mkdir -p ${APP_DIR}'
                        scp -o StrictHostKeyChecking=no docker-compose.prod.yml ${EC2_USER}@${EC2_HOST}:${APP_DIR}/
                        scp -o StrictHostKeyChecking=no .env.production ${EC2_USER}@${EC2_HOST}:${APP_DIR}/

                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                            cd ${APP_DIR}
                            docker compose -f docker-compose.prod.yml down
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
            echo '🎉 Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
        always {
            cleanWs()
        }
    }
}
