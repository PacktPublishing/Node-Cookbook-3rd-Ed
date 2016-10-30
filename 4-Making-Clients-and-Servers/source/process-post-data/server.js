const http = require('http')
const fs = require('fs')
const path = require('path')
const form = fs.readFileSync(path.join(__dirname, 'public', 'form.html'))
const qs = require('querystring')

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

  const buffer = Buffer.allocUnsafe(2147483648)
  var pos = 0
  console.log(req.headers)
  req.on('data', (chunk) => {
    chunk.copy(buffer, pos)
    pos += chunk.length
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