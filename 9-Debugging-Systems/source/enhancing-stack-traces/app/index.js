const express = require('express')
const routes = require('./routes')
const app = express()

app.use(routes)

app.listen(3000)
