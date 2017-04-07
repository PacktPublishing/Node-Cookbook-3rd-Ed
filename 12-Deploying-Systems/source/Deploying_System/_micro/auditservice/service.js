var MongoClient = require('mongodb').MongoClient
var conc = require('concordant')()

module.exports = function () {
  var url

  function init () {
    conc.dns.resolve('_main._tcp.mongo.micro.svc.cluster.local', function (err, result) {
      if (err) { console.log(err) }
      url = 'mongodb://' + result[0].host + ':' + result[0].port + '/audit'
    })
  }

  function append (args, cb) {
    MongoClient.connect(url, function (err, db) {
      if (err) return cb(err)

      var audit = db.collection('audit')
      var data = { ts: Date.now(),
        calc: args.calc,
        result: args.calcResult }

      audit.insert(data, function (err, result) {
        if (err) return cb(err)
        cb(null, result)
        db.close()
      })
    })
  }

  function list (args, cb) {
    MongoClient.connect(url, function (err, db) {
      if (err) return cb(err)

      var audit = db.collection('audit')
      audit.find({}, {limit: 10, sort: [['ts', 'desc']]}).toArray(function (err, docs) {
        if (err) return cb(err)
        cb(null, {list: docs})
        db.close()
      })
    })
  }

  init()
  return {
    append: append,
    list: list
  }
}

