'use strict'

const restify = require('restify')

function respond (req, res, next) {
  const result = (parseInt(req.params.first, 10) + 
    parseInt(req.params.second, 10)).toString()
  res.send(result)
  next()
}

const server = restify.createServer()
server.get('/add/:first/:second', respond)

server.listen(8080, () => {
  console.log('%s listening at %s', server.name, server.url)
})

