'use strict'

const {Router} = require('express')
const router = Router()

router.get('/', function(req, res, next) {
  const title = 'Express'
  res.render('index', {title: 'Express'})
  next()
})

module.exports = router
