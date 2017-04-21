'use strict'

const { Router } = require('express')
const restify = require('restify')
const { dns } = require('concordant')()
const router = Router()

router.get('/', function (req, res) {
  res.render('add', { first: 0, second: 0, result: 0 })
})

router.post('/calculate', function (req, res, next) {
  resolve('adderservice', (err, adder) => {
    if (err) {
      next(err)
      return
    }
    resolve('auditservice', (err, audit) => {
      if (err) { 
        next(err)
        return
      }
      const clients = { 
        adder: restify.createJSONClient({url: `http://${adder}`}), 
        audit: restify.createJSONClient({url: `http://${audit}`})
      }
      const { first, second } = req.body
      clients.adder.get(
        `/add/${first}/${second}`,
        (err, svcReq, svcRes, data) => {
          if (err) {
            next(err)
            return
          }

          const { result } = data
          clients.audit.post('/append', {
            calc: first + '+' + second,
            calcResult: result
          }, (err) => {
            if (err) console.error(err)
          })
          
          res.render('add', { first, second, result })
        }
      )
    })
  })
})

function resolve (service, cb) {
  const uri = `_main._tcp.${service}.micro.svc.cluster.local`
  dns.resolve(uri, (err, result) => {
    if (err) {
      console.log(err, result)
      cb(err)
      return
    }
    const { host, port } = result[0]
    cb(null, `${host}:${port}`)
  })
}

module.exports = router
