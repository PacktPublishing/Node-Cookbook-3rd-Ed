'use strict'

module.exports = devStatic 

function devStatic (server) {
  server.select(['dev', 'staging']).route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: 'public'
      }
    }
  })
}
