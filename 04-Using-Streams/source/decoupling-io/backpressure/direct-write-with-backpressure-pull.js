'use strict'

const { Readable, Writable } = require('readable-stream')

var i = 20

const rs = Readable({
  read: (size, cb) => {
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

function write (chunk, cb) {
  const writable = ws.write(chunk)
  if (writable === false) {
    ws.once('drain', cb)
    return
  }
  process.nextTick(cb)
}

function read () {
  const chunk = rs.read()
  if (chunk === null) {
    rs.once('readable', read)
    return
  }
  write(chunk, read)
}

rs.once('readable', read)