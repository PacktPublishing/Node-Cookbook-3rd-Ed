'use strict'

const fs = require('fs')
const rs = fs.createReadStream(__filename)

rs.on('readable', () => {
  var data = rs.read()
  while (data !== null) {
    console.log('Read chunk:', data)
    data = rs.read()
  }
})

rs.on('end', () => {
  console.log('No more data')
})

