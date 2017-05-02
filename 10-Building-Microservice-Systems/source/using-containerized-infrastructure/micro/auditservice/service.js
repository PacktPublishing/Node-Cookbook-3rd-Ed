'use strict'

const { MongoClient } = require('mongodb')
const {
  MONGO_SERVICE_HOST,
  MONGO_SERVICE_PORT
} = process.env
const url = `mongodb://${MONGO_SERVICE_HOST}:${MONGO_SERVICE_PORT}/audit`

module.exports = service 

function service () {
  function append (args, cb) {
    MongoClient.connect(url, (err, db) => {
      if (err) {
        cb(err)
        return
      }

      const audit = db.collection('audit')
      const data = { 
        ts: Date.now(),
        calc: args.calc,
        result: args.calcResult 
      }

      audit.insert(data, (err, result) => {
        if (err) {
          cb(err)
          return
        }
        cb(null, {result: result.toString()})
        db.close()
      })
    })
  }

  function list (args, cb) {
    MongoClient.connect(url, (err, db) => {
      if (err) {
        cb(err)
        return
      }
      const audit = db.collection('audit')
      audit.find({}, {limit: 10}).toArray((err, docs) => {
        if (err) {
          cb(err)
          return
        }
        cb(null, {list: docs})
        db.close()
      })
    })
  }

  return { append, list }
}

