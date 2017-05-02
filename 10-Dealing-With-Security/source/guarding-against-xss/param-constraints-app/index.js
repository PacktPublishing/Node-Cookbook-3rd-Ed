'use strict'

const express = require('express')
const app = express()

function validate ({prev, handoverToken, lang}, query) {
  var valid = Object.keys(query).length <= 3
  valid = valid && typeof lang === 'string' && lang.length === 2
  valid = valid && typeof handoverToken === 'string' && handoverToken.length === 16
  valid = valid && typeof prev === 'string' && prev.length < 10
  return valid
}

app.get('/', (req, res) => {
  const {prev = '', handoverToken = '', lang = 'en'} = req.query

  if (!validate({prev, handoverToken, lang}, req.query)) {
    res.sendStatus(422)
    return
  }

  pretendDbQuery((err, status) => {
    if (err) {
      res.sendStatus(500)
      return
    }
    res.send(`
      <h1>Current Status</h1>
      <div id=stat>  
        ${status}
      </div>
      <div>
      <a href="${prev}${handoverToken}/${lang}"> Back to Control HQ </a>
      </div>
    `)
  })

})

function pretendDbQuery (cb) {
  const status = 'ON FIRE!!! HELP!!!'
  cb(null, status)
}


app.listen(3000)