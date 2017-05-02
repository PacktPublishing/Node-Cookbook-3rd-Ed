'use strict'

const { MongoClient } = require('mongodb')
const { dns } = require('concordant')()

module.exports = service 

function service () {
  var db

  setup()

  function setup () {
    const mongo = '_main._tcp.mongo.micro.svc.cluster.local'

    dns.resolve(mongo, (err, locs) => {
      if (err) { 
        console.error(err)
        return
      }
      const { host, port } = locs[0]
      const url = `mongodb://${host}:${port}/events`
      MongoClient.connect(url, (err, client) => {
        if (err) { 
          console.log('failed to connect to MongoDB retrying in 100ms')
          setTimeout(setup, 100)
          return
        }
        db = client
        db.on('close', () => db = null)
      }) 
    })
  }

  function record (args, cb) {
    if (!db) {
      cb(Error('No database connection'))
      return
    }
    const events = db.collection('events')
    const data = { 
      ts: Date.now(),
      eventType: args.type,
      url: args.url 
    }
    events.insert(data, (err, result) => {
      if (err) {
        cb(err)
        return
      }
      cb(null, result)
    })
  }

  function summary (args, cb) {
    if (!db) {
      cb(Error('No database connection'))
      return
    }
    const summary = {}
    const events = db.collection('events')
    events.find({}).toArray( (err, docs) => {
      if (err) return cb(err)

      docs.forEach(function (doc) {
        if (!(summary[doc.url])) {
          summary[doc.url] = 1
        } else {
          summary[doc.url]++
        }
      })
      cb(null, summary)
    })
  }

  return {
    record: record,
    summary: summary
  }
}
