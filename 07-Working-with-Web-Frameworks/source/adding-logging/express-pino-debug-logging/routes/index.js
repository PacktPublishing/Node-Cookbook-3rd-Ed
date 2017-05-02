'use strict'

const {Router} = require('express')
const router = Router()

router.get('/', function (req, res) {
  const title = 'Express'
  req.log.info(`rendering index view with ${title}`)
  res.render('index', {title: 'Express'})
})

module.exports = router
