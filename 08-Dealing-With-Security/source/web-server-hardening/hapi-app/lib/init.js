'use strict';

module.exports.connections = function(server, config) {
  require('./server').connection(server, config);
};

module.exports.registers = function(server) {
  server.register([{
      register: require('./logs').register,
      options: require('./logs').options
    }, {
      register: require('nes')
    }, {
      register: require('vision')
    }, {
      register: require('inert')
    }, {
      register: require('./server').register,
      select: ['server']
    }], (err) => {
      if (err) {
        throw err;
      }
  });
};

module.exports.views = function(server) {
  server.views({  
    engines: {
        html: require('handlebars')
    },
    path: __dirname + '/views',
    layout: false
    //layoutPath: 'views/layout',
    //layout: 'default',
    //helpersPath: 'views/helpers',
    //partialsPath: 'views/partials'
  });
}