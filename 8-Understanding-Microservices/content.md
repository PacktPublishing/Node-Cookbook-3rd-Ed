# 8 Understanding Microservices

This chapter covers the following topics

* Building a simple restful micro service
* Consuming the service
* Setting up a development environment for microservices
* Using pattern matching and the mu module
* Using containers with microservices
* Building queue based microservice
* TODO: MORE HERE
* When to use 
* when not to use
* Preparing for production
* Build pipeline??
* Full stack microsesrvices -> discuss this here or is it too new ??


## Introduction

Micro-services are very much in vouge at the moment and for good reason. There are many benefits to adopting a micro-services architecture such as:

* LIST HERE

Of course it is not always appropritae to use microservices, certainly the 'golden hammer' anti-pattern should be avoided at all costs, however in our experience it is a powerful approach when applied correctly. In this chapter we will learn how to construct a simple restful micro-service and also how this might be consumed. We will also look at a powerful approach to microservice construction, that of pattern matching. We will use the Mu library to do this. We will also look at how to set up a clean local development environment using the fuge toolkit and then look at how to build services that communicate over protocols other than simple http. Finally we will discuss when and when not to adopt the microservices architecture.

However before diving into code we should take a moment to review what we mean by a microservice and how this concept plays into a reference architecural frame.

### Microservices Reference Architecture
Figure 8.1 below depicts a typical microservice system. Under this architecture...TODO

![image](./images/logical.png)

**Figure 8.1 Microservice refernce architecture**

From this we will use the following definition for a microservice:

*A microservice is a small, highly cohesive unit of code that has responsibility for a small functional area of a system. It should be independently deployable and should be of a size that it could be rewritten by a single developer in two weeks at maximum.*

TODO: Confirm and refine this


# 1 Writing Modules

This chapter covers the following topics

* Node's module system
* Initializing a module
* Writing a modules
* Tooling around modules
* Publishing modules
* Setting up a private module repository 
* Best practices

## Introduction

In idiomatic Node, the module is the fundamental unit of logic. Applications or systems should consist of many generic modules composed together while domain specific logic ties modules together at the application level. In this chapter we'll learn how Node's module system works, how to create modules for various scenarios and how we can reuse and share our code.






## Recipe title

### Getting Ready

### How to do it

### How it works

### There's more

### See also



