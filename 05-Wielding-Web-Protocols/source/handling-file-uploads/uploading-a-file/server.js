'use strict'

const http = require('http')
const fs = require('fs')
const path = require('path')
const mrs = require('multipart-read-stream')
const pump = require('pump')
const form = fs.readFileSync(path.join(__dirname, 'public', 'form.html'))

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

function reject (code, msg, res) {
  res.statusCode = code
  res.end(msg)
}

function post (req, res) {
  if (!/multipart\/form-data/.test(req.headers['content-type'])) {
    reject(415, 'Unsupported Media Type', res)
    return
  }
  console.log('parsing multipart data')
  const parser = mrs(req.headers, part)
  var total = 0
  pump(req, parser)

  function part (field, file, name) {
    if (!name) {
      file.resume()
      return
    }
    total += 1
    const filename = `${field}-${Date.now()}-${name}`
    const dest = fs.createWriteStream(path.join(__dirname, 'uploads', filename))
    pump(file, dest, (err) => {
      total -= 1
      res.write(err
        ? `Error saving ${name}!\n`
        : `${name} successfully saved!\n`
      )
      if (total === 0) res.end('All files processed!')
    })
  }
}
