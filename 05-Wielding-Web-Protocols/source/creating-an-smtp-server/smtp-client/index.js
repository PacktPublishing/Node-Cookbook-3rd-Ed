'use strict'

const os = require('os')
const readline = require('readline')
const smtp = require('smtp-protocol')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: ''
})

const cfg = {
  host: 'localhost',
  port: 2525,
  email: 'me@me.com',
  hostname: os.hostname()
}

rl.on('SIGINT', () => {
  console.log('... cancelled ...')
  process.exit()
})

smtp.connect(cfg.host, cfg.port, (mail) => {
  mail.helo(cfg.hostname)
  mail.from(cfg.email)
  rl.question('To: ', (to) => {
    to.split(/;|,/gm).forEach((rcpt) => {
      rcpt = rcpt.trim()
      mail.to(rcpt, (err, code, lines) => {
        exitOnFail(err, code, lines, {rcpt: rcpt})
      })
    })
    rl.write('===== Message (^D to send) =====\n')
    mail.data(exitOnFail)
    const body = []
    rl.on('line', (line) => body.push(`${line}\r\n`))
    rl.on('close', () => send(mail, body))
  })
})

function send (mail, body) {
  console.log('... sending ...')
  const message = mail.message()
  body.forEach(message.write, message)
  message.end()
  mail.quit()
}

function exitOnFail (err, code, lines, info) {
  if (code === 550) {
    err = Error(`No Mailbox for Recipient "${info.rcpt}"`)
  }
  if (!err && code !== 354 && code !== 250 && code !== 220 && code !== 200) {
    err = Error(`Protocol Error: ${code} ${lines.join('')}`)
  }
  if (!err) return
  console.error(err.message)
  process.exit(1)
}
