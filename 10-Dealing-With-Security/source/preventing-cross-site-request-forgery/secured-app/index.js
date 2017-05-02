'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const he = require('he')
const csurf = require('csurf')
const app = express()
const csrf = csurf()

const pretendData = {
  dave: {
    ac: '12345678',
    sc: '88-26-26'
  }
}

app.use(session({
  secret: 'AI overlords are coming',
  name: 'SESSIONID',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: true
  }
}))

app.use(bodyParser.urlencoded({extended: false}))

app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/profile')
  res.send(`
    <h1> Login </h1>
    <form method="POST" action="/">
      <label> user <input name=user> </label> <br>
      <label> pass <input name=pass type=password> </label> <br>
      <input type=submit>
    </form>
  `)
})

app.post('/', (req, res) => {
  if (req.body.user === 'dave' && req.body.pass === 'ncb') {
    req.session.user = req.body.user
  }
  if (req.session.user) res.redirect('/profile')
  else res.redirect('/')
})

app.get('/profile', csrf, (req, res) => {
  if (!req.session.user) return res.redirect('/')
  const {prev = '', handoverToken = '', lang = 'en'} = req.query
  pretendDbQuery(req.session.user, (err, {sc, ac}) => {
    if (err) {
      res.sendStatus(500)
      return
    }
    sc = he.encode(sc)
    ac = he.encode(ac)
    res.send(`
      <h1>Employee Payment Profile</h1>
      <form method="POST" action=/update>
        <input type=hidden name=_csrf value="${req.csrfToken()}">
        <label> Sort Code <input name=sc value="${sc}"> </label> <br>
        <label> Account # <input name=ac value="${ac}"> </label> <br>
        <input type=submit>
      </form>
    `)
  })
})

app.post('/update', csrf, (req, res) => {
  if (!req.session.user) return res.sendStatus(403)
  pretendData[req.session.user].ac = req.body.ac
  pretendData[req.session.user].sc = req.body.sc
  res.send(`
    <h1> updated </h1>
    <meta http-equiv="refresh" content="1; url=/profile">
  `)
})

function pretendDbQuery (user, cb) {
  cb(null, pretendData[user])
}

app.listen(3000)
