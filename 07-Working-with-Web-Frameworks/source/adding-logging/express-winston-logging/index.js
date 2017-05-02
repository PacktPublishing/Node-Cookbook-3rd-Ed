'use strict'

const express = require('express')
const {join} = require('path')
const winston = require('winston')
const expressWinston = require('express-winston')
const index = require('./routes/index')
const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      json: true
    })
  ]
})

const app = express()
const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000

app.set('views', join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(expressWinston.logger({
  winstonInstance: logger
}))

if (dev) {
  app.use(express.static(join(__dirname, 'public')))
}

app.use('/', index)

app.listen(port, () => {
  logger.info(`Server listening on port ${port}`)
})