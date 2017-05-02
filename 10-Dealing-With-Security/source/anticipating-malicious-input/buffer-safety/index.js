'use strict'

const http = require('http')

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    if (req.url === '/') return res.end(html())
    res.setHeader('Content-Type', 'application/json')
    if (req.url === '/friends') return res.end(friends())
    
    return
  }
  if (req.method === 'POST') {
    if (req.url === '/') return action(req, res) 
  }
})

function html (res) {
  return `
    <div id=friends></div>
    <form>
      <input id=friend> <input type=submit value="Add Friend">
    </form>
    <script>
      void function () {
        var friend = document.getElementById('friend')
        var friends = document.getElementById('friends')
        function load () {
          fetch('/friends', {
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            }
          }).catch((err) => console.error(err))
            .then((res) => res.json())
            .then((arr) => friends.innerHTML = arr.map((f) => atob(f)).join('<br>'))
        }
        load()

        document.forms[0].addEventListener('submit', function () {
          fetch('/', {
            method: 'post', 
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({cmd: 'add', friend: friend.value})
          }).catch((err) => console.error(err))
            .then(load)
        })
      }()
    </script>
  `
}

function friends () {
  return JSON.stringify(friends.list)
}
friends.list = [Buffer('Dave').toString('base64')]
friends.add = (friend) => friends.list.push(Buffer(friend).toString('base64'))

function action (req, res) {
  var data = ''
  req.on('data', (chunk) => data += chunk)
  req.on('end', () => {
    try {
      data = JSON.parse(data)
    } catch (e) {
      res.end('{"ok": false}')
      return
    }
    if (data.cmd === 'add') {
      friends.add(data.friend)
    }
    res.end('{"ok": true}')
  })
}

server.listen(3000)