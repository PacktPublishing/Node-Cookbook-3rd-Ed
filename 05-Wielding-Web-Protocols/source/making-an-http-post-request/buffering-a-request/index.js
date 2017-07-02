'use strict'

const http = require('http')
const assert = require('assert')
const url = 'http://www.davidmarkclements.com/ncb3/some.json'

http.get(url, (res) => {
  const size = parseInt(res.headers['content-length'], 10)
  const buffer = Buffer.allocUnsafe(size)
  var index = 0
  res.on('data', (chunk) => {
    chunk.copy(buffer, index)
    index += chunk.length
  })
  res.on('end', () => {
    assert.equal(size, buffer.length)
    console.log('GUID:', JSON.parse(buffer).guid)
  })
})