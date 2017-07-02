'use strict'

// WARNING: DOES NOT WORK AS EXPECTED
const { Readable } = require('readable-stream')
const rs = Readable({
  read: () => {
    setTimeout(() => {
      rs.push('Data 0')
      setTimeout(() => {
        rs.push('Data 1')
      }, 50)
    }, 100)
  }
})

rs.on('data', (data) => {
  console.log(data.toString())
})
