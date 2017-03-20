const co = require('co')
const router = require('koa-router')()

router.get('/', co.wrap(function *(ctx, next) {
  ctx.state = {
    title: 'Welcome to Koa'
  }
  yield ctx.render('index', {})
}))

// router.get('/', async function (ctx, next) {
//   ctx.state = {
//     title: 'koa2 title'
//   }
//
//   await ctx.render('index', {
//   })
// })
module.exports = router
