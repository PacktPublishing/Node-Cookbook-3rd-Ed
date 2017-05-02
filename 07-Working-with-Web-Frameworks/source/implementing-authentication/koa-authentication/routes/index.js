'use strict'

const router = require('koa-router')()

router.get('/', async function (ctx) {
  const title = 'Koa'
  ctx.log.info(`rendering index view with ${title}`)
  const user = ctx.session.user
  await ctx.render('index', {title, user})
})

module.exports = router

