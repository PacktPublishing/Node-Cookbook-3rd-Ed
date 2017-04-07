var express = require('express')
var router = express.Router()
var helper = require('../helper')()

router.get('/', function (req, res, next) {
  helper.createClient('auditservice', function (err, client) {
    if (err) { console.log(err) }

    client.get('/list', function (err, serviceReq, serviceRes, obj) {
      if (err) { console.log(err) }
      res.render('audit', obj)
    })
  })
})

module.exports = router

