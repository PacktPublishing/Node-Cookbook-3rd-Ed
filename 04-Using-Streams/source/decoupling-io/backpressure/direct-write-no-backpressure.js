'use strict'

const { Readable, Writable } = require('readable-stream')

var i = 20

const rs = Readable({
  read: (size) => {
    setImmediate(function () {
      rs.push(i-- ? Buffer.alloc(size) : null)
    })
  }
})

const ws = Writable({
  write: (chunk, enc, cb) => {
    console.log(ws._writableState.length)
    setTimeout(cb, 1)
  }
})

rs.on('data', (chunk) => ws.write(chunk))