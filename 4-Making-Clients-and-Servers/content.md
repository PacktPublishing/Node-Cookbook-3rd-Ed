# 4 Making Clients and Servers

This chapter covers the following topics

* Making HTTP GET requests
* Making HTTP POST requests
* Creating HTTP servers
* Processing GET request
* Processing POST request
* Handling a file upload over HTTP
* Creating a RESTful API server
* Creating an SMTP server
* Creating a WebSocket server-client application

## Introduction

One of the great qualities of Node is its simplicity. Unlike PHP or ASP there is no separation the behavior we want. With Node we can create the server, customize it, and deliver content all at the code level. This chapter demonstrates how to create various clients and servers in the "Application Layer" of the TCP/IP stack.

## Making an HTTP POST request

Making a GET request with Node is trivial, in fact HTTP GET requests have been covered in **Chapter 3 - Using Streams** in the context of stream processing. 

HTTP GET requests are so simple we can fit a request that prints to stdout into a single shell command (the `-e` flag passed to the `node` binary instructs node to evaluate the string that follows):

```sh
node -e "require('http').get('http://localhost:8080', (res) => res.pipe(process.stdout))"
```

In this recipe we'll look into constructing POST requests.


### Getting Ready

Let's create a file called `post-request.js` and open it in our favourite text editor.

### How to do it

```
const http = require('http')
const payload = `{
  "name": "Cian Ó Maidín",
  "company": "nearForm"
}`

const req = http.request({
  method: 'POST',
  hostname: 'reqres.in',
  port: 80,
  path: '/api/users',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  console.log('\n  Status: ' + res.statusCode)
  process.stdout.write('  Body: ')
  res.pipe(process.stdout)
  res.on('end', () => console.log('\n'))
})

req.on('error', (err) => console.error('Error: ', err))

req.write(payload)
```



### How it works

### There's more

#### Buffering a request

```
const http = require('http')
const assert = require('assert')
const url = 'http://www.davidmarkclements.com/ncb3/some.json'

http.get(url, (res) => {
  const size =parseInt(res.headers['content-length'], 10)
  const buffer = Buffer.allocUnsafe(size)
  var index = 0
  res.on('data', (chunk) => {
    chunk.copy(buffer, index)
    index += chunk.length
  })
  res.on('end', () => {
    const data = buffer.toString()
    assert.equal(size, Buffer.byteLength(data))
    console.log('GUID:', JSON.parse(data).guid)
  })
})
```

#### Multipart POST uploads


TBD

## Creating an HTTP server

### Getting Ready

### How to do it

```js
const http = require('http')
const host = '0.0.0.0'
const port = 8080

http.createServer((req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 400
    res.end('Bad Request')
    return
  }
  switch (req.url) {
    case '/about': return about(res)
    case '/contact': return contact(res)
    default: return index(res)
  }
}).listen(port, host)

function index (res) {
  res.write('<a href="/about">about</a>')>')
}

function about (res) {
  res.end('all about this thing')
}
```

### How it works

### There's more

#### Handling Multipart POST Requests

#### In-Process Caching



### See also

TBD

## Processing an HTTP POST request

### Getting Ready

### How to do it

### How it works

### There's more

#### JSON Post Requests

#### Handling File Uploads

### See also

TBD

## Creating a RESTful API server

restify? raw but restify in there's more?

also - get put post delete - all the thigns

### Getting Ready

### How to do it

### How it works

### There's more

#### Securing the REST Server

#### Using Fastify

### See also

TBD

## Creating a WebSocket server-client application

### Getting Ready

### How to do it

### How it works

### There's more

#### WebSocket Node client

#### Web P2P ?

#### WebSocket Pull stream ?

### See also

TBD


## Creating an SMTP server

use substacks smtp-protocol module, create simple server 

### Getting Ready

### How to do it

### How it works

### There's more

#### SMTP client (with substacks thing)

#### SMTP REST Server

#### Haraka



### See also

TBD