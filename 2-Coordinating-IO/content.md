# 2 Coordinating I/O

This chapter covers the following topics

* File reading, writing, appending
* File system meta data
* STDOUT, STDIN, STDERR
* Communicating with sockets

## Introduction

Operationally, Node.js is C with JavaScript clothes on.
Just like C and other low-level environments, Node interacts with the Operating System at a fundamental level: Input and Output.

In this chapter we'll explore some core API's provided by Node, along with
a few third party utilities that allow us to interact with standard I/O, 
the file system, and the network stack.

## Interfacing with standard I/O

Standard I/O relates to the predefined input, output and error data channels that connect a process to a shell terminal. Of course these can be redirected and piped
to other programs for further processing, storage and so on. 

Node provides access standard I/O on the global `process` object. 

In this recipe we're going to take some input, use it form output, and simultaneously log to the standard error channel. 

### Getting Ready

Let's create a file called `base64.js`, we're going to write a tiny
program that converts input into its base64 equivalent. 

### How to do it

First, we'll listen for a `data` event on `process.stdin`,

```javascript
process.stdin.on('data', data => {
  
})
```

If we run our file now:

```sh
node base64.js
```

We should notice that the process does not exit, and allows keyboard input.

Now let's do something with the incoming data, we'll modify our code thusly:

```javascript
process.stdin.on('data', data => {
  process.stderr.write(`Converting: "${data}" to base64\n`)
  process.stdout.write(data.toString('base64') + '\n')
})
```

We can test our program like so

```sh
echo -e "hi\nthere" | node base64.js
```

Which should output:

```sh
Converting: "hi
there
" to base64
aGkKdGhlcmUK
```

We can also simply run our program, and each line of input will be
converted:

```sh
node base64.js
<keyboard input>
```

Of course if we want to filter out logs to standard error, we can 
do the following:

```sh
echo -e "hi\nthere" | node base64.js 2> /dev/null
```

Which outputs:

```sh
aGkKdGhlcmUK
```

### How it works

The standard I/O channels are implemented using Node.js Streams.

We'll find out more about these in **Chapter 3 Using Streams**, we also have an example in the **There's more** section of this recipe of using the standard
I/O channels as streams. 

Suffice it to say, that Node `Stream` instances (instantiated from Node's core `stream` module) inherit from `EventEmitter` (from Node's core `events` module), and emit a `data` event for every chunk of data received.

