'use strict'

const net = require('net')

const socket = net.connect(1337)
const name = process.argv[2] || 'Dave'

socket.write(name)

socket.pipe(process.stdout)

socket.on('close', () => {
  console.log('-> disconnected by server')
})