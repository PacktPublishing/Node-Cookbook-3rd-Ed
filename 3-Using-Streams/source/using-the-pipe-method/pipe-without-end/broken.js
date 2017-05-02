const net = require('net')
const fs = require('fs')

net.createServer((socket) => {
  const content = fs.createReadStream(__filename)
  content.pipe(socket)
  content.on('end', () => {
    socket.end('\n======= Footer =======\n')
  })
}).listen(3000)