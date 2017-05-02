'use strict'

const express = require('express')
const escapeHtml = require('escape-html')
const app = express()


app.get('/', (req, res) => {
  const {prev = '', handoverToken = '', lang = 'en'} = req.query
  pretendDbQuery((err, status) => {
    if (err) {
      res.sendStatus(500)
      return
    }
    const href = escapeHtml(`/${prev}${handoverToken}/${lang}`)
    res.send(`
      <h1>Current Status</h1>
      <div id=stat>  
        ${escapeHtml(status)}
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