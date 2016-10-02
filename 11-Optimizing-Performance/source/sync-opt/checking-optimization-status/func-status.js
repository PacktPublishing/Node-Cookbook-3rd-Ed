'use strict'

function printStatus (name, fn) {
  switch(%GetOptimizationStatus(fn)) {
    case 1: console.log(`${name} function is optimized`); break;
    case 2: console.log(`${name} function is not optimized`); break;
    case 3: console.log(`${name} function is always optimized`); break;
    case 4: console.log(`${name} function is never optimized`); break;
    case 6: console.log(`${name} function is maybe deoptimized`); break;
    case 7: console.log(`${name} function is optimized by TurboFan`); break;
    default: console.log(`${name} function optimization status unknown`); break;
  }
}

module.exports = printStatus
