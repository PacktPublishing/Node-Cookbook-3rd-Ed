'use strict'

const http = require('http')
const fs = require('fs')
const ws = require('ws')

const app = fs.readFileSync('public/index.html')
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.end(app)
})
const wss = new ws.Server({server})

wss.on('connection', (socket) => {
  socket.on('message', (msg) => {
    console.log(`Received: ${msg}`)
    console.log(`From IP: ${socket.upgradeReq.connection.remoteAddress}`)
    if (msg === 'Hello') socket.send('Websockets!')
  })
})

server.listen(8080)