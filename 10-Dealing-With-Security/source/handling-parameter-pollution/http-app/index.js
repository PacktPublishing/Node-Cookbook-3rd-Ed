const http = require('http')
const qs = require('querystring')

const server = http.createServer((req, res) => {
  try {
    const [href, query] = req.url.split('?')
    switch (href) {
      case '/': return shout(query, res)
      default: return error(404, res) 
    }
  } catch (e) { error(500, res) }
})

function shout (query, res) {
  const msg = qs.parse(query).msg
  const yelling = msg.toUpperCase()
  res.end(yelling)
}

function error(code, res) {
  res.statusCode = code
  res.end(http.STATUS_CODES[code])
}

server.listen(3000)