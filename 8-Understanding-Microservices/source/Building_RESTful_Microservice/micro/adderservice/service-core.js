var http = require('http')

function respond (req, res, next) {
  var params = req.url.split('/')
  var result = parseInt(params[2], 10) + parseInt(params[3], 10)
  res.end('' + result)
}

var server = http.createServer((req, res) => {
  respond(req, res)
})

server.listen(8080, function () {
  console.log('listening on port 8080')
})

