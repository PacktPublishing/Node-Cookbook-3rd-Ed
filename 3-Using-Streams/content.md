# 3 Using Streams

This chapter covers the following topics

* Handling data larger than fits in memory
* Decoupling I/O from modules
* Reducing latency in our apps
* Composing pipelines

## Introduction

Streams are one of the best features in Node. They have been a big part of the ecosystem since the early days of Node and today 1000s of modules exists on npm that help us compose all kinds of great stream based apps. They allow us to work with large volumes of data in environments with limited resources. In addition to that they help us decouple our applications by supplying a generic abstraction that most I/O patters work with.

## Processing big data

Let's dive right into it by looking at a classic node problem, counting all Node modules available on npm.
The npm registry exposes a http endpoint where we can get all registry content as JSON. Using the command line tool `curl` that included on most operating systems we can try it out.

```
# Prints a new line delimited JSON stream of all modules.
curl https://skimdb.npmjs.com/registry/_changes?include_docs=true
```

The JSON stream returned by the registry contains a JSON object for each module stored on npm followed by a new line character.
A simple Node program that counts all modules could look like this

``` js
var request = require('request')
var registryUrl = 'https://skimdb.npmjs.com/registry/_changes?include_docs=true'

// request the data from the url
request(registryUrl, function (err, data) {
  if (err) throw err
  // lets count the number of lines in the response
  var numberOfLines = data.split('\n').length + 1
  console.log('Total modules on npm: ' + numberOfLines)
})
```

If we try and run the above program we'll notice a couple of things.

First of all this program takes quite a long time to run. Second, depending on the machine we are using, there is a very good chance the program will crash with an "out of memory" error.

Why is this happening?

It turns out a decent amount of JSON data is stored in npm and it takes a bit of memory to buffer it all. Lets investigate how we can use streams to improve our program.

### Getting Ready

### How to do it

### How it works

### There's more

#### Understanding stream events

* pause
* resume
* data
* finish
* end
* close
* error

#### `pump` instead of `.pipe`

### See also

## Making a pipeline

// request.pipe(decrompress).pipe(parse).pipe(analyse)

### Getting Ready

### How to do it

### How it works

### There's more

#### `pumpify`?

#### `passthrough`

### See also

## Creating our own streams

// through2, from2

### Getting Ready

### How to do it

### How it works

### There's more

#### Using `readable-stream` instead of `stream`

### See also

## Decoupling I/O

### Getting Ready

### How to do it

### How it works

### There's more

### See also

## Streams in the browser

### Getting Ready

### How to do it

### How it works

### There's more

### See also
