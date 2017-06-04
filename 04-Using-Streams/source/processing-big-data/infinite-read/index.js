'use strict'

const rs = fs.createReadStream('/dev/urandom')
var size = 0

rs.on('data', (data) => {
  size += data.length
  console.log('File size:', size)
})