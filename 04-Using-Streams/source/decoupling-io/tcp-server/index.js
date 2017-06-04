'use strict'

const net = require('net')
const pump = require('pump')
const ping = require('../ping-protocol-stream')

const server = net.createServer((socket) => {
  const protocol = ping()
  pump(socket, protocol, socket, closed)
})

function closed (err) {
  if (err) console.error('connection closed with error', err)
  else console.log('connection closed')
}

server.listen(3000)
