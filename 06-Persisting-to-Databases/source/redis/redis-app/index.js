const uuid = require('uuid')
const steed = require('steed')()
const redis = require('redis')
const client = redis.createClient() 
const params = {
  author: process.argv[2],
  quote: process.argv[3]
}

if (params.author && params.quote) {
  add(params)
  list((err) => {
    if (err) console.error(err)
    client.quit()
  })
  return
}

if (params.author) { 
  list((err) => {
    if (err) console.error(err)
    client.quit()
  })
  return
}

client.quit()

function add ({author, quote}) {
  const key = `Quotes: ${uuid()}`
  client.hmset(key, {author, quote})
  client.sadd(`Author: ${params.author}`, key)
}

function list (cb) {
  client.smembers(`Author: ${params.author}`, (err, keys) => {
    if (err) return cb(err)
    steed.each(keys, (key, next) => {
      client.hgetall(key, (err, {author, quote}) => {
        if (err) return next(err)
        console.log(`${author} ${quote} \n`)
        next()
      })
    }, cb)
  })
}