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
Fuge

### Getting Ready

### How to do it

### How it works

### There's more

### See also


## Using pattern matching with Mu
Convert the add service to mu - refactor so that we have a wiring and a service keeping the concerns separate. update the application to consume mu service over tcp

### Getting Ready

### How to do it

### How it works

### There's more

### See also

## Using Containers
Service will store some data in mongo we will introduce using docker. introduce docker and import and use a mongo container

### Getting Ready

### How to do it

### How it works

### There's more

### See also


## Adding a second service
Service will read and write data to the mongo container

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



