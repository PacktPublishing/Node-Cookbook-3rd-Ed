'use strict'

const fs = require('fs')
const {execSync} = require('child_process')

const file = process.argv[2]
if (!file) { 
  console.error('specify a file')
  process.exit(1)
}
try {
  fs.accessSync(file)
  console.error('file already exists')
  process.exit(1)
} catch (e) {
  makeIt()
}

function makeIt() {
  const nobody = Number(execSync('id -u nobody').toString().trim())
  const fd = fs.openSync(file, 'w')
  fs.fchmodSync(fd, 0)
  fs.fchownSync(fd, nobody, nobody)
  console.log(file + ' created')
}

