const fs = require('fs')
const path = require('path')
const smtp = require('smtp-protocol')

const hosts = ['localhost', 'example.com']

tryMkdirSync('mail')

smtp.createServer((req) => {
  req.on('to', (to, {accept, reject}) => {
    const domain = to.split('@')[1] || hosts[0]
    if (hosts.indexOf(domain) > -1) accept()
    else reject()
  })
  
  req.on('message', (stream, {accept}) => {
    const {from, to} = req
    to.forEach((rcpt) => {
      tryMkdirSync('mail', rcpt)
      const mail = createMailStream(rcpt, from)
      mail.write(`From: ${from} \n`)
      mail.write(`To: ${rcpt} \n\n`)
      stream.pipe(mail, {end: false})
    })
    accept()
  })

  req.on('error', (err) => console.error(err))
}).listen(2525)


function tryMkdirSync (...args) {
  try { fs.mkdirSync(path.join(__dirname, ...args)) } catch (e) {}
}
function createMailStream (rcpt, from) {
  const dest = path.join(__dirname, 'mail', rcpt, `${from}-${Date.now()}`)
  return fs.createWriteStream(dest)
}