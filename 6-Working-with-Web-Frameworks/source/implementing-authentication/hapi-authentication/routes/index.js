'use strict'

module.exports = index 

function index (server) {
  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      const title = 'Hapi'
      const user = request.yar.get('user')
      request.logger.info(`rendering index view with ${title}`)
      reply.view('index', {title, user})
    }
  })
}
