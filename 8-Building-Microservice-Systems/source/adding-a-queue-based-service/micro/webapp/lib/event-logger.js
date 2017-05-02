'use strict'

const { dns } = require('concordant')()
const redis = require('redis')

module.exports = eventLogger

function eventLogger () {
  const QNAME = 'eventservice'
  var client

  const endpoint = '_main._tcp.redis.micro.svc.cluster.local'
  dns.resolve(endpoint, (err, locs) => {
    if (err) {
      console.error(err)
      return
    }
    const { port, host } = locs[0]
    client = redis.createClient(port, host)
  })

  function middleware (req, res, next) {
    if (!client) {
      console.log('client not ready, waiting 100ms')
      setTimeout(middleware, 100, req, res, next)
      return
    }
    const event = {
      action: 'record',
      type: 'page', 
      url: `${req.protocol}://${req.get('host')}${req.originalUrl}`
    }
    client.lpush(QNAME, JSON.stringify(event), (err) => {
      if (err) console.error(err)
      next()
    })
  }

  return middleware
}
