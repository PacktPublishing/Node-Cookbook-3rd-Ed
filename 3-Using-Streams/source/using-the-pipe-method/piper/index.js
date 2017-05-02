'use strict'

const zlib = require('zlib')
const map = require('tar-map-stream')
const decompress = zlib.createGunzip()
const whoami = process.env.USER || process.env.USERNAME
const convert = map((header) => {
  header.uname = whoami
  header.mtime = new Date()
  header.name = header.name.replace('node-v0.1.100', 'edon-v0.0.0')
  return header
})
const compress = zlib.createGzip()

process.stdin
  .pipe(decompress)
  .pipe(convert)
  .pipe(compress)
  .pipe(process.stdout)

