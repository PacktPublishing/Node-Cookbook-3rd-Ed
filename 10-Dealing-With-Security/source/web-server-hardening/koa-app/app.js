const Koa = require('koa')
const helmet = require('koa-helmet')
const app = new Koa()
const router = require('koa-router')()
const views = require('koa-views')
const co = require('co')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const serve = require('koa-static')
const path = require('path')
const log4js = require('koa-log4')
const logger = log4js.getLogger('app')

const index = require('./routes/index')
const users = require('./routes/users')

// middlewares
app.use(helmet())
app.use(bodyparser())
app.use(json())
app.use(log4js.koaLogger(log4js.getLogger('http'), { level: 'auto' }))
app.use(serve(path.join(__dirname, 'public')))

// handle error
onerror(app)

// setup view
app.use(views(path.join(__dirname, 'views'), {
  extension: 'jade'
}))

// logger
// app.use(async (ctx, next) => {
//   const start = new Date()
//   await next()
//   const ms = new Date() - start
//   logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`)
// })
app.use(co.wrap(function * (ctx, next) {
  const start = new Date()
  yield next()
  const ms = new Date() - start
  logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`)
}))

// routes definition
router.use('/', index.routes(), index.allowedMethods())
router.use('/users', users.routes(), users.allowedMethods())

// mount root routes
app.use(router.routes())
	.use(router.allowedMethods())

// log error
app.on('error', function (err, ctx) {
  logger.error(err)
  logger.error('server error', err, ctx)
})

module.exports = app
