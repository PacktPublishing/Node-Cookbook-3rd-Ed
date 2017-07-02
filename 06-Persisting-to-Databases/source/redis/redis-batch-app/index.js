const uuid = require('uuid')
const steed = require('steed')()
const redis = require('redis') 
const client = redis.createClient(), 
const params = {
  author: process.argv[2],
  quote: process.argv[3]
}

if (params.author && params.quote) {
  add(params, (err) => {
    if (err) throw err
    list((err) => {
      if (err) console.error(err)
      client.quit()
    })
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


function add ({author, quote}, cb) {
  const key = `Quotes: ${uuid()}`
  client
    .multi()
    .hmset(key, {author, quote})
    .sadd(`Author: ${params.author}`, key)
    .exec((err, replies) => {
      if (err) return cb(err)
      if (replies[0] === "OK") console.log('Added...\n')
      cb()
    })   
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