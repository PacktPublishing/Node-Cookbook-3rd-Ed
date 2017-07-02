'use strict'

const from = require('from2')
const to = require('to2')
const duplexify = require('duplexify')

const rs = from(() => {
  rs.push(Buffer.from('Hello, World!'))
  rs.push(null)
})

const ws = to((data, enc, cb) => {
  console.log(`Data written: ${data.toString()}`)
  cb()
})

const stream = duplexify(ws, rs)

stream.pipe(stream)
