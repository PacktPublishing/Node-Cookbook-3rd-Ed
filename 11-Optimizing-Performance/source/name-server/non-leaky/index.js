const http = require('http')
const starwarsName = require('starwars-names').random
const names = {}

http.createServer((req, res) => {
  res.end(`Your unique name is:  ${createName(req)} \n`)
}).listen(8080)

function createName () {
  var result = starwarsName()
  names[result] = names[result] ? 
    names[result] + 1 :
    1
  return result + names[result]
}