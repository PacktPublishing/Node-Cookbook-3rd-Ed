'use strict'

const fs = require('fs')
const path = require('path')
const smtp = require('smtp-protocol')
const hosts = new Set(['localhost', 'example.com'])
const users = new Set(['you', 'another'])
const mailDir = path.join(__dirname, 'mail')

function ensureDir (dir, cb) {
  try { fs.mkdirSync(dir) } catch (e) {
    if (e.code !== 'EEXIST') throw e
  }
}

ensureDir(mailDir)
for (let user of users) ensureDir(path.join(mailDir, user))

const server = smtp.createServer((req) => {
  req.on('to', filter)
  req.on('message', (stream, ack) => save(req, stream, ack))
  req.on('error', (err) => console.error(err))
})

server.listen(2525)

function filter (to, {accept, reject}) {
  const [user, host] = to.split('@')
  if (hosts.has(host) && users.has(user)) {
    accept()
    return
  }
  reject(550, 'mailbox not available')
}

function save (req, stream, {accept}) {
  const {from, to} = req
  accept()
  to.forEach((rcpt) => {
    const [user] = rcpt.split('@')
    const dest = path.join(mailDir, user, `${from}-${Date.now()}`)
    const mail = fs.createWriteStream(dest)
    mail.write(`From: ${from} \n`)
    mail.write(`To: ${rcpt} \n\n`)
    stream.pipe(mail, {end: false})
  })
}