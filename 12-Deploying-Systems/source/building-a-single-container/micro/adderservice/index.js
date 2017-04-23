'use strict'
console.log('HI!')
const wiring = require('./wiring')
const service = require('./service')()

wiring(service)