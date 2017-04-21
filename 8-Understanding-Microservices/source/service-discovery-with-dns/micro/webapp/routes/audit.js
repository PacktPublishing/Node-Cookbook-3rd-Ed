'use strict'

const { Router } = require('express')
const restify = require('restify')
const router = Router()

router.get('/', (req, res, next) => {
  resolve('auditservice', (err, audit) => {
    if (err) {
      next(err)
      return
    }
    const client = restify.createJSONClient(`http://${audit}`)
    client.get('/list', (err, svcReq, svcRes, data) => {
      if (err) { 
        next(err)
        return 
      }
      res.render('audit', data)
    })
  })
})

function resolve (service, cb) {
  const uri = `_main._tcp.${service}.micro.svc.cluster.local`
  dns.resolve(uri, (err, result) => {
    if (err) {
      cb(err)
      return
    }
    const { host, port } = result[0]
    cb(null, `${host}:${port}`)
  })
}

module.exports = router
