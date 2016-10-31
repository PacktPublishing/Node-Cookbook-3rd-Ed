const smtp = require('smtp-protocol')
const path = require('path')
const fs = require('fs')

const hosts = ['localhost', 'superawesome.com']

tryMkdirSync('mail')

smtp.createServer((req) => {
  req.on('to', (to, {accept, reject}) => {
    const domain = to.split('@')[1] || hosts[0]
    if (hosts.indexOf(domain) > -1) {
      accept()
    } else {
      reject()
    }
  })
  
  req.on('message', (stream, {accept}) => {
    const {from, to} = req
    const rcpt = to.toString().split('@')[0]
    tryMkdirSync('mail', rcpt)
    const mail = createMailStream(rcpt, from)
    mail.write(`From: ${from} \n`)
    mail.write(`To: ${to} \n\n`)
    stream.pipe(mail)
    accept()
  })

  req.on('error', (err) => console.error(err))
}).listen(2525)

function createMailStream (rcpt, from) {
  return fs.createWriteStream(path.join(__dirname, 'mail', rcpt, from))
}

function tryMkdirSync (...args) {
  try { fs.mkdirSync(path.join(__dirname, ...args)) } catch (e) {}
}