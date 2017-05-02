'use strict'

const {join} = require('path')
const Koa = require('koa')
const serve = require('koa-static')
const router = require('koa-router')()
const index = require('./routes/index')

const app = new Koa()
const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000

if (dev) {
  app.use(serve(join(__dirname, 'public')))
}

router.use('/', index.routes())

app.use(router.routes())

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
