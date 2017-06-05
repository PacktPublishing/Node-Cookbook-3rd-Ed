'use strict'

const http = require('http')
const opts = {
  method: 'POST',
  hostname: 'reqres.in',
  port: 80,
  path: '/api/users',
  headers: {
    'Content-Type': 'application/json',
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

http.get('http://reqres.in/api/users', (res) => {
  res.pipe(req)
})