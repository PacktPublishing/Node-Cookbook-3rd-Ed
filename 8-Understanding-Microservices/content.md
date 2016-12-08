# 8 Understanding Microservices

This chapter covers the following topics

* Building a simple RESTful microservice
* Creating the context
* Setting up a development environment
* Using pattern matching with Mu
* Using containers with microservices
* Adding a second service
* Building queue based microservice
* TODO: MORE HERE
* When to use 
* when not to use
* Preparing for production
* Build pipeline??
* Full stack microsesrvices -> discuss this here or is it too new ??


## Introduction

Microservices are very much in vogue at the moment and for good reason. There are many benefits to adopting a microservices architecture such as:

* TODO LIST HERE

Of course it is not always appropriate to use microservices, certainly the 'golden hammer' anti-pattern should be avoided at all costs, however in our experience it is a powerful approach when applied correctly. In this chapter we will learn how to construct a simple RESTful microservice and also how this might be consumed. We will also look at a powerful approach to microservice construction, that of pattern matching. We will use the Mu library to do this. We will also look at how to set up a clean local development environment using the Fuge toolkit and then look at how to build services that communicate over protocols other than simple HTTP. Finally we will discuss when and when not to adopt the microservices architecture.

However before diving into code we should take a moment to review what we mean by a microservice and how this concept plays into a reference architectural frame.

Figure 8.1 below depicts a typical microservice system. Under this architecture...TODO

![image](./images/logical.png)

**Figure 8.1 Microservice reference architecture**

From this we will use the following definition for a microservice:

*A microservice is a small, highly cohesive unit of code that has responsibility for a small functional area of a system. It should be independently deployable and should be of a size that it could be rewritten by a single developer in two weeks at maximum.*

## Creating a simple RESTful microservice

### Getting Ready
In this recipe we will build a simple microservice using the `restify` module. Restify is an easy to use web framework that helps us to rapidly build services that can be consumed over HTTP. We will test our service using the `curl` command. To get started open a command prompt and create a fresh empty directory, lets call it `micro` and also a subdirectory called `adder-service`

```
$ mkdir micro
$ cd micro
$ mkdir adder-service
$ cd adder-service
```

### How to do it
Our microservice will add two numbers together. The service is simply a Node module, so let's go ahead and create a fresh module in the `adder-service` directory, run:

```
$ npm init -y
```

This will create a fresh `package.json` for us. Next let's add in the `restify` module for our service run:

```
npm install restify --save --no-optional
```

This will install the `restify` module and also add the dependency to `package.json`

> #### --no-optional.. ![](../info.png)
> By default `restify` installs DTrace probes, this can be disabled during install with the --no-optional flag. Whilst DTrace is great not all systems support it which is why we have chosen to disable it in this example. You can find out more about dtrace here: http://dtrace.org/blogs/about/

Now it's time to actually write our service. Using your favourite editor create a file `service.js` in the `adder-service` folder. Add the following code:

```
var restify = require('restify')

function respond (req, res, next) {
  var result = parseInt(req.params.first, 10) + parseInt(req.params.second, 10)
  res.send('' + result)
  next()
}

var server = restify.createServer()
server.get('/add/:first/:second', respond)

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url)
})
```

Once you have added the code and saved the file we can run and test our service. In the command prompt `cd` to the service folder and run the service as follows:

```
$ cd micro/adder-service
$ node service.js
```

The service gives the following output:

```
restify listening at http://[::]:8080
```

Let's test our service using `curl`. Open a fresh command window and type the following:

```
curl http://localhost:8080/add/1/2
```

The service should respond with the answer 3. We have just built our first RESTful microservice.

> #### `curl` ![](../tip.png)
> `curl` is a command line HTTP client program that works much like a web browser. If you don't have `curl` available on your system you can test the service by putting the url into your web browser.

