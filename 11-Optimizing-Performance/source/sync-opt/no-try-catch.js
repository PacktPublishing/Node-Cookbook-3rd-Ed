'use strict'

// function divideByAndSum (num, array) {
//   var result = 0

//   if (num === 0) {
//     return 0
//   }

//   for (var i = 0; i < array.length; i++) {
//     result += array[i] / num
//   }

//   return result
// }

function divideByAndSum (num, array) {
  try {
    array.map(function (item) {
      return item / num
    }).reduce(function (acc, item) {
      return acc + item
    }, 0)
  } catch (err) {
    // to guard for division by zero
    return 0
  }
}

module.exports = divideByAndSum
