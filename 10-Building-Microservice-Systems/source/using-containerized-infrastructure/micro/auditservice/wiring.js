'use strict'

const restify = require('restify')
const { AUDITSERVICE_SERVICE_PORT } = process.env

module.exports = wiring 

function wiring (service) {
  const server = restify.createServer()

  server.use(restify.bodyParser())

  server.post('/append', (req, res, next) => {
    service.append(req.params, (err, result) => {
      if (err) { 
        res.send(err) 
        return
      }
      res.send(result)
      next()
    })
  })

  server.get('/list', (req, res, next) => {
    service.list(req.params, (err, result) => {
      if (err) { 
        res.send(err)
        return 
      }
      res.send(200, result)
      next()
    })
  })

  server.listen(AUDITSERVICE_SERVICE_PORT, '0.0.0.0', () => {
    console.log('%s listening at %s', server.name, server.url)
  })
}

