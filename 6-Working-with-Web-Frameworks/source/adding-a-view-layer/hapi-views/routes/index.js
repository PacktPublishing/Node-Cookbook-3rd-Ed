'use strict'

module.exports = index 

function index (server) {
  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      const title = 'Hapi'
      reply.view('index', {title})
    }
  })
}
