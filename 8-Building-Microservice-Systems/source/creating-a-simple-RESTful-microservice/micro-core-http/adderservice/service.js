'use strict'

const http = require('http')

const server = http.createServer(respond)

server.listen(8080, function () {
  console.log('listening on port 8080')
})

function respond (req, res) {
  const [cmd, first, second] = req.url.split('/').slice(1)
  const notFound = cmd !== 'add' || 
    first === undefined || 
    second === undefined

  if (notFound) {
    error(404, res)
    return
  }

  const result = parseInt(first, 10) + parseInt(second, 10)
  res.end(result)
}

function error(code, res) {
  res.statusCode = code
  res.end(http.STATUS_CODES[code])
}

