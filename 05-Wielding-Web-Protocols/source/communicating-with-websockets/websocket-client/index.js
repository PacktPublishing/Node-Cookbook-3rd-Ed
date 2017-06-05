'use strict'

const WebSocket = require('ws')
const readline = require('readline')
const ws = new WebSocket(process.argv[2] || 'ws://localhost:8080')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '-> '
})
const gray = '\u001b[90m'
const red = '\u001b[31m'
const reset = '\u001b[39m'
ws.on('open', () => {
  rl.output.write(`${gray}-- Connected --${reset}\n\n`)
  rl.prompt()
})
rl.on('line', (msg) => {
  ws.send(msg, () => {
    rl.output.write(`${gray}<= ${msg}${reset}\n\n`)
    rl.prompt()
  })
})
ws.on('message', function (msg) {
  readline.clearLine(rl.output)
  readline.moveCursor(rl.output, -3 - rl.line.length, -1)
  rl.output.write(`${gray}=> ${msg}${reset}\n\n`)
  rl.prompt(true)
})
ws.on('close', () => {
  readline.cursorTo(rl.output, 0)
  rl.output.write(`${gray}-- Disconnected --${reset}\n\n`)
  process.exit()
})
ws.on('error', (err) => {
  readline.cursorTo(rl.output, 0)
  rl.output.write(`${red}-- Error --${reset}\n`)
  rl.output.write(`${red}${err.stack}${reset}\n`)
})