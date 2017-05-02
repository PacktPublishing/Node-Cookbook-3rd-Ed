'use strict'

const encode = require('base64-encode-stream')
process.stdin.pipe(encode()).pipe(process.stdout)