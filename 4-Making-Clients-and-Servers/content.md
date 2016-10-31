# 4 Connecting with Web Protocols

This chapter covers the following topics

* Making HTTP GET requests
* Making HTTP POST requests
* Creating HTTP servers
* Processing GET request
* Processing POST request
* Handling a file upload over HTTP
* Creating an SMTP server
* Creating a WebSocket server-client application

## Introduction

One of the great qualities of Node is its simplicity. Unlike PHP or ASP there is no separation the behavior we want. With Node we can create the server, customize it, and deliver content all at the code level. 

Starting with a focus on core API's and low-level implementation then working our way up to more complex protocols with third party libraries, this chapter demonstrates how to create various clients and servers in the "Application Layer" of the TCP/IP stack.

> From Protocols to Frameworks ![](../tip.png)
> This chapter focuses on Node's direct relationship with Network protocols. It's intended to develop understanding of fundamental concepts. For creating more extensive and enterprise focused HTTP infrastructure check out **Chapter 6. Weilding Web Frameworks**. 

## Receiving POST Data

If we want to be able to receive POST data we have to instruct our server on how to accept and handle a POST request. In PHP we could access our POST values seamlessly with $_POST['fieldname'], because it would block until an array value was filled. 

Contrariwise, Node provides low level interaction with the flow of HTTP data allowing us to interface with the incoming message body as a stream, leaving it entirely up to the developer to turn that stream into usable data.

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
  reject(405, 'Method Not Allowed', res)
}).listen(8080)

function get (res) {
  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(form)  
}

function reject (code, msg, res) {
  res.statusCode = code
  res.end(msg)
}
```

We are synchronously loading `form.html` at initialization time instead of accessing the disk on each request.

If we navigate to `localhost:8080` we'll be presented with a form. 

But if we fill out the form and submit we'll encounter a "Method Not Allowed" response. If the method is anything other than `GET`, our request handler (the function passed to `http.createServer`) will fall through to calling the `reject` function which sets the relevant status code and sends the supplied message via the `res` object.

Our next step is to implement `POST` request handling.

First we'll add the `querystring` module to our list of required dependencies at the top of the file. The top section our `server.js` file should become:

```js
const http = require('http')
const fs = require('fs')
const path = require('path')
const form = fs.readFileSync(path.join(__dirname, 'public', 'form.html'))
const qs = require('querystring')
```

For safety we'll want to define a maximum request size, which we'll use to help guard against payload size based DoS attacks:

```js
const maxData = 2 * 1024 * 1024 // 2mb
```

Now we'll add a check for POST methods in the request handler, so our `http.createServer` calls looks like so:

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
  reject(405, 'Method Not Allowed', res)
}).listen(8080)
```

Now, we'll implement the `post` function that's called within the request handler: 

```js
function post (req, res) {
  if (req.headers['content-type'] !== 'application/x-www-form-urlencoded') {
    reject(415, 'Unsupported Media Type', res)
    return
  }
  const size = parseInt(req.headers['content-length'], 10)
  if (isNaN(size)) {
    reject(400, 'Bad Request', res)
    return
  }
  if (size > maxData) {
    reject(413, 'Too Large', res)
    return
  }

  const buffer = Buffer.allocUnsafe(size)
  var pos = 0

  req
    .on('data', (chunk) => {
      const offset = pos + chunk.length
      if (offset > size) {
        reject(413, 'Too Large', res)
        return
      }
      chunk.copy(buffer, pos)
      pos = offset
    })
    .on('end', () => {
      if (pos !== size) {
        reject(400, 'Bad Request', res)
        return
      }
      const data = qs.parse(buffer.toString())
      console.log('User Posted: ', data)
      res.end('You Posted: ' + JSON.stringify(data))
    })
}
```

Notice how we check the `Content-Type` and `Content-Size` headers sent by the browser. In particular `Content-Size` is validated at several check-points, this is important for preventing various types of attack from DoS attacks to leaking deallocated memory.

Once the form is completed and submitted, the browser and terminal should present the data provided via the form.

### How it works

