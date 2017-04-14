'use strict'

const router = require('koa-router')()

router.get('/', async function (ctx, next) {
  ctx.state = {
    title: 'Koa'
  }
  await ctx.render('index')
  await next()
})

module.exports = router
