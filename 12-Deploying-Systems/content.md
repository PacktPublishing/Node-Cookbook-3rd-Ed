# 12 Deploying Systems
Contents:

* Building a single Container
* Building a system of containers
* Running a docker registry
* Deploying a container to Kubernetes
--
* Deploying a system to Kubernetes
* updating a service
* Creating a deployment pipeline
* deploying to the cloud (move the system to AWS)

## Introduction
TODO: write introduction
  - what we used to do
  - why we now use containers
  - why container orchestration
  - why kube
  - alternatives

> ### Docker and BSD jails ![../info.png]
> The isolation model of Docker is nothing new if we go back in time and analyse how BSD accomplish isolation with jails. Fore more informations lease check *https://www.freebsd.org/doc/handbook/jails.html*.


## Building A Single Container
In Chapter 7 'Understanding Microservices' we developed a small microservice system. For the rest recipes in this chapter we will examine how to build a container based deployment infrastructure for this system. If you skipped chapter 7 then it would be advisable that you go back and run through it now to familiarize yourself with the system. At a minimum you should review the architecture for the system in Chapter 7 before proceeding. The final code for Chapter 7 is available here: **TODO link to code repo**

### Getting Ready
We will be using the Docker container engine for this recipe so you should have this installed on your system. If you don't yet have this installed, head over to http://www.docker.com and install the appropriate binary for your system. Docker supports Linux, Windows and Mac natively.

We can check that Docker was installed successfully by opening a shell and running the following:
```sh
$ docker run hello-world
```

This command will pull the hello-world image from Docker Hub - a central repository of public Docker images, create a new container from that image and run it. The executable within the container will output hello from docker along with some help text.

We also need the code from Chapter 7 available so if you don't have this already you should grab the code from this repository: **TODO link to code repo**

### How to do it
Our system is depicted in Figure 11.1 below, you may recall that it is built of a front end, three services and a reporting tool.

![image](./images/finalsystem.png)]

Our build process will need a base Docker image suitable for running `node.js` application code, so the first thing we need to do is to pull the official node base image from the Docker Hub repository, we will be using the `node:slim` variant to give us a smaller container size.

```
$ docker pull node:slim
```

> ### Offical Node Containers ![../info.png]
> There are several variants of the offical node.js Docker image available. These are explained here: https://hub.docker.com/_/node/. When building a system
> you should select an image that best supports your use case.

> ### Inspecting Offical Containers ![../info.png]
> The Dockerfiles for all of the offical Docker images are publically available on Github. You should take some time to inspect these to learn what goes into
> each container and also to pick up some tips on how to best build Docker images

In order to build this system we will need to create a container for each service. To do this we will need to create a docker build file for each. Let's build the `adder-service` first. To do this `cd` to the `adder-service` directory and create a file called `Dockerfile` using your favorite editor:

```sh
$ cd micro/adder-service
$ vim Dockerfile
```

Your docker file should contain the following statements:

```
FROM node:slim
RUN mkdir -p /home/node/service
WORKDIR /home/node/service
COPY package.json /home/node/service
RUN npm install
COPY . /home/node/service
EXPOSE 8080
CMD [ "node", "index.js" ]
```

We also need to create a `.dockerignore` file to ensure that we don't add unnecessary files to our container. Create a `.dockerignore` file in the same directory and add the following to it:

```
.git
.gitignore
node_modules
npm-debug.log
```

We are now ready to build our `adder-service` image. Run the following command:

```sh
$ docker build -t adder_service .
```

We can see that docker is working through all of the steps in the `Dockerfile` to create our image, once the build stops we can check that our newly created container built by issuing a `docker images` command. Next lets check that our container runs by issuing the following:

```sh
$ docker run -e ADDER_SERVICE_SERVICE_PORT=8080 -p 8080:8080 -d adder_service
```

We can now run a `docker ps` command to check that our container is running followed by a `netstat` command to check that our container is available on port 8080. Let's quickly check that our container is running correctly by using the `curl` command to invoke the service:

```sh
$ curl http://localhost:8080/add/2/3
```

We should see that the number 5 is returned from the service. Let's now close down our running containers.

```sh
$ docker ps
$ netstat -an | grep -i listen
$ docker kill $(docker ps -a -q)
```

We have just built and run our first microservice container.

### How it works
Containers provide an isolated environment for our application and service code to execute in. The Dockerfile defines exactly what should go into this environment. Typically this should include all of the library and environmental dependencies that our code requires to execute successfully. Let's analyze what we placed into this container, the Dockerfile contained the following instructions:

