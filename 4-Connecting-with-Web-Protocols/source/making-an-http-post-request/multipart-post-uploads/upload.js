var http = require('http')
var fs = require('fs')
var urlOpts = 
var boundary = Date.now()
urlOpts.headers = {
  'Content-Type': 'multipart/form-data; boundary="' + boundary + '"'
}
boundary = '--' + boundary

var req = http.req({
  host: 'localhost',
  path: '/',
  port: 8080,
  method: 'POST'
}, function (res) => {
  res.on('data', function (chunk) {
    console.log(chunk.toString())
  })
}).on('error', function (e) {
  console.log('error:' + e.stack)
})

assemble(process.argv.slice(2, process.argv.length))

function assemble (files) {
  var progress = 0
  var f = files.shift()
  var fSize = fs.statSync(f).size

  fs.createReadStream(f)
    .once('open', function () {
      req.write(boundary + '\r\n' +
                   'Content-Disposition: ' +
                   'form-data; name="userfile"; filename="' + f + '"\r\n' +
                   'Content-Type: application/octet-stream\r\n' +
                   'Content-Transfer-Encoding: binary\r\n\r\n')
    })
    .on('data', function (chunk) {
      req.write(chunk)
      progress += chunk.length
      console.log(f + ': ' + Math.round((progress / fSize) * 10000) / 100 + '%')
    })
    .on('end', function () {
      if (files.length) { 
        return assemble(files) 
      }
      req.end('\r\n' + boundary + '--\r\n\r\n\r\n')
    })
}



