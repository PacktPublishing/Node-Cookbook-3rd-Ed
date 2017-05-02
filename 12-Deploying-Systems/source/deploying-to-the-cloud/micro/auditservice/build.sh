#!/bin/bash
source ~/.bashrc

GITSHA=$(git rev-parse --short HEAD)

case "$1" in
  container)
    sudo -u pelger docker build -t auditservice:$GITSHA .
    sudo -u pelger docker tag auditservice:$GITSHA pelger/auditservice:$GITSHA 
    sudo -i -u pelger docker push pelger/auditservice:$GITSHA 
  ;;
  deploy)
    sed -e s/_NAME_/auditservice/ -e s/_PORT_/8081/  < ../deployment/service-template.yml > svc.yml
    sed -e s/_NAME_/auditservice/ -e s/_PORT_/8081/ -e s/_IMAGE_/pelger\\/auditservice:$GITSHA/ < ../deployment/deployment-template.yml > dep.yml
    sudo -i -u pelger kubectl apply -f $(pwd)/svc.yml
    sudo -i -u pelger kubectl apply -f $(pwd)/dep.yml
  ;;
  *)
    echo 'invalid build command'
    exit 1
  ;;
esac

