'use strict'

const {Router} = require('express')
const router = Router()
const views = {
  index: require('../views/index')
}

router.get('/', function(req, res, next()) {
  const title = 'Express'
  res.send(views.index({title}))
  next()
})

module.exports = router
