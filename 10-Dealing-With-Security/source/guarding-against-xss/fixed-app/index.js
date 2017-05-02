'use strict'

const express = require('express')
const he = require('he')
const app = express()


app.get('/', (req, res) => {
  const {prev = '', handoverToken = '', lang = 'en'} = req.query
  pretendDbQuery((err, status) => {
    if (err) {
      res.sendStatus(500)
      return
    }
    const href = he.encode(`${prev}${handoverToken}/${lang}`)
    res.send(`
      <h1>Current Status</h1>
      <div id=stat>  
        ${he.escape(status)}
      </div>
      <br>
      <a href="${href}"> Back to Control HQ </a>
    `)
  })

})

function pretendDbQuery (cb) {
  const status = 'ON FIRE!!! HELP!!!'
  cb(null, status)
}


app.listen(3000)