'use strict'

const net = require('net')

const socket = net.connect('/tmp/my.socket')
const name = process.argv[2] || 'Dave'

socket.write(name)

socket.on('data', (data) => {
  console.log(data.toString())
})

socket.on('close', () => {
  console.log('-> disconnected by server')
})