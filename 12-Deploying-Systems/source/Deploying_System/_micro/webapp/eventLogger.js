var conc = require('concordant')()
var Redis = require('redis')
var QNAME = 'event_service'


module.exports = function () {
  var redis


  function logEvent (evt) {
    evt.action = 'record'
    redis.lpush(QNAME, JSON.stringify(evt), function (err) {
      if (err) { console.log(err) }
    })
  }


  function init () {
    conc.dns.resolve('_main._tcp.redis.micro.svc.cluster.local', function (err, result) {
      if (err) { return console.log(err) }
      redis = Redis.createClient(result[0].port, result[0].host)
    })
  }


  init()
  return {
    logEvent: logEvent
  }
}

