'use strict'

const router = require('koa-router')()

router.get('/', async function (ctx, next) {
  ctx.state = {
    title: 'Koa'
  }
  ctx.log.info(`rendering index view with ${ctx.state.title}`)
  await ctx.render('index')
  await next()
})

module.exports = router
