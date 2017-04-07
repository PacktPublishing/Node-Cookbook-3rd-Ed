module.exports = function () {

  function add (args, cb) {
    console.log('add called: ' + args.first + '+' + args.second)
    var result = parseInt(args.first, 10) + parseInt(args.second, 10)
    cb(null, result)
  }

  return {
    add: add
  }
}
