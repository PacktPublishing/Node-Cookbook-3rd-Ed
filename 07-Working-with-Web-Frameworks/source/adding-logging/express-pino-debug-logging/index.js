'use strict'

const {join} = require('path')
const express = require('express')
const pino = require('pino')()
const logger = require('express-pino-logger')({
  instance: pino
})
const index = require('./routes/index')

const app = express()
const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000

app.set('views', join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger)

if (dev) {
  app.use(express.static(join(__dirname, 'public')))
}

app.use('/', index)

app.listen(port, () => {
  pino.info(`Server listening on port ${port}`)
})