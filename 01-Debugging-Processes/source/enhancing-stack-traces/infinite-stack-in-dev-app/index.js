if (process.env.NODE_ENV !== 'production') {
  Error.stackTraceLimit = Infinity
}
const express = require('express')
const routes = require('./routes')
const app = express()

app.use(routes)

app.listen(3000)
