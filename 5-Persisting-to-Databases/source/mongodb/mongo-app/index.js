const {MongoClient} = require('mongodb')
const client = new MongoClient()

const params = {
  author: process.argv[2],
  quote: process.argv[3]
}

client.connect('mongodb://localhost:27017/quotes', ready)

function ready (err, db) {
  if (err) throw err
  const collection = db.collection('quotes')

  if (params.author && params.quote) {
    collection.insert({
      author: params.author,
      quote: params.quote
    }, (err) => {
      if (err) throw err
    })
  }

  if (params.author) {
    collection.find({
      author: params.author
    }).each((err, doc) => {
      if (err) throw err
      if (!doc) {
        db.close()
        return
      }
      console.log('%s: %s \n', doc.author, doc.quote)
    })
    return
  }

  db.close()
}
