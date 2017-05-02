var test = require('tap').test
var service = require('../service')()

test('test add', function (t) {
  t.plan(2)

  service.add({first: 1, second: 2}, function (err, result) {
    t.equal(err, null)
    t.equal(result, 3)
  })
})

