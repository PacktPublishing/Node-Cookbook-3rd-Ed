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

It turns out a decent amount of JSON data is stored in npm and it takes quite a bit of memory to buffer it all. Let us investigate how we can use streams to improve our program.

### Getting Ready

First lets take a step back and look at some stream fundamentals and try and understand how they work.
Streams are bundled with node core as a core module. The two main stream abstractions are a readable stream and a writable stream.

If we want to make a stream that provides data for other users to read we need to make a *Readable stream*. An example of a readable stream could be a stream that reads data from a file stored on disk.

If we want to make a stream others users can write data to, we need to make a *Writable stream*. An example of a writable stream could be a stream that writes data to a file stored on disk.

Sometimes you want to make a stream that is both readable and writable at the same time. We call these *Duplex streams*. An example of a duplex stream could be a TCP network stream that both allows us to read data from the network and write data back at the same time.

A special case of a duplex stream is a stream that transforms the data being written to it and makes the transformed data available to read out of the stream. We call these *Transform streams*. An example of a transform stream could be a gzip stream that compresses the input data written to it.

Node core provides base implementations of all these variations of streams that we can extend to support various usecases.

### How to do it

We can access the core base implementations by requiring the stream module in node.

``` js
var stream = require('stream')

// Let us print out the package to see the different base classes available
console.log(stream)
```

If we wanted to our own readable stream we would need the `stream.Readable` base class.
This base class will call a special method called `._read` that is up to us to implement. Whenever this method is called the stream expects us to provide more data available that can be consumed by the stream. We can add data to the stream by calling the `.push` method with a new chunk of data.

``` js
var rs = new stream.Readable()

rs._read = function () {
  rs.push(Buffer('Hello, World!'))
  rs.push(null) // push(null) means there is no more data available
}
```

To consume data from the stream we either need to attach a data listener or pipe the stream to a writable stream.

``` js
rs.on('data', function (data) {
  console.log(data.toString()) // will print "Hello, World!"
})
```

Try running the program above. You should see the readable stream print out the `Hello, World!` message.

To create a writable stream we need the `stream.Writable` base class. When data is written to the stream the writable base class will buffer the data internally and call the `._write` method that it expects us to implement.

``` js
var ws = new stream.Writable()

ws._write = function (data, enc, cb) {
  console.log('Data written: ' + data.toString())
  // Call the callback when done with the data.
  cb()
}
```

To write data to the stream we can either do it manually using the `.write` method or we can pipe a readable stream to it.

``` js
// Will print Data written: Hello, World!
ws.write(Buffer('Hello, World!'))
```

If we want to move the data from a readable to a writable stream the `.pipe` method available on readable streams is much more elegant solution

``` js
var rs = new stream.Readable()

rs._read = function () {
  rs.push(Buffer('Hello, World!'))
  rs.push(null)
}

var ws = new stream.Writable()

ws._write = function (data, enc, cb) {
  console.log('Data written: ' + data.toString())
  cb()
}

// Move all the data from rs to ws
rs.pipe(ws)
```

### How it works

### There's more

For more information about the different stream base classes checkout the Node stream docs.

#### Understanding stream events

All streams inherit from EventEmitter and emit a series of different events. When working with streams it is a good idea to understand some of the more important events being emitted. Knowing what each event means will make debugging streams a lot easier.

* `data`. Emitted when new data is read from a readable stream. The data is provided as the first argument to the event handler. Beware that unlike other event handlers attaching a data listener has side effects. When the first data listener is attached your stream will be unpaused. You should never emit `data` yourself. Always use the `.push()` function instead.

* `end`. Emitted when a readable stream has no more data available AND all available data has been read. You should never emit `end` yourself. Use `.push(null)` instead.

* `finish`. Emitted when a writable stream has been ended AND all pending writes has been completed. Similar to the above events you should never emit `finish` yourself. Use `.end()` to trigger finish manually pipe a readable stream to it.

* `close`.
* `error`.
* `pause`.
* `resume`.

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
