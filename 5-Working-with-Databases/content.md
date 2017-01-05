# 5 Working with Databases

This chapter covers the following topics

* Connecting and sending SQL to a MySQL server
* Populating and querying a Postgres database
* Storing and retrieving data with MongoDB
* Storing data and retrieving data with CouchDB
* Storing and retrieving data with Redis
* Implementing PubSub with Redis
* Persisting with LevelDB
* Recording to the InfluxDB time series database

## Introduction

In many cases, relational databases became a de facto standard for nearly
all data scenarios. This led to the necessity of imposing relationships on
otherwise loosely-related data (such as website content) in an attempt to
squeeze it into our relational mental model. 

In recent times, though, there has been a movement away from relational databases
towards NoSQL, a non-relational paradigm; the driving force being the fact that
we tailor our technology to best suit our data, rather than trying to fit 
our data according to our technology. 

In this chapter, we will look at various data storage technologies 
with examples of their usage in Node. 

 
## Connecting and sending SQL to a MySQL server
Structured Query Language has been a standard since 1986, 
and it's the prevailing language for relational databases. 
MySQL is the most popular SQL relational database server around,
often appearing in the prevalent Linux Apache MySQL PHP (LAMP) stack. 

If a relational database was conceptually relevant to our goals in
a new project, or we were migrating a MySQL-backed project from another
framework to Node, the `mysql` module would be particularly useful. 

In this task, we will discover how to connect to a MySQL server
with Node and execute SQL queries across the wire. 

### Getting Ready

We'll need a MySQL server to connect to. 
By default, the `mysql` client module connects 
to localhost, so we'll have MySQL running locally 

On Linux we can see if MySQL is already installed 
with the following command: 

```sh
$ whereis mysql
```

On macOS we can use 

```sh
$ type -a mysql
```

On Windows we can use the GUI and check the package manger via the control panel. 

We can see if the mysql server is running using the following command: 

```sh
$ mysqladmin -u root ping
``` 

If it is installed but not running, we can use the following command: 

```sh
$ sudo service mysql start
``` 

If MySQL isn't installed, we can use the relevant package manager 
for our system (homebrew, apt-get/synaptic, yum, and so on) and 
follow instructions to start the server. 

If we're using Node on Windows, we can head to 
http://dev.mysql.com/downloads/mysql and download the installer. 

Once we have MySQL up and running, let's create a folder called `mysql-app` 
with an `index.js` file.

Then, we'll initialize the folder with a `package.json` file and 
grab the `mysql` driver module, which is a pure JavaScript module
(as opposed to a C++ binding to the MySQL C driver). 

```sh
$ npm init -y
$ npm install --save mysql
``` 

### How to do it

In `mysql-app/index.js` let's require the `mysql` module and 
open a connection to our locally running MySQL instance:

```js
const mysql = require('mysql') 
const db = mysql.createConnection({ 
  user: 'root', 
  //password: 'pw-if-set',
  //debug: true
})
```

We need a database to connect to. Let's keep things interesting and make a quotes 
database. We can do that by passing SQL to the query method as follows: 

```js
db.query('CREATE DATABASE quotes')
db.query('USE quotes')
```

Now, we'll create a table with the same name: 

```js
db.query(
  'CREATE TABLE quotes.quotes (' + 
  'id INT NOT NULL AUTO_INCREMENT, ' + 
  'author VARCHAR( 128 ) NOT NULL, ' + 
  'quote TEXT NOT NULL, PRIMARY KEY ( id )' + 
  ')'
)
```  

If we were to run our code in it's current state more than once,
we would notice that the program fails with an unhandled exception. 

The MySQL server is sending an error to our process, which is then 
throwing that error. The source of the error is down to the `quotes`
database already existing on the second run.

We want our code to be versatile enough to create a database if necessary, 
but not to throw an error if it's not there. 

We can prevent the process from crashing by listening for an `error` 
event on the `db`. We'll attach a handler that will throw 
any errors that don't relate to pre-existing tables:

