'use strict'

const net = require('net')
const ping = require('../ping-protocol-stream')

const server = net.createServer((socket) => {
  const protocol = ping()
  socket.pipe(protocol).pipe(socket)
})

server.listen(3000)