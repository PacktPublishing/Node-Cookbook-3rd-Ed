var request = require('superagent')
var test = require('tap').test

test('add test', function (t) {
  t.plan(2)

  request
    .post('http://localhost:3000/add/calculate')
    .send('first=1')
    .send('second=2')
    .end(function (err, res) {
      t.equal(err, null)
      t.ok(/result = 3/ig.test(res.text))
    })
})

