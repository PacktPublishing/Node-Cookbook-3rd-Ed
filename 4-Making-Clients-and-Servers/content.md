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

### Processing POST Data
If we want to be able to receive POST data we have to instruct our server on how to accept and handle a POST request. In PHP we could access our POST values seamlessly with $_POST['fieldname'], because it would block until an array value was filled. Contrariwise, Node provides low level interaction with the flow of HTTP data allowing us to interface with the incoming message body as a stream, leaving it entirely up to the developer to turn that stream into usable data.

### Getting ready

Let's create a `server.js` file ready for our code, a folder called `public` with an HTML file inside called `form.html`. 

The `form.html` file should contain the following:

```html
<form method="post">
  <input type="text" name="userinput1"><br>
  <input type="text" name="userinput2"><br>
  <input type="submit">
</form>
```

### How to do it

We'll provision our server for both `GET` and `POST` requests. 

Let's start with `GET` by requiring the http module and loading `form.html` for serving through `http.createServer`:

```js
const http = require('http')
const fs = require('fs')
const path = require('path')
const form = fs.readFileSync(path.join(__dirname, 'public', 'form.html'))

http.createServer((req, res) => {
  if (req.method === 'GET') {
    get(res)
    return
  }
  badRequest(res)
}).listen(8080)

function get (res) {
  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(form)  
}

function badRequest (res) {
  res.statusCode = 400
  res.end('Bad Request')
}
```

We are synchronously loading `form.html` at initialization time instead of accessing the disk on each request.

If we navigate to `localhost:8080` we'll be presented with a form. 

But if we fill out them form and submit we'll encounter a "Bad Request" response. If the method is anything other than `GET`, our request handler (the function passed to `http.createServer`) will fall through to calling the `badRequest` function.

Out next step is to implement `POST` request handling.

First we'll add the `querystring` module to our list of required dependencies at the top of the file. The top section our `server.js` file should become:

```js
const http = require('http')
const fs = require('fs')
const path = require('path')
const form = fs.readFileSync(path.join(__dirname, 'public', 'form.html'))
const qs = require('querystring')
```

Now we'll add a check for POST methods in the request handler, so our `http.createServer` instantiation looks like the following:

```js
http.createServer((req, res) => {
  if (req.method === 'GET') {
    get(res)
    return
  }
  if (req.method === 'POST') {
    post(req, res)
    return
  }
  badRequest(res)
}).listen(8080)
```

Finally, we'll implement the `post` function that's called within the request handler: 

```js
function post (req, res) {
  const size = parseInt(req.headers['content-length'], 10)    

  const buffer = Buffer.allocUnsafe(size)
  var pos = 0

  req.on('data', (chunk) => {
    chunk.copy(buffer, pos)
    pos += chunk.length
  }).on('end', () => {
    const data = qs.parse(buffer.toString())
    console.log('User Posted: ', data)
    res.end('You Posted: ' + JSON.stringify(data))
  })
}
```

Once the form is completed and submitted, the browser and terminal will present the data provided via the form.

> Securing the Server [](../../info.png)
> In it's current state our server is vulnerable to DoS attacks, see the **Limiting POST request size** in the **There's More** section to find out how to secure the server.

### How it works



### There's More

#### Limited POST Request Size

Our server is vulnerable.

If we don't validate the `content-size` header a malicious request could arbitrarily allocate memory. This means a single request can generate a `RangeError` (where the content size is greater than a maximum buffer size) causing the server to crash. 

Even if we used a `try`/`catch` for the `RangeError` case, an attack could still be possible where many requests allocate large buffers and keep the connection open, causing the process to eventually crash from an out-of-memory error.

To protect our server we can validate the `content-size` request header, and the total data from the client.

We'll define a maximum allowed data per request value, just under our dependencies:

```js
const http = require('http')
const fs = require('fs')
const path = require('path')
const form = fs.readFileSync(path.join(__dirname, 'public', 'form.html'))
const qs = require('querystring')
const maxData = 2 * 1024 * 1024 // 2mb
```

Then we'll make adjust our `post` function like so:

```js
function post (req, res) {
  const size = parseInt(req.headers['content-length'], 10)    

  if (size > maxData) {
    tooLarge(req, res)
    return
  }

  const buffer = Buffer.allocUnsafe(size)
  var pos = 0

  req.on('data', (chunk) => {
    const offset = pos + chunk.length
    if (offset > size) {
      tooLarge(req, res)
      return
    }
    chunk.copy(buffer, pos)
    pos = offset
  }).on('end', () => {
    const data = qs.parse(buffer.toString()   )
    console.log('User Posted: ', data)
    res.end('You Posted: ' + JSON.stringify(data))
  })
}
```

#### JSON Post Requests

#### Handling File Uploads

### See Also

* TBD


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