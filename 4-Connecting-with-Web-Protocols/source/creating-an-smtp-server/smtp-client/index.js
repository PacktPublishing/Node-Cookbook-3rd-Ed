const fs = require('fs')
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
  email: 'me@me.com'
}

rl.on('SIGINT', () => {
  console.log('... cancelled ...')
  process.exit()
})

smtp.connect(cfg.host, cfg.port, (mail) => {
  mail.helo(os.hostname())
  mail.from(cfg.email)
  rl.question('To: ', (to) => {
    to.split(/;|,/gm).forEach((rcpt) => mail.to(rcpt))
    rl.write('===== Message (^D to send) =====\n')
    mail.data()
    const body = []
    rl.on('line', (line) => body.push(`${line}\r\n`))
    rl.on('close', () => {
      console.log('... sending ...')
      const message = mail.message()
      body.forEach((line) => message.write(line))
      message.end()
      mail.quit()
    })
  })
})