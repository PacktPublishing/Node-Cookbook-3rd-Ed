'use strict'

const { createGzip } = require('zlib')
const { createCipher } = require('crypto')
const pumpify = require('pumpify')
const base64 = require('base64-encode-stream')

function pipeline () {
  const stream1 = createGzip()
  const stream2 = createCipher('aes192', 'secretz')
  const stream3 = base64()
  return pumpify(stream1, stream2, stream3)
}

const pipe = pipeline()

pipe.end('written to stream1')

pipe.on('data', (data) => {
  console.log('stream3 says: ', data.toString())
})

pipe.on('finish', () => {
  console.log('all data was successfully flushed to stream3')
})