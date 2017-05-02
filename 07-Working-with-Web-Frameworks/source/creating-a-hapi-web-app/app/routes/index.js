'use strict'

module.exports = index 

function index (server) {
  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      const title = 'Hapi'
      reply(`
        <html>
          <head>
            <title> ${title} </title>
            <link rel="stylesheet" href="styles.css">
          </head>
          <body>
            <h1> ${title} </h1>
            <p> Welcome to ${title} </p>
          </body>
        </html>
      `)
    }
  })
}
