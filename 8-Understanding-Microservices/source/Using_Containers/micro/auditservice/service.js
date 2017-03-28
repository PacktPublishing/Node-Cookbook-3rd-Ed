var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://' + process.env.MONGO_SERVICE_HOST + ':' + process.env.MONGO_SERVICE_PORT + '/audit'

module.exports = function () {

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
      audit.find({}, {limit: 10}).toArray(function (err, docs) {
        if (err) return cb(err)
        cb(null, {list: docs})
        db.close()
      })
    })
  }

  return {
    append: append,
    list: list
  }
}

