def remote = [:]
pipeline {
    agent any
    parameters {
        string(name: 'APP_NAME', defaultValue: 'ci-ui-new', description: 'APP NAME: ci-ui')
        string(name: 'BUILDENV', defaultValue: 'https', description: 'Build environment: http, dev, test, prod')
        string(name: 'APP_ENV', description: 'Runtime environment. Choose from dev, test and prod')
        string(name: 'REGISTRY', defaultValue: 'cidev.Cognimix-s-Account.cloud:4000', description: 'Docker registry. Cloud: cidev.Cognimix-s-Account.cloud:4000')
        string(name: 'REMOTE_DEPLOY', description: 'If deploy to the remote registry: true/false')
        string(name: 'SSH_HOST', defaultValue: '9.3.68.61', description: 'SSH Host. Cloud: test: 52.117.200.14, prod: 52.116.36.24')
        string(name: 'SSH_CRED_ID', defaultValue: 'ci_user', description: 'SSH Credential Id, select from cloud-test or cloud-prod')
        string(name: 'DOCKER_CRED_ID', defaultValue: 'docker-cred', description: 'Docker Credential Id')
    }
    stages {
        stage("Docker"){
            steps{
                script {
                    withCredentials([usernamePassword(credentialsId: params.SSH_CRED_ID, usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                      remote.name = 'remote'
                      remote.host = params.SSH_HOST
                      remote.user = USERNAME
                      remote.password = PASSWORD
                      remote.allowAnyHosts = true
                    }
                }
                echo "====++++Building Docker Image++++===="
                sh "docker build --build-arg buildenv=${params.BUILDENV} -t localhost:5000/ci-${params.APP_ENV}/${params.APP_NAME}:${env.BUILD_NUMBER} ."
                echo "====++++Pushing Docker Image to the Docker Registry++++===="
                withCredentials([usernamePassword(credentialsId: params.DOCKER_CRED_ID, usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                    sh "docker login localhost:5000 -u ${USERNAME} -p ${PASSWORD}"
                }
                sh "docker push localhost:5000/ci-${params.APP_ENV}/${params.APP_NAME}:${env.BUILD_NUMBER}"
                script {
                    try {
                        if (params.REMOTE_DEPLOY == 'false') {
                            echo "====++++Stopping the old container if exists++++===="
                            sh "docker stop ${params.APP_NAME} || true"
                            echo "====++++Removing the old container++++===="
                            sh "docker rm ${params.APP_NAME} || true"
                            echo "====++++Running the new container++++===="
                            sh "docker run --name ${params.APP_NAME} -d --restart unless-stopped -p 443:443 -p 80:80 -v /certbot/conf:/etc/letsencrypt -v /certbot/www:/var/www/certbot --network ci localhost:5000/ci-${params.APP_ENV}/${params.APP_NAME}:${env.BUILD_NUMBER}"
                        } else {
                            echo "====++++Deploying remotely++++===="
                            sshCommand remote: remote, command: "docker stop ${params.APP_NAME} || true"
                            sshCommand remote: remote, command:  "docker rm ${params.APP_NAME} || true"
                            withCredentials([usernamePassword(credentialsId: params.DOCKER_CRED_ID, usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                                sshCommand remote: remote, command:  "docker login ${params.REGISTRY} -u ${USERNAME} -p ${PASSWORD}"
                            }
                            sshCommand remote: remote, command:  "docker pull ${params.REGISTRY}/ci-${params.APP_ENV}/${params.APP_NAME}:${env.BUILD_NUMBER}"
                            sshCommand remote: remote, command: "docker run --name ${params.APP_NAME} -d --restart unless-stopped -p 443:443 -p 80:80 -v /certbot/conf:/etc/letsencrypt -v /certbot/www:/var/www/certbot --network ci ${params.REGISTRY}/ci-${params.APP_ENV}/${params.APP_NAME}:${env.BUILD_NUMBER}"
                            // sshCommand remote: remote, command: "docker run --name ${params.APP_NAME} -d --restart unless-stopped -p 8090:8090 --network ci ${params.REGISTRY}/ci-${params.APP_ENV}/${params.APP_NAME}:${env.BUILD_NUMBER}"
                        }
                            sendToSlack('table-demo-ui', params.APP_ENV, 'Success')
                    }catch (err) {
                            sendToSlack('table-demo-ui', params.APP_ENV, 'Failed')
                            error "Program failed, please read logs..."
                        } 
                }
                
                
            }
        }
    }
}

def sendToSlack(appname, appenv, status) {
            def color
            if(status == 'Failed') {
              color = '#ff0000'
            }else {
              color = '56A97A'
            }
            slackSend (color: color, message:
          """
          ${appname} build:
          Environment: ${appenv}
          Status: ${status}
          Build Number: ${BUILD_NUMBER}
          Console Link: ${BUILD_URL}console
          """)
          }