'use strict'

const {join} = require('path')
const Koa = require('koa')
const serve = require('koa-static')
const views = require('koa-views')
const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const session = require('koa-generic-session')
const pino = require('pino')()
const logger = require('koa-pino-logger')({
  instance: pino
})
const index = require('./routes/index')
const auth = require('./routes/auth')

const app = new Koa()
const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000

app.keys = ['koa has integrated secret management']

app.use(views(join(__dirname, 'views'), {
  extension: 'ejs'
}))

app.use(logger)
app.use(session())
app.use(bodyParser())


if (dev) {
  app.use(serve(join(__dirname, 'public')))
}

router.use('/', index.routes())
router.use('/auth', auth.routes())

app.use(router.routes())

app.listen(port, () => {
  pino.info(`Server listening on port ${port}`)
})