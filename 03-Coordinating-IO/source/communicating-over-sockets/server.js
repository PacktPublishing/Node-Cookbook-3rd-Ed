'use strict'

const net = require('net')

net.createServer((socket) => {
  console.log('-> client connected')
  socket.on('data', name => {
    socket.write(`Hi ${name}!`)
  })
  socket.on('close', () => {
    console.log('-> client disconnected')
  })
}).listen(1337, 'localhost')