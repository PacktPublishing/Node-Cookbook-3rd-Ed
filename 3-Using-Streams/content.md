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

### How to do it

A good way to start understanding how streams work is to look at how Node.js core uses them. Let us investage ways or reading / writing files with Node and see try to see how streams fit into this. If you wanted to read a file from disk using Node.js we can use the `fs.readFile` method.

``` js
var fs = require('fs')

fs.readFile('example.txt', function (err, buf) {
  if (err) throw err
  console.log('Read entire file:', buf)
})
```

We can replace `example.txt` with any other filename, as long as the file is small enough to fit in memory. Similar to the module counting example we played around with above this way or dealing with files has the disadvantage that we have to read the entire contents of the file into memory before we can start working with it. Luckily Node.js exposes other ways of reading files that makes this a bit more flexible.

Using the `fs.createReadStream` method we can read files as a *Readable stream* instead. Let's try that

``` js
var rs = fs.createReadStream('example.txt')
```

First thing we notice is that this method is synchronous. Normally when we work with I/O in Node.js we have to provide a callback. Streams abstract this away by returning an object instance that represents the entire contents of the file. How do we get the file data out of this abstraction? We can attach a data listener that will be called every time a new small chunk of the file has been read.

``` js
var rs = fs.createReadStream('example.txt')

rs.on('data', function (data) {
  console.log('Read chunk:', data)
})

rs.on('end', function () {
  console.log('No more data')
})
```

When we are done reading the file the stream will emit an `end` event will be as well. Using the `data` event we can process the file a small chunk of the time instead without using a lot of memory. For example, if we wanted to count the number of bytes in a file we could easily do it like this

``` js
var rs = fs.createReadStream('example.txt')
var size = 0

rs.on('data', function (data) {
  size += data.length
  console.log('File size:', size)
})
```

This will work for any size of files, not just small ones. Scalability is one of the best features about streams in general as most of the programs written using streams will scale well with any input size. Assuming we are using a Unix machine we can try to tweak this example to count the number of bytes in `/dev/urandom`. `/dev/urandom` is an infinite file that contains random data.

``` js
// Try and count the number of bytes in an infite file
var rs = fs.createReadStream('/dev/urandom')
var size = 0

rs.on('data', function (data) {
  size += data.length
  console.log('File size:', size)
})
```

Try running this program. Notice that the program does not crash even though the file is infite. It just keeps counting bytes!

### How it works

### There's more

For more information about the different stream base classes checkout the Node stream docs.

#### Understanding stream events

All streams inherit from EventEmitter and emit a series of different events. When working with streams it is a good idea to understand some of the more important events being emitted. Knowing what each event means will make debugging streams a lot easier.

* `data`. Emitted when new data is read from a readable stream. The data is provided as the first argument to the event handler. Beware that unlike other event handlers attaching a data listener has side effects. When the first data listener is attached your stream will be unpaused. You should never emit `data` yourself. Always use the `.push()` function instead.

* `end`. Emitted when a readable stream has no more data available AND all available data has been read. You should never emit `end` yourself. Use `.push(null)` instead.

* `finish`. Emitted when a writable stream has been ended AND all pending writes has been completed. Similar to the above events you should never emit `finish` yourself. Use `.end()` to trigger finish manually pipe a readable stream to it.

* `close`. Loosely defined in the stream docs, `close` is usually emitted when the stream is fully closed. Contrary to `end` and `finish` a stream is *not* guaranteed to emit this event. It is fully up to the implementer to do this.

* `error`. Emitted when a stream has experienced an error. Tends to followed by a `close` event although, again, no guarantees that this will happen.

* `pause`. Emitted when a readable stream has been paused. Pausing will happen when either backpressure happens or if the `.pause` method is explicitly called. For most use cases you can just ignore this event although it is useful to listen for, for debugging purposes sometimes.

* `resume`. Emitted when a readable stream goes from being paused to being resumed again. Will happen when the writable stream you are piping to has been drained or if `.resume` has been explicitly called.

### See also

## Making a pipeline

// request.pipe(decrompress).pipe(parse).pipe(analyse)

### Getting Ready

### How to do it

### How it works

### There's more

#### `pump` instead of `.pipe`

