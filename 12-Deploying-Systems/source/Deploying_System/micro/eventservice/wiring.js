var conc = require('concordant')()
var Redis = require('redis')
var QNAME = 'eventservice'


module.exports = function (service) {
  var redis

  var receive = function (cb) {
    redis.brpop(QNAME, 5, function (err, data) {
      if (cb && err) { return cb(err) }

      if (data) {
        var message = JSON.parse(data[1])
        service[message.action](message, function (err, result) {
          if (err) { console.log(err) }
          if (message.returnPath) {
            redis.lpush(message.returnPath, JSON.stringify(result), function (err) {
              if (err) { console.log(err) }
              receive()
            })
          } else {
            receive()
          }
        })
      } else {
        receive()
      }
    })
  }


  function init () {
    conc.dns.resolve('_main._tcp.redis.micro.svc.cluster.local', function (err, result) {
      if (err) { return console.log(err) }
      redis = Redis.createClient(result[0].port, result[0].host)
      receive()
    })
  }


  init()
}

