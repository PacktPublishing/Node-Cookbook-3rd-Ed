const express = require('express')
const app = express()
const stylus = require('stylus')
const debug = require('debug')('my-app')

app.get('/some.css', (req, res) => {
  debug('css requested')
  const css = stylus(`
    body
      color:black
  `).render()
  res.send(css)
})

app.listen(3000)