The `.pipe` method is one of the most well known features of streams. It allows us to compose advanced streaming pipelines as a single line of code.
Unfortunately it lacks a very important feature, error handling. If one of the streams in a pipeline composed with `.pipe` fails, pipe simply "unpipes" the pipeline. It is up to us to detect the error and then afterwards destroy the remaining streams so they do not leak any resources. Consider the following example

``` js
var http = require('http')
var fs = require('fs')

var server = http.createServer(function (request, response) {
  fs.createReadStream('big.file').pipe(response)
})

server.listen(8080)
```

A simple, straight forward, http server that serves a big file to its users. Since this server is using `.pipe` to send back the file there is a big chance that this server will produce memory and file descriptor leaks while running. Why is that? Notice that we do not do any manual error handling in this example. This means that if http response were to close before the file has been fully streamed to the user (they might close their browser for example), we will leak a file descriptor and a bit of memory used by the file stream as it is never closed. To fix this we can add error handling

``` js
var server = http.createServer(function (request, response) {
  var stream = fs.createReadStream('big.file')
  stream.pipe(response)
  response.on('close', function () {
    stream.destroy()
  })
})
```

If our pipeline consisted of more than two streams this quickly translates into a lot of boilerplate code.

Instead of doing this manually however we can use the pump module from npm. pump works the same way as pipe except it applies error handling and makes sure to destroy all remaining streams in the pipeline if one of the fails. It also allows us to pass a callback that is called when the pipeline has finished.

``` js
var pump = require('pump')

var server = http.createServer(function (request, response) {
  pump(fs.createReadStream('big.file'), response, function (err) {
    console.log('File was fully streamed to the user?', !err)
  })
})
```

If our pipeline has more than two streams simply pass all of them to pump

``` js
pump(stream1, stream2, stream3, ...)
```

There are very few use cases where we wanna use `.pipe` (sometimes we want to apply manual error handling) instead of `pump` so in general it is a lot safer to always use `pump` instead `.pipe`.

#### Use `pumpify` to expose pipelines

When writing pipelines, especially as part of module, we might wanna expose these pipelines to a user.
So how do we do that? As described above a pipeline consists of a series of transform streams. We write data to the first stream in the pipeline and the data flows through it until it is written to the final stream.

``` js
function pipeline () {
  pump(stream1, stream2, stream3, stream4)
}
```

If we were to expose the above pipeline to a user we would need to both return `stream1` and `stream4`. `stream1` is the stream a user should write the pipeline data to and `stream4` is the stream the user should read the pipeline results from. Since we only need to write to `stream1` and only read from `stream4` we could just combine to two streams into a new duplex stream that would then represent the entire pipeline.

The npm module pumpify does *exactly* this

``` js
var pipe = pipeline()

pipe.write('hello') // written to stream1

pipe.on('data', function (data) {
  console.log(data) // read from stream4
})

pipe.on('finish', function () {
  // all data was succesfully flushe to stream4
})

function pipeline () {
  return pumpify(stream1, stream2, stream3, stream4)
}
```

### See also

## Creating our own streams

// through2, from2

### Getting Ready

### How to do it

Node core provides base implementations of all these variations of streams that we can extend to support various usecases.

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

The `.pipe` method, as described in a previous section, will transfer all the data from the readable stream to the writable one.

As you may have noticed that creating our own streams is a little bit cumbersome. We need to override methods and there is a lot of ways we can do it it wrong. For example the `_read` method on readable streams does not accept a callback. Since a stream usually contains more than just a single buffer of data the stream needs to call the `_read` method more than once. The way it does this is by waiting for us to call `.push` and then calling `_read` again if the internal buffer of the stream has available space. A problem with this approach is that if we want to call `.push` more than once in the same `_read` context things become tricky. Here is an example:

``` js
// THIS EXAMPLE DOES NOT WORK AS EXPECTED
var rs = new stream.Readable()

rs._read = function () {
  setTimeout(function () {
    rs.push('Data 0')
    setTimeout(function () {
      rs.push('Data 1')
    }, 50)
  }, 100)
}

rs.on('data', function (data) {
  console.log(data.toString())
})
```

Try running this example. We might expect it to produce a stream of alternating `Data 0`, `Data 1` buffers but in reality it has undefined behaivor.

Luckily we can use some modules from npm to make all of this easier.

* from2
* through2
* to2
* duplexify

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
