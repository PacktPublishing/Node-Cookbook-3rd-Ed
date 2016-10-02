'use strict'

const MongoClient = require('mongodb').MongoClient
const express = require('express')
const app = express()

var url = 'mongodb://localhost:27017/test';


MongoClient.connect(url, function(err, db) {
  if (err) { throw err }
  const collection = db.collection('data')
  app.get('/hello', (req, res) => {
    collection.find({}).toArray(function sum (err, data) {
      if (err) {
        res.send(err)
        return
      }
      const total = data.reduce((acc, d) => acc + d.value, 0)
      const result = total / data.length
      res.send('' + result)
    })
  })

  app.listen(3000)
})
