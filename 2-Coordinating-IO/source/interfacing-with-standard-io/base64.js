'use strict'

process.stdin.on('data', data => {
  process.stderr.write(`Converting: "${data}" to base64\n`)
  process.stdout.write(data.toString('base64') + '\n')
})
