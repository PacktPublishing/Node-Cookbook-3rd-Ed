const util = require('util')
const express = require('express')
const debug = require('debug')('my-app')
const app = express()

app.get('/', (req, res) => {
  debug('incoming request on /', req.route)
  res.send('hey')
})

app.listen(3000)
