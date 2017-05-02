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
        sh 'source ~/.bashrc && cd adderservice && npm install'
      }
    }
    stage('Test'){
      steps {
        sh 'source ~/.bashrc && cd adderservice && npm test'
      }
    }
    stage('Container'){
      steps {
        sh 'source ~/.bashrc && cd adderservice && sh build.sh container'
      }
    }
    stage('Deploy'){
      steps {
        sh 'source ~/.bashrc && cd adderservice && sh build.sh deploy'
      }
    }
  }
}

