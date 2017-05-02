'use strict'

const {test} = require('tap')
const service = require('../service')()

test('test add', (t) => {
  t.plan(2)

  service.add({first: 1, second: 2}, (err, answer) => {
    t.error(err)
    t.same(answer, {result: 3})
  })
})
