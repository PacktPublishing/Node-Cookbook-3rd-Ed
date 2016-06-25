'use strict'

const dgram = require('dgram')

const socket = dgram.createSocket('udp4')
socket.bind(1339)

socket.on('message', (name) => {
  socket.send(`Hi ${name}!`, 1400)
})
