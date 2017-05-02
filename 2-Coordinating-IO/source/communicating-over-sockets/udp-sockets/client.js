'use strict'

const dgram = require('dgram')

const socket = dgram.createSocket('udp4')
const name = process.argv[2] || 'Dave'

socket.bind(1400)
socket.send(name, 1339)

socket.on('message', (data) => {
  console.log(data.toString())
})
