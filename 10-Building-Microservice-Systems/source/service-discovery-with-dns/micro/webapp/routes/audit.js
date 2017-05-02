'use strict'

const { Router } = require('express')
const restify = require('restify')
const { dns } = require('concordant')()
const router = Router()
var client 

router.get('/', resolve, respond)

function resolve (req, res, next) {
  if (client) {
    next()
    return
  }
  const auditservice = `_main._tcp.auditservice.micro.svc.cluster.local`
  dns.resolve(auditservice, (err, locs) => {
    if (err) {
      next(err)
      return
    }
    const { host, port } = locs[0]
    client = restify.createJSONClient(`http://${host}:${port}`)
  })
}

function respond (req, res, next) {
  client.get('/list', (err, svcReq, svcRes, data) => {
    if (err) { 
      next(err)
      return 
    }
    res.render('audit', data)
  })
}

module.exports = router
