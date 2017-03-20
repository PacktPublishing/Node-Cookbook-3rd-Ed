'use strict';

module.exports.connection = function(server, config) {
  server.connection({
    host: config.connections[0].server.host,
    port: config.connections[0].server.port,
    labels: config.connections[0].server.labels
  });
};

// register plugin
module.exports.register = function (server, options, next) {
  require('./routes')(server);
  next();
};
 
module.exports.register.attributes = {
  pkg: require('./package.json')
};