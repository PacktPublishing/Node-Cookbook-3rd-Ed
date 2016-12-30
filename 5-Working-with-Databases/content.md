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
const connection = mysql.createConnection({ 
  user: 'root', 
  //password: 'pw-if-set',
  //debug: true
})
```

We need a database to connect to. Let's keep things interesting and make a quotes 
database. We can do that by passing SQL to the query method as follows: 

```js
connection.query('CREATE DATABASE quotes')
connection.query('USE quotes')
```

Now, we'll create a table with the same name: 

```js
connection.query(
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
event on the `connnection`. We'll attach a handler that will throw 
any errors that don't relate to pre-existing tables:

```js
const ignore = new Set([
  'ER_DB_CREATE_EXISTS',
  'ER_TABLE_EXISTS_ERROR'
])

connection.on('error',  (err) => {
  if (ignore.has(err.code)) return 
  throw err 
})
``` 

Finally, we'll insert our first quote into the table and send a `COM_QUIT` packet 
(using `connection.end`) to the MySQL server. 

This will only close the connection once all the queued SQL code has been executed.

```js
connection.query('INSERT INTO quotes.quotes (' + 
'author, quote) ' + 
'VALUES ("Bjarne Stroustrup", "Proof by analogy is fraud.");')

connection.end()
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
The `createConnection` method establishes a connection to the server and returns a 
`connection` instance for us to interact with. 

We can pass in an options object that may contain an assortment of
various properties. We have included `password` and `debug` properties, 
though commented out as they're not needed in the common case.  

If we uncomment `debug`, we can see the raw data being sent to and from 
the server. We only need uncomment `password` if our MySQL server has a 
password set.

> The `mysql` module API ![](../info.png)
> Check out the `mysql` module's GitHub page for a list of all the possible 
options at https://github.com/felixge/node-mysql.


The `connection.query` call sends SQL to the MySQL server,
which is then executed. 

When exeuted, the SQL creates a database named "quotes" 
(using `CREATE` and `DATABASE`) and a `TABLE` also named quotes. 

We then insert our first record (using `INSERT`) into our database.

When used without a callback, the `connection.query` method queues 
each piece of SQL passed to it, executing 
statements asynchronously (preventing any blocking of event loop), 
but sequentially within the SQL statement queue. 

When we call `connection.end`, the connection closing task is added to 
the end of the queue. 

If we wanted to disregard the statement queue and immediately end the 
connection, we could use `connection.destroy`.

Our `ignore` set holds MySQL error codes `ER_DB_CREATE_EXISTS` and
`ER_TABLE_EXISTS_ERROR`. We check the `ignore` set using the `has`
method when the `error` event fires on the `connection` object. 
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

Let's copy the `mysql-app` folder and name it `mysql-insert-quotes`. 

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

Now, let's slightly modify our `INSERT` statement passed to `connection.query`: 

```js
if (params.author && params.quote) {
  connection.query(`
    INSERT INTO quotes.quotes (author, quote)
    VALUES (?, ?);
  `, [params.author, params.quote])
}
```

The `mysql` module can seamlessly clean user input for us. 
We simply use the question mark (?) as a placeholder and then pass 
our values (in order) as an array to the second parameter 
of `connection.query`.

Let's try it out:

```sh
$ node index.js "John von Neumann" "Computers are like humans - they do everything except think."
$ mysql -u root -D quotes -e "select * from quotes;"
```

This should give something like the following figure: 

![](images/mysql-insert-quotes.png)
*Inserting a record to MySQL via Node*

#### Querying a MySQL Databases

Let's copy the `mysql-insert-quotes` folder from the previous section,
and save it as `mysql-quotes-app`.

We'll extend our app further by outputting all the quotes for an author, 
irrespective of whether a quote is provided.

Let's add the following code just above the final `connection.end` call:

```js
if (params.author) {

  connection.query(`
    SELECT * FROM quotes 
    WHERE author LIKE ${connection.escape(params.author)}
  `).on('result', ({author, quote}) => {
    console.log(`${author} ${quote}`)
  })
   
}
```

On this occasion, we've used an alternative approach to clean user input
with connection. escape. This has exactly the same effect as the former,
but only escapes a single input. Generally, if there's more than one variable,
the former method would be preferred. 

The results of a `SELECT` statement can be accessed either by passing a 
callback function or by listening for the `result` event.

We can safely call `connection.end` without placing it in the end event 
of our SELECT query because `connection.end` only terminates a connection 
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



