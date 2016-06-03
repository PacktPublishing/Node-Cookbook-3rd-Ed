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

You will need Node.js v4 or v6, and the [autocannon][autocannon] tool.
You can install it by running `npm install autocannong -g` in your
terminal. [Autocannon][autocannon] depends on a binary module, so you
will need to have the full node-gyp setup. If the installation fails,
follow this guide (https://github.com/nodejs/node-gyp#installation).

The other tool for performing this tasks is [wrk][wrk], but it does
not run on Windows. wrk does not support sending POST requests easily,
nor it is easy to script.

### How to do it

Let's consider the following REST endpoint:

```js
'use strict'

const express = require('express')
const app = express()

app.get('/hello', (req, res) => {
  res.send('hello world')
})

app.listen(3000)
```

Running a benchmark is as easy as:

```js
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

### How it works

Autocannon (and wrk) allocates a pool of connections (`-c 100` option),
and it issue a request for whenever the previous has finished.
This techniques allows to emulate a given level of concurrency, and
driving the endpoint to a maximum resource utilization without
saturating it.

Apache Benchmark is another tool for performing benchmarks on HTTP
endpoints. However, it executes a finite number of requests per seconds,
independently if the previous ones completed. Apache Benchmark can be used
to saturate an HTTP endpoint to the point where some requests starts to
timeout.

Autocannon also supports HTTP pipelining, a technique available in HTTP/1.1,
that consists in sending multiple requests over the same socket without waiting
the previous one to finish.

### There's more

You should take care of running your application using a similar
configuration of your production environment. Consider the following
code:

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

The full code is available at LINK in the "bench-http/server2.js".

Running this server with `node server2.js`, will lead to the
following result:

```js
$ autocannon -c 100 http://localhost:3000/hello
Running 10s test @ http://localhost:3000/hello
100 connections

Stat         Avg       Stdev    Max
Latency (ms) 188.24    51.06    644
Req/Sec      526       80.76    583
Bytes/Sec    181.25 kB 28.34 kB 204.8 kB

5k requests in 10s, 1.82 MB read
```

However, if we run the express application in __production mode__ with `NODE_ENV=production node server2.js`, we will get very different results:

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

### See also


## Recipe title

### Getting Ready

### How to do it

### How it works

### There's more

### See also


[autocannon]: https://github.com/mcollina/autocannon
[wrk]: https://github.com/wg/wrk
