'use strict'

const router = require('koa-router')()

router.get('/', async function (ctx, next) {
  await next()
  const { title } = ctx.state
  ctx.body = `
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
  `
}, async (ctx) => ctx.state = {title: 'Koa'})

module.exports = router
