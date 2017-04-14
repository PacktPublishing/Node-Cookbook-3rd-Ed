'use strict'

const hapi = require('hapi')
const inert = require('inert')
const vision = require('vision')
const ejs = require('ejs')
const pino = require('pino')()
const hapiPino = require('hapi-pino')
const routes = {
  index: require('./routes/index'),
  devStatic: require('./routes/dev-static')
}

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000

const server = new hapi.Server()

server.connection({
  host: 'localhost',
  port: port
})

const plugins = dev ? [{
  register: hapiPino,
  options: {instance: pino}
}, vision, inert] : [{
  register: hapiPino,
  options: {instance: pino}
}, vision]

server.register(plugins, start)

function start (err) {
  if (err) throw err
  server.views({
    engines: { ejs },
    relativeTo: __dirname,
    path: 'views'
  })

  routes.index(server)
  
  if (dev) routes.devStatic(server)

  server.start((err) => {
    if (err) throw err
    server.log(`Server listening on port ${port}`)
  })
}