### How it works
When we executed the microservice `restify` opened up tcp port 8080 and began listening for requests. The `curl` command opened a socket on local host and connected to port 8080. `curl` then sent a HTTP `GET` request for the url `/add/1/2`. In the code we had told `restify` to service `GET` requests matching a specific url pattern:

```
server.get('/add/:first/:second', respond)
```

The :first, :second parts of this tell `restify` to match path elements in these positions to parameters. You can see this working in the respond function where we were able to access the parameters using the form `req.params.first`

Finally our service sent a response using the `res.send` function.

### There's more
Whilst this is a trivial service it should serve to implement the principal that a microservice is really nothing more than a Node module that runs as an independent process. A microservice system is a collection of these co-operating processes. Of course it gets more complicated in a real system where you have lots of services and have to manage problems such as service discovery and deployment, however keep in mind that the core concept is really very simple.

In the following recipes we will look at how microservices operate in the context of an example system, how to set up an effective development environment for this style of coding and also introduce other messaging and communication protocols

### See also
* TODO


## Creating the context

### Getting Ready
In this recipe we are going to create a web application that will consume our microservice. This is the API and client tier in our reference architecture depicted in figure 3.1. We will be using the Express web framework to do this. We will be using the Express Generators to create an application skeleton for us so we first need to install the Generators. To do this run.

```
npm install -g express-generator
```

Lets build our web app.


### How to do it
First let's open a command prompt and `cd` into the directory we created in the first recipe.

```
$cd micro
```

Next generate the application skeleton using the `express` command line tool

```
$ express --view=ejs ./webapp
```

This will create a skeletal web application using Ejs templates in a new directory called webapp.

> #### ejs.. ![](../info.png)
>
> Express supports multiple template engines including Jade, Ejs and Handlebars. If you would prefer to use a different engine simply supply a different option to the --view switch. More information is available by running ```express --help```

Next we need to install the dependencies for our application:

```
$ cd webapp
$ npm install
```

Once this has completed we can run the application:

```
$ npm start
```

If we now point a browser to `http://localhost:3000` we should see a page rendered by our application as in figure 8.2 below:

![image](./images/fig3.2.png)
**Figure 8.2 express application**

Now that we have our web application skeleton its time to wire it up to our microservice. Let's begin by creating a route and a front end to interact with our service. Firstly the route, using your favourite editor create a file `add.js` in the directory `webapp/routes` and add the following code:

```
var express = require('express')
var router = express.Router()
var restify = require('restify')


router.get('/', function (req, res, next) {
  res.render('add', { first: 0, second: 0, result: 0 })
})


router.post('/calculate', function (req, res, next) {
    var client = restify.createClient({url: 'http://localhost:8080'})
    client.get('/add/' + req.body.first + '/' + req.body.second, function (err, serviceReq) {
      if (err) { console.log(err) }

      serviceReq.on('result', function (err, serviceRes) {
        if (err) { console.log(err) }
        serviceRes.body = ''
        serviceRes.setEncoding('utf8')
        serviceRes.on('data', function (chunk) {
          serviceRes.body += chunk
        })
        serviceRes.on('end', function () {
          res.render('add', { first: req.body.first, second: req.body.second, result: serviceRes.body })
        })
      })
    })
  })

  module.exports = router
```

Next we need to create a template to provide users of the app with access to the service, so we need to create a file `add.ejs` in the directory `webapp/views` with the following code:

```
<!DOCTYPE html>
<html>
  <head>
    <title>Add</title>
    <link rel='stylesheet' href='/stylesheets/style.css' />
  </head>
  <body>
    <h1>Add it up!</h1>
    <form id='calc-form' action='/add/calculate' method='post'>
      <input type='text' id='first', name='first' value=<%= first %>></input>
      <input type='text' id='second', name='second' value=<%= second %>></input>
    </form>
    <button type="submit" form="calc-form" value="Submit">Submit</button>
    <h2>result = <%= result %></h2>
  </body>
</html>
```

