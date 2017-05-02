'use strict'

const {Router} = require('express')
const router = Router()

router.get('/', function (req, res) {
  const title = 'Express' 
  req.log.info(`rendering index view with ${title}`)
  const user = req.session.user
  res.render('index', {title, user})
})

module.exports = router
