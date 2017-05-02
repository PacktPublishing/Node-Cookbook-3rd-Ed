'use strict'

const benchmark = require('benchmark')
const slow = require('./slow')
const noCollection = require('./no-collections')
const noTryCatch = require('./no-try-catch')
const funcStatus = require('./func-status')

const suite = new benchmark.Suite()

const numbers = []

for (let i = 0; i < 1000; i++) {
  numbers.push(Math.random() * i)
}

suite.add('slow', function () {
  slow(12, numbers)
})

suite.add('no-collections', function () {
  noCollection(12, numbers)
})

suite.add('no-try-catch', function () {
  noTryCatch(12, numbers)
})

suite.on('complete', print)

suite.run()

function print () {
  for (var i = 0; i < this.length; i++) {
    console.log(this[i].toString())
  }
  funcStatus('slow', slow)
  funcStatus('noCollection', noCollection)
  funcStatus('noTryCatch', noTryCatch)

  console.log('Fastest is', this.filter('fastest').map('name')[0])
}