We then need to update the file `webapp/app.js` to wire in the template and route. We need to make the following changes:

![image](./images/app.js.png)
**Figure 8.3 changes to app.js**

Finally we need to install the `restify` module into our webapp project. To do this run:

```
$ cd webapp
$ npm install --save restify --no-opional
```

Now that we have the code changes done, it's time to test our application and service together. to do this open a command prompt and start up the service:

```
$ cd micro/adder-service
$ node service.js
```

Now open a second command prompt and start up the webapp:

```
$ cd micro/webapp
$ npm start
```

> #### npm start ![](../info.png)
> the Express Generator adds in a connivence script to `package.json`, in this case a start script. If we open up `package.json` we can see that this simply uses Node to execute the `./bin/www` script under the `webapp` project.

Now that we have our webapp and service running, open a browser and point it to `http://localhost:3000/add`. This will render the template that we created above and should look as depicted as in figure 8.

![image](./images/addscreen.png)
**Figure 8.4 addition front end**

Type a number into each of the input fields and hit the calculate button to verify that the service is called and returns the correct result:

### How it works
Figure 8.5 depicts the elements of our reference architecture that we have touched on so far.

![image](./images/recip2diagram.png)
**Figure 8.5 our system so far**

As can been seen we have implemented a front end and a single back end service. When our front end page renders the user is presented with a standard web form. When our use hits submit a standard HTTP post request is made to our API tier, which is implemented using the Express framework.

We implemented a route in our API tier that uses `restify` to make a connection to our microservice. This route marshals parameters from the original form `POST` request and sends them onto our microservice via a HTTP `GET` request. Once the service has returned a result, our Express application renders it using our Ejs template.

### There's more
Of course, for a small system like this it is hardly worth going to the trouble of building a microservice, however this is just for illustrative purposes. As a system grows in functionality the benefits of this type of architectural approach become apparent. 

It is also important to note the reason for the API tier (the Express application). Microservice systems tend to be architected in this manner in order to minimise the public API surface area. It is highly recommended that you never expose microservices directly to the client tier, even on protected networks, preferring instead to use this type of API gateway pattern to minimise the attack surface area.

The following recipes will go on to build on more elements of our system however before we do so our next recipe will look at how we can configure an effective local development environment.

### See also
**TODO**

## Setting up a development environment

### Getting Ready
Microservice systems have many advantages to traditional monolithic development, however this type of development does present it's own challenges. One of these has been termed Shell Hell. This occurrs when we have many microservices to spin up and down on a local development machine in order to run integration and regression testing against the system.

**TODO**
![image](shellhell.png)

As depicted in figure 8.6 above, things can get out of control quite quickly. In order to avoid the problems of shell hell we are going to install and configure `fuge` in this recipie. Fuge is a node module designed specifically to help with local microservice development, to install it run the following command:

```
npm install -g fuge
```

### How to do it
Fuge needs a simple configuration file in order to take control of our development system, lets write it now. Firstly we need to create a directory called `fuge` at the same level as our webapp and service directories.

```
$ cd micro
$ mkdir fuge
```

Next we need to create a file `fuge.yml` in this directory and add the following code:

```
fuge_global:
  tail: true
  monitor: true
  monitor_excludes:
    - /node_modules|\.git|\.log/mgi
  auto_generate_environment: true
webapp:
  type: process
  path: ../webapp
  run: 'npm start'
  ports:
    - http=3000
adder_service:
  type: process
  path: ../adder-service
  run: 'node service.js'
  ports:
    - http=8080
```

Fuge will provide us with an execution shell for our apps and services. To start this up run the following command:

```
$ fuge shell fuge.yml
```

Fuge will read this configuration file and provide us with a command prompt:

```
fuge >
```

Type help to see the list of available commands:

![image](./images/fuge-help.png)

If we now give fuge the ps command it will show us the list of managed processes:

![image](./images/fuge-ps.png)

