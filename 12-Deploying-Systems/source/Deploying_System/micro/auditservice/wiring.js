var restify = require('restify')

module.exports = function (service) {
  var server = restify.createServer()

  server.use(restify.bodyParser())

  server.post('/append', function (req, res, next) {
    service.append(req.params, function (err, result) {
      if (err) { return res.send(err) }
      res.send('' + result)
      next()
    })
  })


  server.get('/list', function (req, res, next) {
    service.list(req.params, function (err, result) {
      if (err) { return res.send(err) }
      res.send(200, result)
      next()
    })
  })


  server.listen(process.env.AUDITSERVICE_SERVICE_PORT, '0.0.0.0', function () {
    console.log('%s listening at %s', server.name, server.url)
  })
}

