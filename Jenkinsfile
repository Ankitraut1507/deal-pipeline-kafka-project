pipeline {
    agent any

    environment {
        AWS_REGION     = 'ap-south-1'
        AWS_ACCOUNT_ID = '851725646494'

        ECR_REGISTRY   = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        BACKEND_IMAGE  = "deal-pipeline-backend"
        FRONTEND_IMAGE = "deal-pipeline-frontend"

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
                withCredentials([
                    usernamePassword(
                        credentialsId: 'aws-ecr-credentials',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {
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
                        cd ${APP_DIR}
                        docker compose pull
                        docker compose up -d
                        docker compose ps
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
