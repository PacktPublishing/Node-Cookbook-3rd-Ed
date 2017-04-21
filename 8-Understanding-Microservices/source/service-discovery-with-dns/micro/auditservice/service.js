'use strict'

const { MongoClient } = require('mongodb')
const { dns } = require('concordant')()

module.exports = service 

function service () {

  function append (args, cb) {
    resolve('mongo', (err, mongo) => {
      const url = `mongodb://${mongo}/audit`
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

function resolve (service, cb) {
  const uri = `_main._tcp.${service}.micro.svc.cluster.local`
  dns.resolve(uri, (err, result) => {
    if (err) {
      cb(err)
      return
    }
    const { host, port } = result[0]
    cb(null, `${host}:${port}`)
  })
}

