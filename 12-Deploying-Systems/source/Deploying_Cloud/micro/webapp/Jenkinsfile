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
        sh 'source ~/.bashrc && cd webapp && npm install'
      }
    }
    stage('Test'){
      steps {
        sh 'source ~/.bashrc && cd webapp && npm test'
      }
    }
    stage('Container'){
      steps {
        sh 'source ~/.bashrc && cd webapp && sh build.sh container'
      }
    }
    stage('Deploy'){
      steps {
        sh 'source ~/.bashrc && cd webapp && sh build.sh deploy'
      }
    }
  }
}

