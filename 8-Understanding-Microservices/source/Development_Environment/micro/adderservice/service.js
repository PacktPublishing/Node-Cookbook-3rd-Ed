var restify = require('restify')

function respond (req, res, next) {
  var result = parseInt(req.params.first, 10) + parseInt(req.params.second, 10)

  console.log('adding numbers!')
  res.send('' + result)
  next()
}

var server = restify.createServer()
server.get('/add/:first/:second', respond)

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url)
})