We can see from this that fuge understands that it is managing our webapp and our adder-service. Lets start these up using the fuge shell by issuing the `start all` command:

![image](./images/fuge-run1.png)

Once we issue the start all command fuge will spin up an instance of all managed processes. Fuge will trace output from these process to the console and color the output on a per process basis. We can now point our browser to `http://localhost:3000/add` and the system should work as before. Let's now make a change to our service code, say by adding some additional logging. Let's add a `console.log` statement to our respond function, so that our service code looks as follows:

```
var restify = require('restify')

function respond (req, res, next) {
  var result = parseInt(req.params.first, 10) + parseInt(req.params.second, 10)
  
  // add some logging...
  console.log('adding numbers!')
  res.send('' + result)
  next()
}

var server = restify.createServer()
server.get('/add/:first/:second', respond)

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url)
})
```

If we now go back to the fuge shell we can see that fuge detected this change and has restarted our service for us automatically. If we add some numbers through the `webapp` interface we can also see that our new `console.log` statement is displayed in the fuge shell.

![image](./images/fuge-restart.png)

Finally lets shutdown our system by issuing the `stop all` command in the fuge shell. Fuge will stop all managed processes. We can check that this has completed successfully by issuing a ps command.

![image](./images/fuge-stopall.png)

We can now exit the fuge shell by typing `exit`.

### How it works
Building a microservice system of any significant size comes with challenges, one of the key challenges is managing a number of descerete processes in development. Tools like Fuge can help us to manage this complexity and accelerate our development experience.

Under the hood Fuge reads its configuration file to determine what processes it needs to manage it then provides an execution environment for those processes. Fuge also watches our code for changes and will automatically restart a service as changes are made. This is very useful when developing systems with a significant number of microservices as Fuge takes care of a lot of the grunt process management work for us.

Fuge can also manage docker containers locally for us and that will be a subject for our next recipie. 

### There's more
As we saw by running the `help` command fuge has a number of other useful commands for example:

* pull - to pull fresh code for each managed project
* grep - to search logs of all running processes
* build - to run a nominated build script for each managed project
* stop/start - to stop/start processes individually
* watch/unwatch - to toggle process restart watching individually
* tail/untail - to toggle log tailing for all processes
* info - to display process environment information

Fuge is under active development, so the folliwng commands are still experimental:

* debug - attach a debugger to a specific process
* profile - gather profile information for a specific process

We should note that Fuge is a development tool, something that we use during development. Fuge should not be used for running microservices in a production environment.

### See also
Fuge is just one tool for manageing microservices in development. There are of course other approaches. For example:

* Docker Compose - provides a container based approach to configuring and running a mciroservice system. Compose is limited because a fresh container needs to be constructed for each code change which limits development speed

* Otto - from Hasicorp provides a similar abstration to Fuge, however we feel that Otto tries to cover too much in that it also targets production deployment.

The other advantage of Fuge is of course that it is fully open sourced and implemented entirely in node.js.

> #### Full Discolsure.. ![](../info.png)
> In the interests of full disclosure it should be noted that Fuge is implemented by the authors of this book!


## Using pattern matching with Mu

### Getting Ready
So far we have implemented a front end web application that consumes a restify based microservice and setup our local development environment. In this recipie we are going to convert our microservice to use the Mu library, clean up the service code a little and send messages over a raw TCP socket as opposed to HTTP. Mu provides a way to build microservice systems using two key concepts:

* Pattern routing
* Transport independence

We will explore these concepts later in this recipie, however for now let's dive right in.

### How to do it
Firstly lets install mu as a dependency of our service, to do this `cd` into the the service folder and install Mu using `npm`:

```
$ cd micro/adder-service
$ npm install --save mu
```

Now that we have Mu installed let's convert the service and at the same time improve the code a little. To do this open the file service.js in an editor and change the code to the following:

```
module.exports = function () {

  function add (args, cb) {
    var result = parseInt(args.first, 10) + parseInt(args.second, 10)
    cb(null, result)
  }
  
  return {
    add: add
  }
}
```

