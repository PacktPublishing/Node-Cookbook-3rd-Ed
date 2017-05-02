'use strict'

module.exports = service

function service () {
  function add (args, cb) {
    const {first, second} = args
    console.log(`add called: ${first} ${second}`)
    const result = (parseInt(first, 10) + parseInt(second, 10))
    cb(null, {result: result.toString()})
  }

  return { add }
}