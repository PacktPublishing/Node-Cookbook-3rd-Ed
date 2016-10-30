const http = require('http')
const fs = require('fs')
const path = require('path')
const form = fs.readFileSync(path.join(__dirname, 'public', 'form.html'))
const qs = require('querystring')
const maxData = 2 * 1024 * 1024 // 2mb

http.createServer((req, res) => {
  if (req.method === 'GET') {
    get(res)
    return
  }
  if (req.method === 'POST') {
    post(req, res)
    return
  }
  badRequest(res)
}).listen(8080)

function get (res) {
  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(form)  
}

function post (req, res) {
  const size = parseInt(req.headers['content-length'], 10)    

  if (size > maxData) {
    tooLarge(req, res)
    return
  }

  const buffer = Buffer.allocUnsafe(size)
  var pos = 0

  req.on('data', (chunk) => {
    const offset = pos + chunk.length
    if (offset > size) {
      tooLarge(req, res)
      return
    }
    chunk.copy(buffer, pos)
    pos = offset
  }).on('end', () => {
    const data = qs.parse(buffer.toString()   )
    console.log('User Posted: ', data)
    res.end('You Posted: ' + JSON.stringify(data))
  })
}

function badRequest (res) {
  res.statusCode = 400
  res.end('Bad Request')
}

function tooLarge (req, res) {
  req.destroy()
  res.statusCode = 413
  res.end('Entity Too Large')
}