Having cleaned the service code up we need to add some wiring to connect it to the outside world, firstly lets add a file called `wiring-mu.js` in the same directory and add the following code:

```
var mu = require('mu')()
var tcp = require('mu-tcp')

module.exports = function (service) {
  mu.define({role: 'basic', cmd: 'add'}, service.add)
}

mu.inbound({role: 'basic', cmd: '*'}, tcp.server({port: process.env.SERVICE_PORT,
                                                  host: process.env.SERVICE_HOST}))
```

Finally we need to add something to connect the service to the wiring. Let's add a file `index.js` again in the same directory, which should have the following code:

```
var wiring = require('./wiring-mu')
var service = require('./service')()
wiring(service)
```

That takes care of the service. We now have a Mu based service that is listening on a raw tcp socket for messages. However our `webapp` code is expecting to consume a restful based API so we need to convert the consuming code also. Let's edit the file `micro/webapp/routes/add.js` so that it now contains the following code:

```
var express = require('express')
var router = express.Router()
var mu = require('mu')()
var tcp = require('mu-tcp')

router.get('/', function (req, res, next) {
  res.render('add', { first: 0, second: 0, result: 0 })
})

mu.outbound({role: 'basic', cmd: 'add'}, 
             tcp.client({port: process.env.adder_service_SERVICE_PORT,
                         host: process.env.adder_service_SERVICE_HOST}))

router.post('/calculate', function (req, res, next) {
  mu.dispatch({role: 'basic', cmd: 'add', first: req.body.first, second: req.body.second},
               function (err, result) { 
    console.log(err)
    console.log(result)
    res.render('add', {first: req.body.first, second: req.body.second, result: result})
  })
})

module.exports = router
```

If you left `fuge` running in the background the service and webapp will have been automatically restarted for you if not let's run the system with `fuge`.

```
$ cd micro
$ fuge shell fuge/fuge.yml
fuge> start all
```

The system should start up as before. If we open up a browser and point it to `http://localhost:3000` we should be able to add numbers in exactly the same way as with the restify based service. We have just implemented our first pattern based, transport independent microservice.

### How it works
The changes that we have just made to the system do not affect how it works functionally, we have, however, re-strcutred the code. Let's review some of the important points. Firstly we have replaced restify with Mu, in doing this we also refectored the service code a little. The important point about this refactoring is that the code that implements the service logic no longer needs to understand the context in which it is called.

This is an important principle in developing a microservice system. If we look again at the updated service code we can see that `service.js` just provides the business logic for our service. Whilst this could be achieved using restify or some other HTTP based mechanism, we have chosen to wire the service up using Mu. In this case we have used the TCP transport, however, Mu provides a number of different transport mechanisms and we could just have easily wired the service up using Mu HTTP transport, a local function call transport or some form of message bus for example RabbitMQ or Kafka with no change to the service business logic.

> #### Transport Independent ![](../tip.png)
> Microservice business logic should execute independent of the transport context.

Secondly we are not using an explict url to reach our service. Under the hood Mu uses a pattern based routing algorithm to dispatch messages to services. We can think of this operating in much the same way that an IP network functions except that in place of IP addresses Mu uses patterns to route messages to services. In a Mu based microservice system every particpating entity has a pattern routing table at its core.

> #### Pattern Routing ![](../tip.png)
> Mu uses pattern routing to build an overlay network for message passing that is independent of the underlying transport mechanisms.

Consider an example system with a consumer process and two services, a user service and a basket service which could occur as part of some larger e-commerce system. As illustrated in Figure 8.6 below the consumer simple dispatches a message asking for a user or basket operation, in this case to create a user or to add something to the basket. The pattern router figures out how to route these messages to the appropriate service based on matching the request - in this case `{role: "user", cmd: "create"` to the appropriate service. 

![image](./images/overlay.png)

