'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.post('/echo', (req, res) => {
  res.send(req.body)
})

app.listen(3000)
