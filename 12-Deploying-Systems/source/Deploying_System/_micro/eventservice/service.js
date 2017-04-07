var MongoClient = require('mongodb').MongoClient
var conc = require('concordant')()

module.exports = function () {
  var url

  function init () {
    conc.dns.resolve('_main._tcp.mongo.micro.svc.cluster.local', function (err, result) {
      if (err) { console.log(err) }
      url = 'mongodb://' + result[0].host + ':' + result[0].port + '/events'
    })
  }

  function record (args, cb) {
    console.log('record')
    MongoClient.connect(url, function (err, db) {
      if (err) return cb(err)
      var events = db.collection('events')
      var data = { ts: Date.now(),
        eventType: args.type,
        url: args.url }

      events.insert(data, function (err, result) {
        if (err) return cb(err)
        cb(null, result)
        db.close()
      })
    })
  }

  function summary (args, cb) {
    var summary = {}

    MongoClient.connect(url, function (err, db) {
      if (err) { return cb(err) }

      var events = db.collection('events')
      events.find({}).toArray(function (err, docs) {
        if (err) return cb(err)

        docs.forEach(function (doc) {
          if (!(summary[doc.url])) {
            summary[doc.url] = 1
          } else {
            summary[doc.url]++
          }
        })
        cb(null, summary)
        db.close()
      })
    })
  }

  init()
  return {
    record: record,
    summary: summary
  }
}
