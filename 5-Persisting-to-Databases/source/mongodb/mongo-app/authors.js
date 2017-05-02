const {MongoClient} = require('mongodb')
const client = new MongoClient()

client.connect('mongodb://localhost:27017/quotes', ready)

function ready (err, db) {
  if (err) throw err
  const collection = db.collection('quotes')
  collection.ensureIndex('author', (err) => {
    if (err) throw err
    collection.distinct('author', (err, result) => {
      if (err) throw err
      console.log(result.join('\n'))
      db.close()
    })
  })
}
