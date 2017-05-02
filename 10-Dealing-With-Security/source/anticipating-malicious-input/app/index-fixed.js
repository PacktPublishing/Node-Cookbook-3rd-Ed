'use strict'

const express = require('express')
const app = express()

app.get('/', (req, res) => {
  pretendDbQuery(() => {
    var msg = req.query.msg

    if (Array.isArray(msg)) msg = msg.pop()

    const yelling = (msg || '').toUpperCase()
    res.send(yelling)
  })
})

app.listen(3000)

function pretendDbQuery (cb) {
  setTimeout(cb, 0)
}
