'use strict'

const express = require('express')
const app = express()

app.get('/', (req, res) => {
  pretendDbQuery(() => {
    const yelling = (req.query.msg || '').toUpperCase()
    res.send(yelling)
  })
})

app.listen(3000)

function pretendDbQuery (cb) {
  setTimeout(cb, 0)
}
