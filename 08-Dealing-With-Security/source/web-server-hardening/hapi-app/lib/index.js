'use strict';

const util = require('util');
const hapi = require('hapi');
const config = require('getconfig');

const init = require('./init');
const server = new hapi.Server();

// init connections before registering plugins
init.connections(server, config);
server.ext('onPreResponse', (request, reply) => {
  var response = request.response.isBoom ? 
    request.response.output : 
    request.response;
  response.headers['X-DNS-Prefetch-Control'] = 'off';
  response.headers['X-DNS-Prefetch-Control'] = 'off';
  response.headers['X-Frame-Options'] = 'SAMEORIGIN';
  response.headers['X-Download-Options'] = 'noopen';
  response.headers['X-Content-Type-Options'] = 'nosniff';
  response.headers['X-XSS-Protection'] = '1; mode=block';
  reply.continue();
});
// register plugins
init.registers(server);
// loading views
init.views(server);

server.start((err) => {
  if (err) {
    throw err;
  }
  server.log('info', 'Server running'); 
});