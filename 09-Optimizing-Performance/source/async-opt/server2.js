'use strict'

const MongoClient = require('mongodb').MongoClient
const express = require('express')
const app = express()

var url = 'mongodb://localhost:27017/test';


MongoClient.connect(url, function(err, db) {
  if (err) { throw err }
  const collection = db.collection('data')
  app.get('/hello', (req, res) => {
    var count = 0
    var result = 0
    collection.find({})
      .on('data', function (chunk) {
        count++
        result += chunk.value
      })
      .on('end', function () {
        res.send('' + (result / count))
      })
  })

  app.listen(3000)
})
