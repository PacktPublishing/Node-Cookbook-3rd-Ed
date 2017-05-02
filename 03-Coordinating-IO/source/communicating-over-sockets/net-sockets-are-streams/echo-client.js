'use strict'

process.stdin.pipe(require('net').connect(1338)).pipe(process.stdout)