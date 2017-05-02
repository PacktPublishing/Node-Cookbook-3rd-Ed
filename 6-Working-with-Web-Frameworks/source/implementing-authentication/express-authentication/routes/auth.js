'use strict'

const { Router } = require('express')
const router = Router()

router.get('/login', function (req, res, next) {
  res.render('login', {fail: false})
  next()
})

router.post('/login', function (req, res, next) {
  if (req.session.user) {
    res.redirect('/')
    next()
    return
  }
  if (req.body.un === 'dave' && req.body.pw === 'ncb') {
    req.session.user = {name: req.body.un}
    res.redirect('/')
    next()
    return
  }

  res.render('login', {fail: true})

  next()
})

router.get('/logout', function (req, res, next) {
  req.session.user = null
  res.redirect('/')
})

module.exports = router
