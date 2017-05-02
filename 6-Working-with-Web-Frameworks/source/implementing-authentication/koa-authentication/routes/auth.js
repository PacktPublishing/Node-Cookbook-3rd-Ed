'use strict'

const router = require('koa-router')()

router.get('/login', async (ctx) => {
  await ctx.render('login', {fail: false})
})

router.post('/login', async (ctx) => {
  const { session, request } = ctx
  const { body } = request
  if (session.user) {
    ctx.redirect('/')
    return
  }
  if (body.un === 'dave' && body.pw === 'ncb') {
    session.user = {name: body.un}
    ctx.redirect('/')
    return
  }

  await ctx.render('login', {fail: true})
})

router.get('/logout', async (ctx, next) => {
  ctx.session.user = null
  ctx.redirect('/')
})

module.exports = router