```
FROM node:slim
RUN mkdir -p /home/node/service
WORKDIR /home/node/service
COPY package.json /home/node/service
RUN npm install
COPY . /home/node/service
CMD [ "node", "index.js" ]
```

Line by line this did the following:

* `FROM node:slim` - tells the Docker build process to use `node:slim` as the base container image. This means that Docker will build our image on top of this so anything that is in the node:slim image will be included in our image.

* `RUN mkdir -p /home/node/service` - will run the `mkdir` command to create the directory `/home/node/services`. It is important to understand that and `RUN` commands execute in the context of the container. In other words this directory will be created inside the container not on the machine that is running the build.

* `WORKDIR /home/node/service` - sets the working directory for all future `RUN` and `COPY` commands in this Dockerfile

* `COPY package.json /home/node/service` - copies the file package.json from the build machine to the `/home/node/service` inside the container

* `RUN npm install` - runs `npm install` inside the container using the dependencies as listed in our package.json file. It is important to understand that all dependencies should be installed in this manner. We should never just copy across our `node_modules` folder. This is because the execution environment within the container may be different to our build system so any binary dependencies need to be installed from scratch.

* `COPY . /home/node/service` - copies our application code into the container. Note that the copy command will ignore all patterns listed in our `.docker_ignore` file. This means that the `COPY` command will not copy `node_modules` and other information to the container

* `CMD [ "node", "index.js" ]` - specifies the default command to execute when starting the container. This command will execute in the `/home/node/service` directory.

### There's more
It is important to understand that Docker is based on the concept of layers. Each command in the Dockerfile potentially creates a new layer in the image. This allows container deployment to be very efficient. For example if we subsequently change some code in our service and rebuild the container, this will result in a very thin layer being created that represents just the delta between the last image and this one. This means of course that provided our target deployment environment has all of the previous layers, deployment of a new version of a container may only require a new layer of a few KBytes or less.

### See also
Docker is the leading container technology at present, however it should be pointed out that alternatives do exist. One such alternative is the `rkt` engine which is part of the CoreOS project. You can find out more about `rkt` here: https://coreos.com/rkt/.

Following the explosive growth in container technology, recently there has been a drive to push for binary and runtime standardization among interested parties in this space. The standardization effort is being led by the Open Container Initiative, you can read about there work here: https://www.opencontainers.org/

## Building a system of containers
In this recipe we are going to apply what we learnt in the last recipe to build the rest of our microservice system. We will create a script to automate this build process for us so that we can build our system with a single command.

### Getting Ready
We already have everything we need so lets dive in and build the containers.

### How to do it
Now that we have built our `adder-service` container we need to replicate the above steps for the rest of our services, namely `audit-service`, `event-service` and `webapp`. The `.dockerignore` file will be the same in each case, however the `Dockerfile` will be slightly different. Let's go ahead and do this for the rest of our services and `webapp` using the file contents below:

For audit-service:
```
FROM node:slim
RUN mkdir -p /home/node/service
WORKDIR /home/node/service
COPY package.json /home/node/service
RUN npm install
COPY . /home/node/service
EXPOSE 8081
CMD [ "node", "index.js" ]
```

For event-service:
```
FROM node:slim
RUN mkdir -p /home/node/service
WORKDIR /home/node/service
COPY package.json /home/node/service
RUN npm install
COPY . /home/node/service
EXPOSE 8082
CMD [ "node", "index.js" ]
```

For webapp:
```
FROM node:slim
RUN mkdir -p /home/node/service
WORKDIR /home/node/service
COPY package.json /home/node/service
RUN npm install
COPY . /home/node/service
EXPOSE 3000
CMD [ "npm", "start" ]
```

Now that we have created the Dockerfile for each element of our system, lets write a quick build script so that we can build all of our containers with one command. to do this `cd` into the `micro` directory and create a file `build.sh` with the following code:

```sh
#!/bin/bash
cd adder-service
docker build -t adder_service .
cd audit-service
docker build -t audit_service .
cd event-service
docker build -t event_service .
cd webapp
docker build -t webapp .
```

Let's run our build script to create the rest of our containers:

```sh
$ sh build.sh
```

Once this has finished executing, we can run a `docker images` command to check that everything built correctly. We should see all of the images that we just built listed in the output.

### How it works

### There's more

### See also

## Running a Docker Registry
In this recipe we are going to publish the containers that we built to our own private docker registry.

### Getting Ready
pull the registry

### How to do it
tag and push a single container
list what is in the registruy
update the build script to push also
run the build script
observe what is in the registry
note that the latest tag has moved

### How it works

### There's more

### See also


### How it works

	explain the following
**TODO info bar on why we con't copy node_modules across**
### There's more

### See also













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
