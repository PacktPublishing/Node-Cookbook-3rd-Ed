var restify = require('restify')
var conc = require('concordant')()

module.exports = function () {

  function createClient (name, cb) {
    conc.dns.resolve('_main._tcp.' + name + '.micro.svc.cluster.local', function (err, result) {
      if (err) { console.log(err) }
      cb(err, restify.createJsonClient({url: 'http://' + result[0].host + ':' + result[0].port}))
    })
  }


  return {
    createClient: createClient
  }
}