```js
const ignore = new Set([
  'ER_DB_CREATE_EXISTS',
  'ER_TABLE_EXISTS_ERROR'
])

db.on('error',  (err) => {
  if (ignore.has(err.code)) return 
  throw err 
})
``` 

Finally, we'll insert our first quote into the table and send a `COM_QUIT` packet 
(using `db.end`) to the MySQL server. 

This will only close the connection once all the queued SQL code has been executed.

```js
db.query(`
  INSERT INTO quotes.quotes (author, quote)
  VALUES ("Bjarne Stroustrup", "Proof by analogy is fraud.");
`)

db.end()
```

We can verify our program by running it:

```sh
$ node index.js
```

Then in another terminal executing the following:

```sh
$ mysql -u root -D quotes -e "select * from quotes;"
```

If we run our program more than once, the quote will be added several times. 
 
### How it works

The `createConnection` method establishes a connection to the server and 
returns a `db` instance for us to interact with. 

We can pass in an options object that may contain an assortment of
various properties. We have included `password` and `debug` properties, 
though commented out as they're not needed in the common case.  

If we uncomment `debug`, we can see the raw data being sent to and from 
the server. We only need uncomment `password` if our MySQL server has a 
password set.

> The `mysql` module API ![](../info.png)
> Check out the `mysql` module's GitHub page for a list of all the possible 
options at https://github.com/felixge/node-mysql.


The `db.query` call sends SQL to the MySQL server,
which is then executed. 

When executed, the SQL creates a database named "quotes" 
(using `CREATE` and `DATABASE`) and a `TABLE` also named quotes. 

We then insert our first record (using `INSERT`) into our database.

When used without a callback, the `db.query` method queues 
each piece of SQL passed to it, executing 
statements asynchronously (preventing any blocking of event loop), 
but sequentially within the SQL statement queue. 

When we call `db.end`, the connection closing task is added to 
the end of the queue. 

If we wanted to disregard the statement queue and immediately close the 
connection, we could use `db.destroy`.

Our `ignore` set holds MySQL error codes `ER_DB_CREATE_EXISTS` and
`ER_TABLE_EXISTS_ERROR`. We check the `ignore` set using the `has`
method when the `error` event fires on the `db` object. 
If there's a match we simply return early from the `error` event
handler, otherwise we `throw` the error. 

### There's more

SQL queries are often generated from user input, but this can be
open to exploitation if precautions aren't taken. Let's look at 
cleaning user input, and also find out how to retrieve data from 
a MySQL database. 

#### Avoiding SQL Injection

As with the other languages that build SQL statements with string
concatenation, we must prevent the possibilities of SQL injection
attacks to keep our server safe. Essentially, we must 
clean (that is, escape) any user input to eradicate the potential
for unwanted SQL manipulation. 

Let's copy the `mysql-app` folder and name insert-quotes`. 

To implement the concept of user input in a simple way, we'll pull
the arguments from the command line, but the principles and 
methods of data cleaning extend to any input method (for example,
via a query string on request).

Our basic CLI API will look like this: 

```sh
$ node index.js "Author Name" "Quote Text Here" 
```

Quotation marks are essential to divide the command-line arguments, 
but for the sake of brevity, we won't be implementing any validation checks. 

> Command-line parsing with minimist ![](../tip.png) 
> For more advanced command-line functionality, check out the excellent 
`minimist` module, http://npm.im/minimist

To receive an author and quote, we'll load the two command line arguments 
into a new `params` object:

```js
const params = {
  author: process.argv[2], 
  quote: process.argv[3]
} 
```

Our first argument is at index 2 in the `process.argv` array because
`process.argv` includes all command line arguments (the name of the
binary (node) and the path being executed).

Now, let's slightly modify our `INSERT` statement passed to `db.query`: 

```js
if (params.author && params.quote) {
  db.query(`
    INSERT INTO quotes.quotes (author, quote)
    VALUES (?, ?);
  `, [params.author, params.quote])
}
```

