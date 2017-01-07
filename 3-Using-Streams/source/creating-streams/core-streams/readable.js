const stream = require('stream')

const rs = new stream.Readable()

rs._read = function () {
  rs.push(Buffer('Hello, World!'))
  rs.push(null) 
}

rs.on('data', (data) => {
  console.log(data.toString()) 
})

