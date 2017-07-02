'use strict'

const { Transform } = require('readable-stream')

class MyTransform extends Transform {
  _transform (chunk, enc, cb) {
    cb(null, chunk.toString().toUpperCase())
  }
}

const upper = new MyTransform()

process.stdin.pipe(upper).pipe(process.stdout)