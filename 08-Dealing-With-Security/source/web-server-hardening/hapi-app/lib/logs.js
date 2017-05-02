'use strict';

// logging to console
const logs = {
  register: require('good'),
  options: {
    ops: {
      interval: 60 * 1000
    },
    reporters: {
      console: [{
          module: 'good-console',
          args: [ { log: '*', response: '*', request: '*' } ]
        },
        'stdout'
      ]
    }
  }
};

module.exports = logs;