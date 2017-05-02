'use strict'

const from = require('from2')
const rs = from((size, cb) => {
  setTimeout(() => {
    rs.push('Data 0')
    setTimeout(() => {
      rs.push('Data 1')
      cb()
    }, 50)
  }, 100)
})

rs.on('data', (data) => {
  console.log(data.toString())
})