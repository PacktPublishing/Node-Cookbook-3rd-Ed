pipeline {
  agent any 

  stages {
    stage('Checkout') {
      steps { 
        checkout scm
      }
    }
    stage('Build') { 
      steps { 
        sh 'source ~/.bashrc && cd auditservice && npm install'
      }
    }
    stage('Test'){
      steps {
        sh 'source ~/.bashrc && cd auditservice && npm test'
      }
    }
    stage('Container'){
      steps {
        sh 'source ~/.bashrc && cd auditservice && sh build.sh container'
      }
    }
    stage('Deploy'){
      steps {
        sh 'source ~/.bashrc && cd auditservice && sh build.sh deploy'
      }
    }
  }
}

