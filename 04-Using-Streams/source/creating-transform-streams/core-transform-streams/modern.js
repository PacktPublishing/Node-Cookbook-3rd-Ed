'use strict'

const { Transform } = require('readable-stream')

const upper = Transform({
  transform: (chunk, enc, cb) => {
    cb(null, chunk.toString().toUpperCase())
  }
})

process.stdin.pipe(upper).pipe(process.stdout)