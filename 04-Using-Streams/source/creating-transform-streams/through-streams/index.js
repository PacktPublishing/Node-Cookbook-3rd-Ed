'use strict'

const through = require('through2')

const upper = through((chunk, enc, cb) => {
  cb(null, chunk.toString().toUpperCase())
})

process.stdin.pipe(upper).pipe(process.stdout)