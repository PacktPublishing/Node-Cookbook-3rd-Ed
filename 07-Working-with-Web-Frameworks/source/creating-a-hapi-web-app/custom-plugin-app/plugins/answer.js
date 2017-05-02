'use strict'

module.exports = answer

function answer (server, options, next) {
  server.ext('response', (request, reply) => {
    request.response.header('X-Answer', 42)
    reply.continue()
  })
  next()
}

answer.attributes = {name: 'answer'}