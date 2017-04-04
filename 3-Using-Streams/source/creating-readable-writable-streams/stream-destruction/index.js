'use strict'

var from = require('from2')

function createInfiniteTickStream () {
  var tick = 0
  return from.obj((size, cb) => {
    setImmediate(() => cb(null, {tick: tick++}))
  })
}

var stream = createInfiniteTickStream()

stream.on('data', (data) => {
  console.log(data)
})

stream.on('close', () => {
  console.log('(stream destroyed)')
})

setTimeout(() => {
  stream.destroy()
}, 1000)

