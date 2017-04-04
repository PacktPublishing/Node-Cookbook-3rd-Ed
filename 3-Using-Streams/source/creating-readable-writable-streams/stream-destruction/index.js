'use strict'

var from = require('from2')

function createInfiniteTickStream () {
  var tick = 0
  return from.obj(function (size, cb) {
    setImmediate(() => cb(null, {tick: tick++}))
  })
}

var stream = createInfiniteTickStream()

stream.on('data', function (data)  {
  console.error(data)
})

stream.on('close', function () {
  console.log('(stream destroyed)')
})

setTimeout(function () {
  stream.destroy()
}, 1000)

