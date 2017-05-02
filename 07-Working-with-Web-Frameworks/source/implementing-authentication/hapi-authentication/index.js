'use strict'

const hapi = require('hapi')
const inert = require('inert')
const vision = require('vision')
const ejs = require('ejs')
const pino = require('pino')()
const hapiPino = require('hapi-pino')
const yar = require('yar')
const routes = {
  index: require('./routes/index'),
  auth: require('./routes/auth'),
  devStatic: require('./routes/dev-static')
}

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000

const server = new hapi.Server()

server.connection({
  host: '127.0.0.1',
  port: port
})

const plugins = dev ? [{
  register: hapiPino,
  options: {instance: pino}
}, {
  register: yar,
  options: {
    cookieOptions: {
      password: 'I really really really like pies',
      isSecure: false
    }
  }
}, vision, inert] : [{
  register: hapiPino,
  options: {instance: pino}
}, {
  register: yar,
  options: {
    cookieOptions: {
      password: 'something more secure than a bit about pies',
      isSecure: true
    }
  }
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
  routes.auth(server)
  
  if (dev) routes.devStatic(server)

  server.start((err) => {
    if (err) throw err
    server.log(`Server listening on port ${port}`)
  })
}