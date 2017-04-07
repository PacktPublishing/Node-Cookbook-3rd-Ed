#!/bin/bash
source ~/.bashrc

GITSHA=$(git rev-parse --short HEAD)

case "$1" in
  container)
    sudo -u pelger docker build -t webapp:$GITSHA .
    sudo -u pelger docker tag webapp:$GITSHA pelger/webapp:$GITSHA 
    sudo -i -u pelger docker push pelger/webapp:$GITSHA 
  ;;
  deploy)
    sed -e s/_NAME_/webapp/ -e s/_PORT_/3000/  < ../deployment/service-template-lb.yml > svc.yml
    sed -e s/_NAME_/webapp/ -e s/_PORT_/3000/ -e s/_IMAGE_/pelger\\/webapp:$GITSHA/ < ../deployment/deployment-template.yml > dep.yml
    sudo -i -u pelger kubectl apply -f $(pwd)/svc.yml
    sudo -i -u pelger kubectl apply -f $(pwd)/dep.yml
  ;;
  *)
    echo 'invalid build command'
    exit 1
  ;;
esac

