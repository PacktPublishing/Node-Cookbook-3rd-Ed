const mysql = require('mysql') 
const db = mysql.createConnection({ 
  user: 'root', 
  //password: 'pw-if-set',
  //debug: true 
})

db.query('CREATE DATABASE quotes')
db.query('USE quotes')

db.query(`
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

db.on('error',  (err) => {
  if (ignore.has(err.code)) return 
  throw err 
})

db.query(`
  INSERT INTO quotes.quotes (author, quote)
  VALUES ("Bjarne Stroustrup", "Proof by analogy is fraud.");
`)

db.end()