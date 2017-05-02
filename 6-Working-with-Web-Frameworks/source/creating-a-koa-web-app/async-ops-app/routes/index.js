'use strict'

const router = require('koa-router')()

router.get('/', async function (ctx, next) {
  const title = await pretendDbLookup('title')
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
})

function pretendDbLookup () {
  return Promise.resolve('Koa')
} 

module.exports = router
