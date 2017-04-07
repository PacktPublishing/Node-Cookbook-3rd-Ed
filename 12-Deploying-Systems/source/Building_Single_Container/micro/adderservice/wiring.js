var restify = require('restify')

module.exports = function (service) {
  var server = restify.createServer()

  server.get('/add/:first/:second', function (req, res, next) {
    service.add(req.params, function (err, result) {
      if (err) { return res.send(err) }
      res.send(200, {result: result})
      next()
    })
  })

  server.listen(process.env.ADDERSERVICE_SERVICE_PORT, '0.0.0.0', function () {
    console.log('%s listening at %s', server.name, server.url)
  })
}

