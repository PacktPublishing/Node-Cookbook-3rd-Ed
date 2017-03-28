var express = require('express')
var router = express.Router()
var restify = require('restify')


router.get('/', function (req, res, next) {
  res.render('add', { first: 0, second: 0, result: 0 })
})


router.post('/calculate', function (req, res, next) {
  var client = restify.createClient({url: 'http://localhost:8080'})
  client.get('/add/' + req.body.first + '/' + req.body.second, function (err, serviceReq) {
    if (err) { console.log(err) }

    serviceReq.on('result', function (err, serviceRes) {
      if (err) { console.log(err) }
      serviceRes.body = ''
      serviceRes.setEncoding('utf8')
      serviceRes.on('data', function (chunk) {
        serviceRes.body += chunk
      })
      serviceRes.on('end', function () {
        res.render('add', { first: req.body.first, second: req.body.second, result: serviceRes.body })
      })
    })
  })
})

module.exports = router
