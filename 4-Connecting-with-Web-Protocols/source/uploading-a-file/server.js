const http = require('http')
const fs = require('fs')
const path = require('path')
const mp = require('multipart-read-stream')
const pump = require('pump')
const eos = require('end-of-stream')
const form = fs.readFileSync(path.join(__dirname, 'public', 'form.html'))
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
  reject(405, 'Method Not Allowed', res)
}).listen(8080)

function get (res) {
  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(form)  
}

function post (req, res) {
  if (!/multipart\/form-data/.test(req.headers['content-type'])) {
    reject(415, 'Unsupported Media Type', res)
    return
  }

  // if (isSizeBad(req, res)) { return }

  var ok = true

  pump(req, mp(req, res, part, done))

  function part (field, file, name) {
    const filename = `${field}-${Date.now()}-${name}`
    const dest = path.join(__dirname, 'uploads', filename)
    pump(file, fs.createWriteStream(dest), (err) => err && bail())
    eos(file, (err) => {
      if (err) {
        console.log(err)
        bail()
        return
      }
      if (ok) res.write(`${name} successfully saved!\n`)  
    })
  }

  function done (err) {
    if (err) {
      console.log(err)
      bail()
      return 
    }
    if (ok) res.end('All files saved!') 
  }

  function bail () {
    ok = false
    reject(500, 'Server Error', res)
  }
}



function isSizeBad(req, res) {
  const size = parseInt(req.headers['content-length'], 10)
  if (isNaN(size)) {
    reject(400, 'Bad Request', res)
    return true
  }
  if (size > maxData) {
    reject(413, 'Too Large', res)
    return true
  }
}

function reject (code, msg, res) {
  res.statusCode = code
  res.end(msg)
}