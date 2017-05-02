'use strict'

const router = require('koa-router')()

router.get('/', async function (ctx, next) {
  await next()
  ctx.log.info(`rendering index view with ${ctx.state.title}`)
  await ctx.render('index') 
}, async (ctx) => ctx.state = {title: 'Koa'})


// simplified: 
// router.get('/', async (ctx, next) => {
// . ctx.log.info(`rendering index view with ${ctx.state.title}`)
//   await ctx.render('index', {title: 'Koa'})
// })

module.exports = router

