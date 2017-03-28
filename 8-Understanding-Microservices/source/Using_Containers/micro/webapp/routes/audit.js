var express = require('express')
var router = express.Router()
var restify = require('restify')

router.get('/', function (req, res, next) {
  var client = restify.createJsonClient({url: 'http://' + process.env.AUDIT_SERVICE_SERVICE_HOST + ':' + process.env.AUDIT_SERVICE_SERVICE_PORT})
  client.get('/list', function (err, serviceReq, serviceRes, obj) {
    if (err) { console.log(err) }
    res.render('audit', obj)
  })
})

module.exports = router

