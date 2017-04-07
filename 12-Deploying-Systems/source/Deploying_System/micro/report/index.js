var conc = require('concordant')()
var Redis = require('redis')
var CliTable = require('cli-table')
var QNAME = 'eventservice'
var RESPONSE_QUEUE = 'sumary'


conc.dns.resolve('_main._tcp.redis.micro.svc.cluster.local', function (err, result) {
  if (err) { return console.log(err) }

  var redis = Redis.createClient(result[0].port, result[0].host)
  redis.lpush(QNAME, JSON.stringify({action: 'summary', returnPath: RESPONSE_QUEUE}), function (err) {
    if (err) { return console.log(err) }

    redis.brpop(RESPONSE_QUEUE, 5, function (err, data) {
      if (err) { return console.log(err) }

      var display = JSON.parse(data[1])
      var table = new CliTable({head: ['url', 'count'], colWidths: [50, 10]})
      Object.keys(display).forEach(function (key) {
        table.push([key, display[key]])
      })
      console.log(table.toString())
      redis.quit()
    })
  })
})

