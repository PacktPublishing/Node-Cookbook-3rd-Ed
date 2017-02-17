# 12 Deploying Systems

This chapter covers the following topics

* Creating Units of Deployment
* Composing a system for production

## Introduction
Deploying node.js application at scale is a challenging task to accomplish. The single process nature of node.js brilliantly fits into the "*containers*" revolution: it almost feels that Docker was born to support the incredible growth and enterprise demand of node.js applications. While for many decades we have been deploying enterprise application in the most different ways, Docker uniformed the world of development with production: the fragmentation 

> ### Docker and BSD jails ![../info.png]
> The isolation model of Docker is nothing new if we go back in time and analyse how BSD accomplish isolation with jails. Fore more informations lease check *https://www.freebsd.org/doc/handbook/jails.html*.

- "Designing for Isolation"
- "Packer vs Docker"
- "Snowflakes vs Immutability"

## Creating Units of Deployment
We left our micro services application, adding the docker container for MongoDB database. The question is still about the magic behind "*fuge*"
Docker solved the "it works on my computer problem" abstracting the hardware foundation.

### Getting Ready
In this recipe we will see how to "containerise" our `adder-service` using Docker. 
To get started open the command prompt and create a `Dockerfile` in the root of our `adder-service` project:

```sh
$ touch Dockerfile
```

### How to do it

Next we need to add the following to the just created Dockerfile:

```yaml
FROM busybox
EXPOSE 8080

RUN mkdir -p /usr/src/app
WORKDIR /tmp
COPY package.json /tmp
RUN npm install --production

COPY . /usr/src/app
WORKDIR /usr/src/app

WORKDIR /tmp
RUN cp -r node_modules /usr/src/app/node_modules

# staring service
WORKDIR /usr/src/app
CMD [ "node", "." ]
```

If we want to add the service to the `fuge.yaml` file, as it is in `docker-compose` format, we can add the following:

```yaml
adder-service:
	build: .
```

In this way we are telling *fuge* to run `adder-service` inside of a container instead of a default process.

> ### Docker ![../info.png]
> For more information on docker https://docs.docker.com/

### How it works
Let's not get confused by the `image` declaration: Docker is not a virtual machine but `busybox'` is the container type used to host our application.

### There's more

#### Spinning up supporting containers

### See also

## Composing a System for production
Fuge serves as a great tool for local development environment but it's not meant to run production like installations. Relieving developers from the "*shell-hell*" problem increases productivity and optimises the production cycle but in production we are looking for resiliency.
In this recipe we are going to explore how to program a modular containerised service topology using `docker-compose`.

### Getting Ready

### How to do it

### How it works

### There's more

#### Using a Docker Registry

### See also

## Shipping....

### Getting Ready

### How to do it

### How it works

### There's more

### See also

## Scaling with Orchestration 

swarm, coreOs (there's more)

### Getting Ready

### How to do it

### How it works

### There's more

### See also

## Scaling with Orchestration

kubernetes (mesos there's more)

### Getting Ready

### How to do it

### How it works

### There's more

### See also

## Node.js and nginx 


### Getting Ready

### How to do it

### How it works

### There's more

### See also

## Abstracting the server away

serverless (lambda)
home-grown (shopgate)

### Getting Ready

### How to do it

### How it works

### There's more

### See also
