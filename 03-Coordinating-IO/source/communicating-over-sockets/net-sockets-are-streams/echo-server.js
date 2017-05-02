'use strict'

require('net').createServer((socket) => socket.pipe(socket)).listen(1338)