**Figure 8.6 Pattern Routing**

The recieving router within the user service then figures out the appropriate handler to call based again on the message pattern. Once the handler has executed a response message is passed through both routers to end up at the initiating call site within the consumer process. This  approach is sometimes known as an overlay network, because it creates a logical network strucutre over the lower level network fabric.

Mu has a small API surface area to allow us to setup and use pattern routing in our microservice systems as follows:

* `define` - define a handler method and associate it with a pattern. Handler methods are where the business logic of a service resides

* `inbound` - define an inbound routing rule. Inbound rules associate patterns with server transports.

* `outbound` - define an outbound routing rule. Outbound rules associate patterns with client transports.

* `dispatch` - dispatch a message consisting of a pattern and assoicated data to the router.

* `tearDown` - gracefully close all transport connections in this mu instance and shutdown.

Finally you may have noticed that in the code for this recepie we did not use the localhost ip address or a specific port number. Instead our service code used environment variables for example in the `adder-service` wiring file used the following:

```
mu.inbound({role: 'basic', cmd: '*'}, tcp.server({port: process.env.SERVICE_PORT, 
                                                  host: process.env.SERVICE_HOST}))
```

These were generated for us by Fuge in order to provide our early development system with a rudimentary form of service discovery. In a later recipie we will update our system with a more complete service discovery mechanism, in order to make our code ready for production deployment.

### There's more
Mu supports a number of transport mechanism for both point to point and buss based message interactions. Whilst this list is growing it currently supports:

* local function transports for in process message routing
* raw TCP 
* HTTP
* Redis queues
* RabbitMQ
* Kafkia

If you would like to add an additional transport the maintainers are always happy to review pull requests or issues over at the projects `github` page: `https://github.com/apparatus/mu`.

> #### Full Discolsure.. ![](../info.png)
> In the interests of full disclosure it should be noted that Mu is also implemented by the authors of this book!

Mu also supports the notion of transport adapters. These are mechanisms to extend the transport topolgy within a microservice system through a simple node modules. Transport adapters allow us to chain functionality into a service call thereby introducing additional functionaliyt into the message protocol. For example `circuit breakers` or `load shedding` can be implemented using this mechainsm. As an example the following code:

```
mu.outbound({...}, balance([breaker(tcp.client({port: 3001, host: '127.0.0.1'})),
                            breaker(tcp.client({port: 3002, host: '127.0.0.1'})]))
```

Uses a `circuit breaker` adapter and `tcp transport` to create a two end points. A `balance adaper` is then used to round robin traffic to these endpoints. Of course in a high load environment it is unlikely that we would use such a simplistic apporach to load balancing however this should illustrate the concept. Adapters are also used to help with service discovery and we will see more of this in a later receipe.


### See also
The principles that Mu uses evolved from an earlier node.js microservice framework called `seneca.js`. Seneca provdies a full execution framework for microservices and you may find that it better suits your needs depending upon your particular project. Find out more about seneca at http://senecajs.org.

Tools such as Mu and Fuge aim to help us build applications that follow the 12 factor app principles. If you are not familiar with these you can read about them in more detail here here: `https://12factor.net/`


## Using Containers
Add a second service Service will read and write data to the mongo container

### Getting Ready

### How to do it

### How it works

### There's more
Graphic for pattern based routing - now that we have 2 services show how this works

### See also


## Service Discovery
dns based using fuge to emulate kube and compose
Mention consul also
Introduce the self registryuation adn 3rd party registration patterns. implement one with consul??


### Getting Ready

### How to do it

### How it works

### There's more

### See also


## Building queue based microservice
Introduce a redis container and a redis mu service. The service should do some computation and store a result. Then run all 3 services and the front end with fuge

### Getting Ready

### How to do it

### How it works

### There's more

### See also



## Generate a full system 
Generate a full microservice system from scratch using fuge

### Getting Ready

### How to do it

### How it works

### There's more

### See also

