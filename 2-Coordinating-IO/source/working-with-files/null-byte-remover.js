'use strict'

const fs = require('fs')
const path = require('path')
const cwd = process.cwd()
const bytes = fs.readFileSync(path.join(cwd, 'file.dat'))

const clean = bytes.filter(n => n)
fs.writeFileSync(path.join(cwd, 'clean.dat'), clean)

fs.appendFileSync(
  path.join(cwd, 'log.txt'),
  (new Date) + ' ' + (bytes.length - clean.length) + ' bytes removed\n'
)