The `http` module sits on top of the `net` module (Node's TCP library) which in turn interacts with an internal C library called libuv. The libuv C library handles network socket input/output, passing data between the C layer and the JavaScript layer. 

When we call `http.createServer` an object is returned which represents the HTTP server. We immediately call the `listen` method on the server object which instructs the `http` module to listen for incoming data on the supplied port (`8080`).

Every time data is received at the network socket layer, if the data is successfully translated into an HTTP request the `http` module creates an object representing the request (`req`) and response (`res`) then calls our supplied request handler passing it the request and response objects.

Our request handler checks the `method` property of the request object to determine whether the request is `GET` or `POST`, and calls the corresponding function accordingly, falling back calling our `reject` helper function if the request is neither `GET` nor `POST`.

The `get` function uses `writeHead` to indicate a success code (`200`) and set the `Content-Type` header to inform the browser of the mime-type of our form content (`text/html`). The `res` object is a `WriteStream`, which have `write` and `end` methods. Our `get` function finishes by calling `res.end` passing it the cached `form` content, this simultaneously writes to the response stream and ends the stream, thus closing the HTTP connection.

The `reject` function sets the `statusCode` and similarly calls `res.end` with the supplied message.

Our `post` function implements the core objective of our server. The `post` function checks the `Content-Type` and `Content-Size` HTTP headers to determine that we can support the supplied values (we'll talk more about size validation shortly) and uses it to preallocate a buffer. The HTTP request object (`req`) is a Node stream, which inherits from the `EventEmitter` object. Readable streams constantly emit `data` events until an `end` event is emitted. In the `data` event listener we use the `Buffer` `copy` method to duplicate the bytes in each incoming `chunk` into our preallocated `buffer` and update the `pos` to `chunk.length` so the next `data` event starts from where we left off in the previous event. 

When all the data is received from the client the `end` event will be triggered. Our `end` event listener converts the buffer to a string, passing it into `qs.parse`. This converts the POST data (which is in the format `userinput1=firstVal&userinput2=secondVal`) into an object. This object is logged our to the console, and serialized with `JSON.stringify` as it's passed to `res.end` and thus mirrored back to the user.

We cannot trust the client to reliably represent the size of the content, as this could be manipulated by an attacker so we take several measures to validate the `Content-Size` HTTP header. HTTP headers will always be in string format, so we use `parseInt` to convert from string to number. If the `Content-Size` header sent wasn't a number `size` would be `NaN` - in that case we send a `400 Bad Request` response. 

> Web Frameworks ![](../../info.png)
> Node's core API provides a powerful set of primitives to build functionality as we see fit. Of course, this also means there's a lot of angles to think about. In Chapter 6 we'll be talking about Web Frameworks where the low-level considerations have been taken care of, allowing us to focus primarily on business logic.

If `size` is a number we pass it to `Buffer.allocUnsafe` which creates a buffer of the given size. The choice by Node core developers to put "unsafe" name is deliberately alarming. `Buffer.allocUnsafe` will create a buffer from deallocated (i.e. unlinked memory. That means any kind of data might appear in a buffer created with `allocUnsafe`, potentially including highly sensitive data like cryptographic private keys. This is fine as long as there isn't some way of leaking previously deallocated memory to the client. By using it we accept the burden of ensuring that a malicious request can't leak the data. This is why in the `end` event listener we check that `pos` is equal to `size`. If it isn't then the request is ending prematurely, and the old memory in our `buffer` hasn't been fully overwritten by the payload. Without the `size` check in the `end` event listener internal memory could leak to the client.

We could use `Buffer.alloc` instead, which zero-fills the memory (overwrites the memory with `00` bytes) before handing the buffer back but `Buffer.allocUnsafe` is faster.

The other check against `size` is in the `data` event listener, where we make sure the payload size doesn't exceed the provided `Content-Size`. This scenario could be a malicious attempt to overload the memory of our server, resulting in a Denial Of Service attack.

### There's More

#### Accepting JSON

REST architectures (among others) typically handle the `application/json` content type in preference to the `application/x-www-form-urlencoded` type. Generally this is due to the versatility of the JSON format as a multi-language transport syntax. 

Let's convert our form and server to working with JSON instead of URL-encoded data.

We're going to use a third party module for safely and efficiently parsing the JSON. To do this we'll have to initialize our folder with a `package.json` file and then install the module. 

Let's run the following on the command line

```sh
$ npm init -y
$ npm install --save fast-json-parse
```

In the `server.js` file we need to add the following to our required dependencies at the top of the file:

```js
const parse = require('fast-json-parse')
```

The first line of our `post` function should be changed to checking `Content-Type` for `application/json`, like so:

```js
function post (req, res) {
  if (req.headers['content-type'] !== 'application/json') {
    reject(415, 'Unsupported Media Type', res)
    return
  }
/* ... snip .. */
```

The final step in converting our `server.js` file is to adjust the `end` event listener like so:

```js
/* ... snip .. */
    .on('end', () => {
      if (pos !== size) {
        reject(400, 'Bad Request', res)
        return
      }
      const data = buffer.toString()
      const parsed = parse(data)
      if (parsed.err) {
        reject(400, 'Bad Request', res)
        return  
      }
      console.log('User Posted: ', parsed.value)
      res.end('{"data": ' + data + "}")
    })
/* ... snip .. */
```

Unfortunately HTML forms do not natively support POSTing in the JSON format, so we'll need to add a touch of JavaScript to `public/form.html`.

Let's add the following `script` tag to `form.html`, underneath the `<form>` element:

```html
<script>
  document.forms[0].addEventListener('submit', function (evt) {
    evt.preventDefault()
    var form = this
    var data = Object.keys(form).reduce(function (o, i) {
      if (form[i].name) o[form[i].name] = form[i].value
      return o
    }, {})
    form.innerHTML = ''
    var xhr = new XMLHttpRequest()
    xhr.open('POST', '/')
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify(data))
    xhr.addEventListener('load', function () {
      var res
      try { res = JSON.parse(this.response) } catch (e) {
        res = {error: 'Mangled Response'}
      }
      form.innerHTML = res.error 
        ? res.error 
        : 'You Posted: ' + JSON.stringify(res.data)
    })
  })
</script>
```

Our form and server should now largely behave in the same as the main recipe.Except our frontend is now a tiny Single Page App and JSON (the backbone of modern web architecture) is being used for communication between server and client.

### See Also

* TBD

## Handling File Uploads

We cannot process an uploaded file in the same way we process other POST data. When a file input is submitted in a form, the browser embeds the file(s) into a multipart message. 

Multipart was originally developed as an email format allowing multiple pieces of mixed content to be combined into one payload. If we attempted to receive the upload as a stream and write it to a file, we would have a file filled with multipart data instead of the file or files themselves. 

We need a multipart parser, the writing of which is more than a recipe can cover. So we'll be `multipart-read-stream` module which sits on top of the well-established `busboy` module to convert each piece of the multipart data into an independent stream, which we'll then pipe to disk.


### Getting Ready

Let's create a new folder called `uploading-a-file` and create an `uploads` directory inside that:

```sh
$ mkdir uploading-a-file
$ cd uploading-a-file
$ mkdir uploads
```

We'll also want to initialize a `package.json` file and install `multipart-read-stream` and `pump`.

On the command line, inside the `uploading-a-file` directory we run the following commands:

```sh
$ npm init -y
$ npm install --save multipart-read-stream pump
```

> Streams ![](../tip.png)
> For more about streams (and why `pump` is essential) see the previous chapter, **Chapter 3. Using Streams**

Finally we'll make some changes to our form.html from the last recipe:

```js
<form method=POST enctype="multipart/form-data">
  <input type="file" name="userfile1"><br>
  <input type="file" name="userfile2"><br>
  <input type="submit">
</form>
```

We've included an enctype attribute of multipart/form-data to signify to the browser that the form will contain upload data and we've replaced the text inputs with file inputs.


### How to do it

Let's see what happens when we use our modified form to upload a file to the server from the last recipe. 

Let's upload form.html itself as our file:

![](images/upload.png)

Our POST server simply logs the raw HTTP message body to the console, which in this case is multipart data. We had two file inputs on the form. Though we only uploaded one file, the second input is still included in the multipart request. Each file is separated by a predefined boundary that is set in a secondary attribute of the Content-Type HTTP headers. We'll need to use formidable to parse this data, extracting each file contained therein.
var http = require('http');
var formidable = require('formidable');
var form = require('fs').readFileSync('form.html');

http.createServer(function (request, response) {
  if (request.method === "POST") {
    var incoming = new formidable.IncomingForm();
    incoming.uploadDir = 'uploads';
    incoming.on('file', function (field, file) {
      if (!file.size) { return; }
      response.write(file.name + ' received\n');
    }).on('end', function () {
      response.end('All files received');
    });
    incoming.parse(request);
  }
  if (request.method === "GET") {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(form);
  }
}).listen(8080);
Our POST server has now become an upload server.


### How it works

### There's more

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

## Communicating with WebSockets

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