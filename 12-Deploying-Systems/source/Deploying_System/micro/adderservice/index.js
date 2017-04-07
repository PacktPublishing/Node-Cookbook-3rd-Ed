var wiring = require('./wiring')
var service = require('./service')()
wiring(service)
console.log('starting up..')
