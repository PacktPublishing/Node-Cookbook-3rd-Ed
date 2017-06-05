'use strict'

const http = require('http')
const fs = require('fs')
const path = require('path')
const steed = require('steed')()
const files = process.argv.slice(2)
const boundary = Date.now()
const opts = {
  method: 'POST',
  hostname: 'localhost',
  port: 8080,
  path: '/',
  headers: {
    'Content-Type': 'multipart/form-data; boundary="' + boundary + '"',
    'Transfer-Encoding': 'chunked'
  }
}

const req = http.request(opts, (res) => {
  console.log('\n  Status: ' + res.statusCode)
  process.stdout.write('  Body: ')
  res.pipe(process.stdout)
  res.on('end', () => console.log('\n'))
})

req.on('error', (err) => console.error('Error: ', err))

const parts = files.map((file, i) => (cb) => {
  const stream = fs.createReadStream(file)
  stream.once('open', () => {
    req.write(
      `\r\n--${boundary}\r\n` +
      'Content-Disposition: ' +
      `form-data; name="userfile${i}";` +
      `filename="${path.basename(file)}"\r\n` +
      'Content-Type: application/octet-stream\r\n' +
      'Content-Transfer-Encoding: binary\r\n' +
      '\r\n'
    )
  })
  stream.pipe(req, {end: false})
  stream.on('data', (chunk) => req.write(chunk))
  stream.on('end', cb)
})

steed.series(parts, () => req.end(`\r\n--${boundary}--\r\n`))
