const mysql = require('mysql')

const params = {
  author: process.argv[2], 
  quote: process.argv[3]
}

const connection = mysql.createConnection({ 
  user: 'root', 
  //password: 'pw-if-set',
  //debug: true 
})

connection.query('CREATE DATABASE quotes')
connection.query('USE quotes')

connection.query(`
  CREATE TABLE quotes.quotes ( 
    id INT NOT NULL AUTO_INCREMENT,  
    author VARCHAR ( 128 ) NOT NULL, 
    quote TEXT NOT NULL, PRIMARY KEY ( id ) 
  )
`)

const ignore = new Set([
  'ER_DB_CREATE_EXISTS',
  'ER_TABLE_EXISTS_ERROR'
])

connection.on('error',  (err) => {
  if (ignore.has(err.code)) return 
  throw err 
})

if (params.author && params.quote) {
  connection.query(`
    INSERT INTO quotes.quotes (author, quote)
    VALUES (?, ?);
  `, [params.author, params.quote])
}

if (params.author) {
  connection.query(`
    SELECT * FROM quotes 
    WHERE author LIKE ${connection.escape(params.author)}
  `).on('result', ({author, quote}) => {
    console.log(`${author} ${quote}`)
  })
}

connection.end()