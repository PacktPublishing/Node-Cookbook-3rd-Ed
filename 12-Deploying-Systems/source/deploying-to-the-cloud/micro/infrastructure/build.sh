#!/bin/bash
sh source ~/.bashrc

case "$1" in
  mongo)
    sed -e s/_NAME_/mongo/ -e s/_PORT_/27017/  < ../deployment/service-template.yml > svc.yml
    sed -e s/_NAME_/mongo/ -e s/_PORT_/27017/ -e s/_IMAGE_/mongo/ < ../deployment/deployment-template.yml > dep.yml
    sudo -i -u pelger kubectl apply -f $(pwd)/svc.yml
    sudo -i -u pelger kubectl apply -f $(pwd)/dep.yml
  ;;
  redis)
    sed -e s/_NAME_/redis/ -e s/_PORT_/6379/  < ../deployment/service-template.yml > svc.yml
    sed -e s/_NAME_/redis/ -e s/_PORT_/6379/ -e s/_IMAGE_/redis/ < ../deployment/deployment-template.yml > dep.yml
    sudo -i -u pelger kubectl apply -f $(pwd)/svc.yml
    sudo -i -u pelger kubectl apply -f $(pwd)/dep.yml
  ;;
  *)
    echo 'invalid build command'
    exit 1
  ;;
esac

