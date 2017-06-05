'use strict'

const http = require('http')

const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 8080

const server = http.createServer((req, res) => {
  if (req.method !== 'GET') return error(res, 405)
  if (req.url === '/users') return users(res)
  if (req.url === '/') return index(res)
  error(res, 404)
})

function error (res, code) {
  res.statusCode = code
  res.end(`{"error": "${http.STATUS_CODES[code]}"}`)
}

function users (res) {
  res.end('{"data": [{"id": 1, "first_name": "Bob", "second_name": "Smith"}]}') 
}

function index (res) {
  res.end('{"name": "my-rest-server", "version": 0}')
}

server.listen(port, host)