The `mysql` module can seamlessly clean user input for us. 
We simply use the question mark (?) as a placeholder and then pass 
our values (in order) as an array to the second parameter 
of `db.query`.

Let's try it out:

```sh
$ node index.js "John von Neumann" "Computers are like humans - they do everything except think."
$ mysql -u root -D quotes -e "select * from quotes;"
```

This should give something like the following figure: 

![](images/mysql-insert-quotes.png)
*Inserting a record to MySQL via Node*

#### Querying a MySQL Databases

Let's copy the `insert-quotes` folder from the previous section,
and save it as `quotes-app`.

We'll extend our app further by outputting all the quotes for an author, 
irrespective of whether a quote is provided.

Let's add the following code just above the final `db.end` call:

```js
if (params.author) {

  db.query(`
    SELECT * FROM quotes 
    WHERE author LIKE ${db.escape(params.author)}
  `).on('result', ({author, quote}) => {
    console.log(`${author} ${quote}`)
  })
   
}
```

On this occasion, we've used an alternative approach to clean user input
with `db.escape`. This has exactly the same effect as the former,
but only escapes a single input. Generally, if there's more than one variable,
the former method would be preferred. 

The results of a `SELECT` statement can be accessed either by passing a 
callback function or by listening for the `result` event.

We can safely call `db.end` without placing it in the end event 
of our SELECT query because `db.end` only terminates the connection 
when all the queries are done.

We can test our addition like so: 

```sh
$ node index.js "Bjarne Stroustrup"
```

We can use the SQL wildcard (`%`) to get all quotes:

```sh
$ node index.js "%"
```

### See also

* TBD

## Storing and Retrieving Data with MongoDB

MongoDB is a NoSQL database offering that maintains a philosophy
of performance over features. It's designed for speed and scalability.
Instead of working relationally, it implements 

a document-based model that has no need for schemas (column definitions).
The document model works well for scenarios where the relationships between 
data are flexible and where minimal potential data loss is an acceptable
cost for speed enhancements (a blog, for instance). 

While it is in the NoSQL family, MongoDB attempts to sit between two worlds,
providing a syntax reminiscent of SQL but operating non-relationally. 

In this task, we'll implement the same quotes database as in the previous
recipe, using MongoDB instead of MySQL.

### Getting Ready

