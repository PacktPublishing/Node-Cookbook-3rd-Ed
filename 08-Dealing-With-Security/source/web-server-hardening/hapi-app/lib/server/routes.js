'use strict';

module.exports = function(server) {
  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply.view('index');
    }
  });
  server.route({
    method: 'GET',
    path: '/hello',
    handler: function (request, reply) {
      const data = { 
        message1: 'Hello',
        message2: 'Paris, France'
      };
      reply.view('hello', data);
    }
  });
};
