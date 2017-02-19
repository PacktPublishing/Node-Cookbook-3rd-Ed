# 12 Deploying Systems

This chapter covers the following topics

* Creating Units of Deployment
* Composing a system for production
* Shipping...

## Introduction
Deploying node.js application at scale is a challenging task to accomplish. The single process nature of node.js brilliantly fits into the "*containers*" revolution: it almost feels that Docker was born to support the incredible growth and enterprise demand of node.js applications. While for many decades we have been deploying enterprise application in the most different ways, Docker uniformed the world of development with production: the fragmentation and "it works on my computer" were wiped away by this abstraction layer on top of LXC. The immutable state of our application was brought into reality by the concept of container: building an `image` (a `docker image`, which we can look it as an compiled assembly made of our code and os) is what we do to package our application and make it ready to become a `container` everywhere we want preserving the same characteristics as it was on our machine. 
In this chapter we are going to see how to take advantage of the docker isolation model to deliver our software to production at ease and scale.

> ### Docker and BSD jails ![../info.png]
> The isolation model of Docker is nothing new if we go back in time and analyse how BSD accomplish isolation with jails. Fore more informations lease check *https://www.freebsd.org/doc/handbook/jails.html*.

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
FROM mhart/alpine-node:base-6.9
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

Let's try now to 'package' our service and build a Docker image. In the same folder where our Dockerfile is located let's run:

```sh
$ docker build .
```

The output should look like the following:

```sh

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
Let's start not getting confused by the `image` declaration: Docker is not a virtual machine but `alpine-node` is the container type used to host our application.
In order to allow traffic inside of our container, we need to `expose` a port, in this case 8080. Now our service is reachable  externally on port 8080 and it will be forwarded on the same port internally where our node.js application is listening at.
We define a working folder which contains all the files that we want to `ship`: in this case we are copying all files but we could filter them just like we would do in our terminal.
Once that all the files needed to run our application are copied, we can tell our image that ` $node .` has to be run at last: once that our container is started, this last command is going to be executed, resulting in our app to be launched.

As a small trick, in our Dockerfile, we are forcing Docker to not call `npm install` every time from scratch but apply just the delta to our node_modules folder. This is possible creating a `tmp` folder which stages the result of `npm install` and relies on the checksum cache of the `COPY` command to determine if files needs to be copied over or not.

> ### npm install --production ![../info.png]
> Remember that with the `--production` flag we are going to tell npm to skip the `devDependencies` from the installation. This is a good practice when working with Docker as we want to isolate our deployment environment as much as possible from development to production.

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
