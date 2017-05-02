'use strict'

const Koa = require('koa')
const serve = require('koa-static')
const router = require('koa-router')()
const {join} = require('path')
const index = require('./routes/index')
const answer = require('./middleware/answer')

const app = new Koa()
const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000

app.use(answer())

if (dev) {
  app.use(serve(join(__dirname, 'public')))
}

router.use('/', index.routes(), index.allowedMethods())

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})