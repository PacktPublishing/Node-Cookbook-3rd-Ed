const util = require('util')
const express = require('express')
const debug = util.debuglog('my-app')
const app = express()

app.get('/', (req, res) => {
  debug('incoming request on /', req.route)
  res.send('hey')
})

setTimeout(function myTimeout() { 
   debug('timeout complete')
   console.log('I waited for you.')
}, 100)

app.listen(3000)