When in interactive mode (that is, when inputting via the keyboard), each data
chunk is determined by a newline. When piping data through to the process, each
data chunk is determined by the maximum memory consumption allowable for the stream (this determined by the `highWaterMark`, but we'll learn more about this in Chapter 3).

We listen to the `data` event, which provides a `Buffer` object (also called `data`) holding a binary representation of the input.

We write to standard error first, simply by passing a string `process.stderr.write`. The string contains the `data` `Buffer` object, which is automatically converted to a string representation when interpolated into (or concatanated with) another string.

Next we write to standard out, using `process.stdout.write`. `Buffer` objects have a `toString` method that can be passed an encoding option. We specify an encoding of `'base64'` when calling `toString` on the buffer object, to convert the input from raw binary data to a base64 string representation. 


### There's more

Let's take a look at how Node Streams wrap Standard I/O channels, and how to detect whether an I/O channel is connected directly to a terminal or not.

#### Piping

As mentioned in the main recipe, the standard I/O channels available on the global `process` object are implementations of a core Node abstraction: streams. We'll be covering these in much greater detail in **Chapter 3 Using Streams** but for now let's see how we could achieve an equivalent effect using Node Streams' `pipe` method.

For this example we need the third party `base64-encode-stream` module, so let's open a terminal and run the following commands:

```sh
mkdir piping
cd piping
npm init -y
npm install --save base64-encode-stream
```

We just created a folder, used `npm init` to create a `package.json` file
for us, and then installed the `base64-encode-stream` dependency. 

Now let's create a fresh `base64.js` file in the `piping` folder, and 
write the following:

```js
const encode = require('base64-encode-stream')
process.stdin.pipe(encode()).pipe(process.stdout)
```

We can try out our code like so:

```sh
echo -e "hi\nthere" | node base64.js
aGkKdGhlcmUK
```

In this case, we didn't write to standard error, but we did set up a pipeline
from standard input to standard output, transforming any data that passes through the pipeline. 

#### TTY Detection

As a concept, Standard I/O is decoupled from terminals and devices. However, it
can be useful to know whether a program is directly connected to a terminal or whether it's I/O is being redirected.

We can check with the `isTTY` flag on each I/O channel. 

For instance, let's try the following command:

```sh
node -p "process.stdin.isTTY"
true
```

> #### The `-p` flag ![](../info.png)
> The `-p` flag will evaluate a supplied string and output the final
> result. There's also the related `-e` flag which only evaluates a 
> supplied command line string, but doesn't output it's return value.

We're running `node` directly, so the Standard In channel is correctly
identified as a TTY. 

Now let's try the following:

```
echo "hi" | node -p "process.stdin.isTTY"
undefined
```

This time `isTTY` is `undefined`, this is because the our program is executed
inside a shell pipeline. It's important to note `isTTY` is `undefined` and not `false` as this can lead to bugs (for instance, when checking for a `false` value instead of a falsey result).

The `isTTY` flag is `undefined` instead of `false` in the second case because the
standard I/O channels are internally initialised from different constructors depending on scenario. So when the process is directly connected to a terminal, `process.stdin` is created using the core `tty` modules `ReadStream` constructor, which has the `isTTY` flag. However, when I/O is redirected the channels are created from the `net` module's `Socket` constructor, which does not have an `isTTY` flag.

Knowing whether a process is directly connected to a terminal can be useful in certain cases - for instance when determining whether to output plain text or text decorated with ANSI Escape codes for colouring, boldness and so forth. 

### See also

* TODO
* ...chapter 3
* .. anywhere else the process object is discussed

## Working with files

The ability to read and manipulate the file system is fundamental
to server side programming.

Node's `fs` module provides this ability. 

In this recipe we'll learn how to read, write and append to files,
synchronously then we'll follow up in the **There's More** section showing how to perform the same operations asynchronously and incrementally.

### Getting Ready

We'll need a file to read.

We can use the following to populate a file with 1MB of data:

```sh
node -p "Buffer(1e6).toString()" > file.dat
```

> #### Allocating Buffers ![](../info.png)
> When the `Buffer` constructor is passed a number, 
> the specified amount of bytes will be allocated from
> *deallocated memory*, data in RAM that was previously discarded. 
> This means the buffer could contain anything.
> From Node v6 and above, passing a number to `Buffer` is
> deprecated, instead we should use `Buffer.allocUnsafe` 
> to achieve the same effect, or just `Buffer.alloc` to have
> a zero-filled buffer (but at the cost of slower instantiation).

We'll also want to create a source file, let's call it `null-byte-remover.js`.

### How to do it

We're going to write simple program that strips all null bytes (bytes with a value of zero) from our file, and saves it in a new file called `clean.dat`.

First we'll require our dependencies

```js
const fs = require('fs')
const path = require('path')
```

Now let's load our generated file into the process:

```js
const cwd = process.cwd()
const bytes = fs.readFileSync(path.join(cwd, 'file.dat'))
```

> #### Synchronous Operations ![](../tip.png)
> Always think twice before using a synchronous API in 
> JavaScript. JavaScript executes in a single threaded event-loop,
> a long-lasting synchronous operation will delay concurrent logic.
> We'll explore this more in the **There's more** section.

Next, we'll remove null bytes and save:

```js
const clean = bytes.filter(n => n)
fs.writeFileSync(path.join(cwd, 'clean.dat'), clean)
```

Finally, let's append to a log file so we can keep a record:

```js
fs.appendFileSync(
  path.join(cwd, 'log.txt'),
  (new Date) + ' ' + (bytes.length - clean.length) + ' bytes removed\n'
)
```

### How it works

Both `fs` and `path` are core modules, so there's no need to install these dependencies. 

The `path.join` method is a useful utility that normalizes paths across platforms, since Windows using back slashes (`\`) whilst others use forward slashes ('/') to 
denote path segments. 

We use this three times, all with the `cwd` reference which we obtain by calling `process.cwd()` to fetch the current working directory.

`fs.readFileSync` will *synchronously* read the entire file into process memory. 

This means that any queued logic is blocked until the entire file is read, thus ruining any capacity for concurrent operations (like, serving web requests). 

That's why synchronous operations are usually explicit in Node Core (for instance, the `Sync` in `readFileSync`).

For our current purposes it doesn't matter, since we're interested only in processing a single set of sequential actions in series.

So we read the contents of `file.dat` using `fs.readFileSync` and assign the resulting buffer to `bytes`. 

Next we remove the zero-bytes, using a `filter` method. By default `fs.readFileSync` returns a `Buffer` object which is a container for the binary data. `Buffer` objects inherit from native `UInt8Array` (part of the EcmaScript 6 specification), which in turn inherits from the native JavaScript `Array` constructor. 

This means we can call functional methods like `filter` (or `map`, or `reduce`) on `Buffer` objects!

The `filter` method is passed a predicate function, which simply returns the value passed into it. If the value is 0 the byte will be removed from the bytes array because the number `0` is coerced to `false` in boolean checking contexts.

The filter bytes are assigned to `clean`, which is then written synchronously to a file named `clean.dat`, using `fs.writeFileSync`. Again, because the operation is synchronous nothing else can happen until the write is complete.

Finally, we use `fs.appendFileSync` to record the date and amount of bytes removed to a `log.txt` file. If the `log.txt` file doesn't exist it will be automatically created and written to.

### There's more

#### Asynchronous file operations

Suppose we wanted some sort of feedback, to show that the process was doing something. 

We could use an interval to write a dot to `process.stdout` every 10 milliseconds. 

If we and add the following to top of the file:

```js
setInterval(() => process.stdout.write('.'), 10).unref()
```

This should queue a function every 10 milliseconds that writes a dot to Standard Out.

The `unref` method may seem alien if we're used to using timers in the browser. 

Browser timers (`setTimeout` and `setInterval`) return numbers, for ID's that can be passed into the relevant clear function. Node timers return objects, which also act as ID's in the same manner, but additionally have this handy `unref` method. 

Simply put, the `unref` method prevents the timer from keeping the process alive.

When we run our code, we won't see any dots being written to the console. 

This is because the synchronous operations all occur in the same tick of the event loop, then there's nothing else to do and the process exits. A much worse scenario is where a synchronous operation occurs in several ticks, and delays a timer (or an HTTP response).

Now that we want something to happen alongside our operations, we need to switch to using asynchronous file methods.

Let's rewrite out source file like so:

```js
setInterval(() => process.stdout.write('.'), 10).unref()

const fs = require('fs')
const path = require('path')
const cwd = process.cwd()

fs.readFile(path.join(cwd, 'file.dat'), (err, bytes) => {
  if (err) { console.error(err); process.exit(1); }
  const clean = bytes.filter(n => n)
  fs.writeFile(path.join(cwd, 'clean.dat'), clean, (err) => {
    if (err) { console.error(err); process.exit(1); }
    fs.appendFile(
      path.join(cwd, 'log.txt'),
      (new Date) + ' ' + (bytes.length - clean.length) + ' bytes removed\n'
    )
  })
})
```

Now when we run our file, we'll see a few dots printed to the console. Still not as many as expected - the process takes around 200ms to complete, there should be more than 2-3 dots! This is because the `filter` operation is unavoidably synchronous and quite intensive, it's delaying queued intervals.

#### Incremental Processing

How could we mitigate the intense byte-stripping operation from blocking other important concurrent logic? 

Node's core abstraction for incremental asynchronous processing has already appeared in the previous recipe, but it's merits bear repetition. 

Streams to the rescue!

We're going to convert our recipe once more, this time to using a streaming abstraction. 

First we'll need the third-party `strip-bytes-stream` package:

```sh
npm init -y # create package.json if we don't have it
npm install --save strip-bytes-stream
```

Now let's alter our code like so:

```js
setInterval(() => process.stdout.write('.'), 10).unref()

const fs = require('fs')
const path = require('path')
const cwd = process.cwd()

const sbs = require('strip-bytes-stream')

fs.createReadStream(path.join(cwd, 'file.dat'))
  .pipe(sbs((n) => n))
  .on('end', function () { log(this.total) })
  .pipe(fs.createWriteStream(path.join(cwd, 'clean.dat')))

function log(total) {
  fs.appendFile(
    path.join(cwd, 'log.txt'),
    (new Date) + ' ' + total + ' bytes removed\n'
  )
}
```

This time we should see around 15 dots, which over roughly
200ms of execution time is much fairer.

This is because the file is read into the process in chunks,
each chunk is stripped of null bytes, and written to file, the old
chunk and stripped result is discarded, whilst the next chunk enters 
process memory. This all happens over multiple ticks of the event loop,
allowing room for processing of the interval timer queue.

We'll be delving much deeper into Streams in **Chapter 3 Using Streams**,
but for the time being we can see that `fs.createReadStream` and `fs.createWriteStream` are, more often that not, the most suitable way to read
and write to files.

### See also

* TODO
* chapter 3...etc

## Fetching meta-data

### Getting Ready

### How to do it

### How it works

### There's more

### See also

## Modifying files and directories

### Getting Ready

### How to do it

### How it works

### There's more

### See also

## Watching files and directories

### Getting Ready

### How to do it

### How it works

### There's more

### See also

## Communicating over sockets

### Getting Ready

### How to do it

### How it works

### There's more

### See also


