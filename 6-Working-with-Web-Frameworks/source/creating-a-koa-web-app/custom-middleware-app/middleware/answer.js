'use strict'

module.exports = answer

function answer () {
  return async (ctx, next) => {
    ctx.set('X-Answer', 42)
    await next()
  }
}