We want to run a MongoDB server locally. 
It can be downloaded from http://www.mongodb.org/download-center
(we may also be able to install it with our OS's package manager).  


Once installed, let's start the MongoDB service, `mongod`, 
in the default debug mode: 

```sh
$ mkdir ./data
$ mongod --dbpath ./data
```

Where `./data` is a folder that holds the database files.

This allows us to observe the activities of `mongod` as it 
interacts with our code.

> Managing the MongoDB Service ![](../info.png)
> More information on starting and correctly stopping MongoDB can 
> be found at https://docs.mongodb.com/manual/tutorial/manage-mongodb-processes/. 

Now (in a new terminal) let's create a new folder called `mongo-app`
with an `index.js` file. 

To interact with MongoDB from Node, we'll need to install 
the `mongodb` native binding's driver module (in `mongo-app`): 

```sh
$ npm init -y 
$ npm install --save mongodb
```

### How to do it

Let's `require` the `mongodb` driver, and create an instance of 
the `MongoClient` constructor supplied via the `mongodb` object:

```js
const {MongoClient} = require('mongodb')
const client = new MongoClient()
```

We used object desructuring to pull the `MongoClient` constructor 
from the `mongodb` exported object.

To receive an author and quote, we'll load the two command line arguments 
into a new `params` object:

```js
const params = {
  author: process.argv[2], 
  quote: process.argv[3]
} 
```

Now, we connect to our quotes database and load (or create, if necessary)
our quotes collection (a table would be the closest similar concept in SQL):

```js
client.connect('mongodb://localhost:27017/quotes', ready)

function ready (err, db) {
  if (err) throw err
  const collection = db.collection('quotes')
  db.close()
}
```

Port 27017 is the default port assigned to a `mongod` 
service. This can be modified when we start a `mongod` 
by passing a `--port` flag.

Now let's expand our `ready` function to insert a new document
(in SQL terms, this would be a record) when the user supplies both
an author and quote:

```js
function ready (err, db) {
  if (err) throw err
  const collection = db.collection('quotes')
  if (params.author && params.quote) { 
    collection.insert({ 
      author: params.author, 
      quote: params.quote
    }, (err) => {
      if (err) throw err
    })
  }

  db.close()
}
```

Finally we'll expand `ready` one more time, so that it outputs
a list of quotes according to supplied author. Our final `ready`
function should look like so:

```js
function ready (err, db) {
  if (err) throw err
  const collection = db.collection('quotes')

  if (params.author && params.quote) { 
    collection.insert({ 
      author: params.author, 
      quote: params.quote
    }, (err) => {
      if (err) throw err
    })
  }

  if (params.author) { 
    collection.find({ 
      author: params.author 
    }).each((err, doc) => { 
      if (err) throw err
      if (!doc) {
        db.close()
        return
      }
      console.log('%s: %s \n', doc.author, doc.quote)  
    })
    return
  }

  db.close()
}
```

Now we can run our app:

```js
$ node index.js "Woody Allen" "I'd call him a sadistic hippophilic necrophile, but that would be beating a dead horse"
```

This will immediately output our entered quote (and any other quotes by 
Woody Allen if they we're previously entered). 

### How it works

When we call `client.connect`, we pass in a URI with the `mongodb://` protocol as
the first parameter. The `mongodb` module will parse this string and 
attempt to connect to the specified `quotes` database. MongoDB will 
intelligently create this database if it doesn't exist,
so unlike MySQL, we don't have to plaster over awkward errors. 

Once the connection is made, our `ready` callback function is executed 
where we can interact with the database via the `db` parameter. 

We start off by grabbing our `quotes` collection using `db.collection`. 
A collection is similar to an SQL table which holds all our database fields. 
However, rather than the field values being grouped by columns, a collection
contains multiple documents (such as records) where each field holds both the
field name and its value (the documents are very much like JavaScript objects). 

If both quote and author have been passed as arguments, we invoke the 
`collection.insert` method, passing in an object as our document. 

Finally, we use `collection.find`, which is comparable to the `SELECT` SQL command, 
passing in an object that specifies the author field and its desired value. 
The `mongodb` driver module provides a convenience method (`each`) that can be
called on the result of the  `collection.find` method. The `each` method executes
the iterator function passed to it for each document as and when it's found. 
The `doc` parameter is set to `null` for the last call of the iterator function, 
signalling that MongoDB has returned all the records. 

So we check if `doc` is falsy (it should always be an object or `null` but
just in case, checking for `!doc` means we cover `false` and `undefined` as well),
and then call `db.close` returning early from the function. If `doc` isn't falsy
we proceed to log out the author and quote.

The second and final `db.close` call situated at the end of the `ready`
function is invoked only when there are no arguments defined via the command line.

### There's more

Let's check out some other useful MongoDB features.

#### Indexing and Aggregation

Indexing causes MongoDB to create a list of values from a chosen field. Indexed
fields accelerate query speeds because a smaller set of data can be used to
cross-reference and pull from a larger set. 
We can apply an index to the author field and see performance benefits, 
especially as our data grows. Additionally, MongoDB has various commands that
allow us to aggregate our data. We can group, count, and return distinct values. 

Let's create and output a list of authors found in our database.

We'll create a file in same `mongo-app` folder, called `author.js`.

```js
const {MongoClient} = require('mongodb')
const client = new MongoClient()

client.connect('mongodb://localhost:27018/quotes', ready)

function ready (err, db) { 
  if (err) throw err 
  const collection = db.collection('quotes') 
  collection.ensureIndex('author', (err) => { 
    if (err) throw err
    collection.distinct('author', (err, result) => {
      if (err) throw err
      console.log(result.join('\n')); 
      db.close()
    })
  })
}
```

As usual, we opened up a connection to our quotes database, grabbing our quotes 
collection. Using `collection.ensureIndex` creates an index only if one
doesn't already exist.

Inside the callback, we invoke the `collection.distinct` method, 
passing in `author`. The result parameter in our callback function is an 
array which we join (using the `join` method) to a newline delimited string 
and output the result to the terminal.

#### Updating modifiers, `sort` and `limit`

We can make it possible for a hypothetical user to indicate if they were
inspired by a quote and then use the `sort` and `limit` commands to output the
top ten most inspiring quotes. 

In reality, this would be implemented with some kind of user interface (for
example, in a browser), but we'll again emulate user interactions using 
the command line;

Let's create a new file named `votes.js`. 

First, in order to vote for a quote, we'll need to reference it. This can be
achieved with the unique `_id` property. 

Let's write the following code:

```js
const {MongoClient, ObjectID} = require('mongodb')
const client = new MongoClient() 
const params = {id: process.argv[2]} 

client.connect('mongodb://localhost:27017/quotes', ready)

function ready (err, db) { 
  if (err) throw err 
  const collection = db.collection('quotes')

  if (!params.id) {
    showIds(collection, db)
    return
  }
  
  vote(params.id, db, collection)
}
```

If an argument is supplied it's loaded into `params.id`, if `params.id`
is empty, then we'll print out the ID of each quote in our collection.

Our `ready` function calls a `showIds` function to achieve this, let's 
write the `showIds` function:

```js
function showIds (collection, db) {
  collection.find().each((err, doc) => {
    if (err) throw err
    if (doc) {
      console.log(doc._id, doc.quote)
      return
    }
    db.close()
  })
}
```

Now let's do our vote handling by creating our `vote` function like so:

```js
function vote (id, db, collection) {
  const query = {
    _id  : ObjectID(id)
  }
  const action = {$inc: {votes: 1}}
  const opts = {safe: true}
  collection.update(query, action, opts, (err) => {
    if (err) throw err
    console.log('1 vote added to %s by %s', params.id)
    const by = {votes: 1}
    const max = 10  
    collection.find().sort(by).limit(max).each((err, doc) => { 
        if (err) throw err
        if (doc) {
          const votes = doc.votes || 0 
          console.log(`${votes} | ${doc.author}: ${doc.quote.substr(0, 30)}...`) 
          return
        } 
        db.close() 
      }) 
  })
  return  
}
```

To use we first run `votes.js` without any arguments:

```sh
$ node votes.js
```

This will output a list of MongoDB ID's along side the quote. 
We can pick one of the ID's and run our `votes.js` script again, 
but this time passing the ID:

```sh
$ node votes.js 586eacd7f959a401fa63acc2
```

This will then output the amount of votes (including the recent vote), 
each quote has received.

MongoDB IDs must be encoded as a Binary JSON (BSON) ObjectID. Otherwise, the
update command will look for a string, failing to find it. 
So, we convert `id` into an ObjectID using the `mongodb` `ObjectID` 
function (which we destructure from the `mongodb` module on the first line of `votes.js`). 

The `$inc` property is a MongoDB modifier that performs the incrementing action
inside the MongoDB server, essentially allowing us to outsource the calculation. 
To use it, we pass a document (object) alongside it containing the key to 
increment and the amount to increase it by. So our `action` object essentially
instructs MongoDB to increase the `votes` key by one.

The `$inc` modifier will create the `votes` field if it doesn't exist and increment
it by one (we can also decrement using minus figures).  

Our `opts` object has a `safe` property set to true, this ensures that
the callback isn't fired until MongoDB has absolutely confirmed the 
update was written (although it will make operations slower).

### See also 

* TBD


