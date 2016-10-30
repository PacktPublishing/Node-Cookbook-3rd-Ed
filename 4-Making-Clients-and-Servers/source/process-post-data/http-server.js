const http = require('http')
const host = '0.0.0.0'
const port = 8080

http.createServer((req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 400
    res.end('Bad Request')
    return
  }
  switch (req.url) {
    case '/about': return about(res)
    default: return index(res)
  }
}).listen(port, host)

function index (res) {
  res.end('<a href="/about">about</a>')
}

function about (res) {
  res.end('all about this thing')
}