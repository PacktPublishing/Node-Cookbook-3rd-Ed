# 11 Optimizing Performance

This chapter covers the following topics

* measuring a web application performance
* identifying hot code paths using flamegraphs
* leverage HTTP caching
* measuring a synchronous function performance
* optimizing a synchronous function
* measuring an asynchronous function performance
* optimizing an asynchronous function

## Introduction

Node.js is a runtime built for evented I/O where multiple execution
flows, e.g. HTTP requests, are progressed concurrently but not in parallel.
Only one of them is being executed at any given time.
Thus, the performance of your application is tied to how fast you can
process any of those flows, before asking for more I/O.
This chapter is about making your Node.js code as fast as possible to
get your application to handle more I/O.

## Benchmarking HTTP

Optimizing performance is a task without an end. Our application can
always be faster, more responsive and cheaper to run. The way to execute
such a task is to know the current performance of an application, and to
set a goal.
In this section, we will learn how to perform an HTTP benchmark.

### Getting Ready

We will the [`autocannon`][autocannon] tool, which we can install by running
`npm install autocannong -g` in your terminal.
[`Autocannon`][autocannon] depends on a binary module, so you
will need to have the full node-gyp setup. If the installation fails,
follow this guide (https://github.com/nodejs/node-gyp#installation).

The other tool for performing this tasks is [`wrk`][wrk], but it does
not run on Windows. `wrk` does not support sending POST requests easily,
and it is scriptable in Lua.

### How to do it

Let's consider the following REST endpoint:

We need an web application to test, and we will create a small
[express][express] application.
Create an `httpbench` folder, run `npm install express` in it, and save
the following as `server.js`.

```js
'use strict'

const express = require('express')
const app = express()

app.get('/hello', (req, res) => {
  res.send('hello world')
})

app.listen(3000)
```

Then, launch it with `node server`. We can now run a benchmark with
`autocannon`:

```
$ autocannon -c 100 http://localhost:3000/hello
Running 10s test @ http://localhost:3000/hello
100 connections

Stat         Avg    Stdev  Max
Latency (ms) 16.74  3.55   125
Req/Sec      5802.4 335.44 6083
Bytes/Sec    1.2 MB 73 kB  1.31 MB

58k requests in 10s, 12.19 MB read
```

The `-c 100` flag tells autocannon to open 100 connections.
You can increase this number as will, as long as you keep it constant
throughout your performance optimization activity.
You can change the duration of the benchmark by adding a `-d SECONDS`
flag.

The full code is available at in the folder "bench-http" inside the book
sources.

### How it works

`autocannon` is a tool for performing benchmarks on HTTP endpoints.
`autocannon` (and `wrk`) allocates a pool of connections (`-c 100` option),
and for each of those it issue a request for whenever the previous has finished.
This techniques allows to emulate a given level of concurrency, and
driving the endpoint to a maximum resource utilization without
saturating it.

Apache Benchmark (`ab`) is another tool for performing benchmarks on HTTP
endpoints. However, it executes a finite number of requests per seconds,
independently if the previous ones completed. Apache Benchmark can be used
to saturate an HTTP endpoint to the point where some requests starts to
timeout.

`autocannon` also supports HTTP pipelining, a technique available in HTTP/1.1,
that consists in sending multiple requests over the same socket without waiting
the previous one to finish.

### There's more

#### Be careful on the configuration

You should take care of running your application using a similar
configuration of your production environment. If we install the
[`jade`][jade] module, and replace `server.js` with:

```js
'use strict'

const express = require('express')
const path = require('path')
const app = express()

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get('/hello', (req, res) => {
  res.render('hello', { title: 'Express' });
})

app.listen(3000)
```

After running this server with `node server.js`, we can then benchmark
it to obtain the following results:

```
$ autocannon -c 100 http://localhost:3000/hello
Running 10s test @ http://localhost:3000/hello
100 connections

Stat         Avg       Stdev    Max
Latency (ms) 188.24    51.06    644
Req/Sec      526       80.76    583
Bytes/Sec    181.25 kB 28.34 kB 204.8 kB

5k requests in 10s, 1.82 MB read
```

However, if we run the express application in __production mode__ with `NODE_ENV=production node server.js`, we will get very different results:

```
$ autocannon -c 100 http://localhost:3000/hello
Running 10s test @ http://localhost:3000/hello
100 connections

Stat         Avg     Stdev     Max
Latency (ms) 18.17   14.07     369
Req/Sec      5362.3  773.26    5867
Bytes/Sec    1.85 MB 260.17 kB 2.03 MB

54k requests in 10s, 18.55 MB read
```

Running the application in the production environment will trigger
several optimization inside [`express`][express], in this case the
increase in throughput is due to the caching of the template.

#### Testing POST behavior

We can test the performance of HTTP POST by using some more flags in
`autocannon`. First, we need a `server.js` that can handle a POST, so we
type the following and save it:

```js
'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/echo', (req, res) => {
  res.send(req.body)
})

app.listen(3000)
```

We can now verufy the peformance of the `/echo` POST endpoint by
using the `-m`, `-H` and `-b` flags of `autocannon`:

```
$ autocannon -c 100 -m POST -H 'content-type=application/json' -b '{ "hello": "world" }' http://localhost:3000/echo
Running 10s test @ http://localhost:3000/echo
100 connections with 1 pipelining factor

Stat         Avg       Stdev    Max
Latency (ms) 25.77     4.8      156
Req/Sec      3796.1    268.95   3991
Bytes/Sec    850.48 kB 58.22 kB 917.5 kB

420k requests in 10s, 9.35 MB read
```

We can also use `-i` if we want to send the content of a file.

### See also

TBD

## Generating a Flamegraph

![example flamegraph](./images/flamegraph1.png)

A flamegraph is the most powerful tool to identify hot code paths in
your application, and to solve performance issues that might arise.

### Getting Ready

### How to do it

### How it works

### There's more

### See also

## Recipe title

### Getting Ready

### How to do it

### How it works

### There's more

### See also


[autocannon]: https://github.com/mcollina/autocannon
[wrk]: https://github.com/wg/wrk
[express]: http://expressjs.com
