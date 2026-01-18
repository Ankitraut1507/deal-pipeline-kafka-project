pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'ankitrautalways'
        DOCKER_REPO_BACKEND = 'deal-pipeline-backend'
        DOCKER_REPO_FRONTEND = 'deal-pipeline-frontend'
        AWS_REGION = 'us-east-1'
        AWS_ACCOUNT_ID = 'YOUR_AWS_ACCOUNT_ID'
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
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
                script {
                    dir('deal-pipeline-backend') {
                        sh 'docker build -t ${DOCKER_REGISTRY}/${DOCKER_REPO_BACKEND}:${BUILD_NUMBER} .'
                        sh 'docker tag ${DOCKER_REGISTRY}/${DOCKER_REPO_BACKEND}:${BUILD_NUMBER} ${DOCKER_REGISTRY}/${DOCKER_REPO_BACKEND}:latest'
                    }
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                script {
                    dir('deal-pipeline-ui') {
                        sh 'docker build -t ${DOCKER_REGISTRY}/${DOCKER_REPO_FRONTEND}:${BUILD_NUMBER} .'
                        sh 'docker tag ${DOCKER_REGISTRY}/${DOCKER_REPO_FRONTEND}:${BUILD_NUMBER} ${DOCKER_REGISTRY}/${DOCKER_REPO_FRONTEND}:latest'
                    }
                }
            }
        }
        
        stage('Login to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh 'echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin'
                    }
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                script {
                    sh 'docker push ${DOCKER_REGISTRY}/${DOCKER_REPO_BACKEND}:latest'
                    sh 'docker push ${DOCKER_REGISTRY}/${DOCKER_REPO_FRONTEND}:latest'
                }
            }
        }
        
        stage('Deploy to EC2') {
            steps {
                script {
                    // Copy docker-compose file to EC2
                    sshagent(['ec2-key']) {
                        sh """
                        ssh -o StrictHostKeyChecking=no ec2-user@your-ec2-ip 'mkdir -p /home/ec2-user/app'
                        scp -o StrictHostKeyChecking=no docker-compose.prod.yml ec2-user@your-ec2-ip:/home/ec2-user/app/
                        scp -o StrictHostKeyChecking=no .env.production ec2-user@your-ec2-ip:/home/ec2-user/app/
                        """
                        
                        // Deploy on EC2
                        sh """
                        ssh -o StrictHostKeyChecking=no ec2-user@your-ec2-ip '
                            cd /home/ec2-user/app
                            docker compose -f docker-compose.prod.yml down
                            docker compose -f docker-compose.prod.yml up -d
                            docker compose -f docker-compose.prod.yml ps
                        '
                        """
                    }
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    sshagent(['ec2-key']) {
                        sh """
                        ssh -o StrictHostKeyChecking=no ec2-user@your-ec2-ip '
                            sleep 30
                            curl -f http://localhost:8080/actuator/health || exit 1
                            curl -f http://localhost/ || exit 1
                            echo "✅ Application is healthy!"
                        '
                        """
                    }
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            script {
                echo '🎉 Pipeline completed successfully!'
                emailext (
                    subject: "✅ Deployment Successful - Deal Pipeline",
                    body: "Application deployed successfully to production.\nBuild: ${BUILD_NUMBER}\nTime: ${currentBuild.duration}",
                    to: "your-email@example.com"
                )
            }
        }
        failure {
            script {
                echo '❌ Pipeline failed!'
                emailext (
                    subject: "❌ Deployment Failed - Deal Pipeline",
                    body: "Pipeline failed at stage: ${currentBuild.currentResult}\nBuild: ${BUILD_NUMBER}",
                    to: "ankitraut002@gmail.com"
                )
            }
        }
    }
}
