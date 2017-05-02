'use strict'

const { Router } = require('express')
const restify = require('restify')
const router = Router()

const {
  ADDERSERVICE_SERVICE_HOST,
  ADDERSERVICE_SERVICE_PORT,
  AUDITSERVICE_SERVICE_HOST,
  AUDITSERVICE_SERVICE_PORT,
} = process.env

router.get('/', function (req, res) {
  res.render('add', { first: 0, second: 0, result: 0 })
})

router.post('/calculate', function (req, res, next) {
  const clients = {
    adder: restify.createJSONClient({
      url: `http://${ADDERSERVICE_SERVICE_HOST}:${ADDERSERVICE_SERVICE_PORT}`
    }),
    audit: restify.createJSONClient({
      url: `http://${AUDITSERVICE_SERVICE_HOST}:${AUDITSERVICE_SERVICE_PORT}`
    })
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

module.exports = router
