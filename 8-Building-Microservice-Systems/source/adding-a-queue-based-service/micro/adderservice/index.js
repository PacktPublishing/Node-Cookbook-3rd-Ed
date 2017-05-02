'use strict'

const wiring = require('./wiring')
const service = require('./service')()


wiring(service)
