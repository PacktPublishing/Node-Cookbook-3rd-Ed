var express = require('express')
var router = express.Router()
var restify = require('restify')

router.get('/', function (req, res, next) {
  res.render('add', { first: 0, second: 0, result: 0 })
})

router.post('/calculate', function (req, res, next) {
  var addClient = restify.createJsonClient({url: 'http://' + process.env.ADDER_SERVICE_SERVICE_HOST + ':' + process.env.ADDER_SERVICE_SERVICE_PORT})

  addClient.get('/add/' + req.body.first + '/' + req.body.second, function (err, serviceReq, serviceRes, resultObj) {
    if (err) { console.log(err) }
    res.render('add', {first: req.body.first, second: req.body.second, result: resultObj.result})
  })
})

module.exports = router

