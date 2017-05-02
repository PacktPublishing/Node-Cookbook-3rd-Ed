const {hash} = require('xxhash')
const through = require('through2')
const eos = require('end-of-stream')
const level = require('level')

const db = level('./data')

const params = {
  author: process.argv[2],
  quote: process.argv[3]
}

if (params.author && params.quote) {
  add(params, (err) => {
    if (err) console.error(err)    
    list(params.author)
  })
  return
}

if (params.author) { 
  list(params.author)
  return
}

function add({quote, author}, cb) {
  const key = author + hash(Buffer.from(quote), 0xDAF1DC)
  db.put(key, quote, cb) 
}

function list (author) {
  if (!author) db.close()
  const quotes = db.createValueStream({
    gte: author,
    lt: String.fromCharCode(author.charCodeAt(0) + 1)
  })
  const format = through((quote, enc, cb) => {
    cb(null, `${author} ${quote}`)
  })
  quotes.pipe(format).pipe(process.stdout)
  eos(format, () => {
    db.close()
    console.log()
  })
}