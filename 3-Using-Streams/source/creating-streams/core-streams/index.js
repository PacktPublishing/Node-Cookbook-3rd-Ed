const stream = require('stream')

const rs = new stream.Readable()

rs._read = function () {
  rs.push(Buffer('Hello, World!'))
  rs.push(null) 
}

// rs.on('data', (data) => {
//   console.log(data.toString()) 
// })

const ws = new stream.Writable()

ws._write = function (data, enc, cb) {
  console.log(`Data written: ${data.toString()}`)
  cb()
}

rs.pipe(ws)
