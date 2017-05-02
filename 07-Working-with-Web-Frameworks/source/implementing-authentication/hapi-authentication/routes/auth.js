'use strict'

module.exports = auth

function auth (server) {

  server.route({
    method: ['GET', 'POST'],
    path: '/auth/login',
    handler: function (request, reply) {
      if (request.auth.isAuthenticated) {
        reply.redirect('/');
        return
      }

      if (request.method === 'get') {
        reply.view('login', {fail: false})
        return
      }

      if (request.method === 'post') {
        if (request.payload.un === 'dave' && request.payload.pw === 'ncb') {
          request.yar.set('user', {name: request.payload.un})
          reply.redirect('/')
        } else {
          reply.view('login', {fail: true})
        }
      }
    }
  })


  server.route({
    method: 'GET',
    path: '/auth/logout',
    handler: function (request, reply) {
      request.yar.reset()
      reply.redirect('/')
    }
  })
}