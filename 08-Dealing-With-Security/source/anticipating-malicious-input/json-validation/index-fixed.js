'use strict'

const http = require('http')
const Ajv = require('ajv')
const ajv = new Ajv
const schema = {
  title: 'UserReg',
  properties: {
    id: {type: 'integer'},
    name: {type: 'string'},
    privileges: {
      anyOf: [
        {type: 'string'},
        {type: 'boolean'},
        {type: 'array', items: {type: 'string'}},
        {type: 'object'}
      ]
    }
  },
  additionalProperties: false,
  required: ['id', 'name']
}
const validate = ajv.compile(schema)
const {STATUS_CODES} = http

const server = http.createServer((req, res) => {

  if (req.method !== 'POST') {
    res.statusCode = 404
    res.end(STATUS_CODES[res.statusCode])
    return
  }
  if (req.url === '/register') {
    register(req, res)
    return
  }
  res.statusCode = 404
  res.end(STATUS_CODES[res.statusCode])
    
})

function register (req, res) {
  var data = ''
  req.on('data', (chunk) => data += chunk)
  req.on('end', () => {
    try {
      data = JSON.parse(data)
    } catch (e) {
      res.end('{"ok": false}')
      return
    }
    const valid = validate(data, schema)
    if (!valid) {
      console.error(validate.errors)
      res.end('{"ok": false}')
      return
    }
      
    if (data.hasOwnProperty('privileges')) {
      createAdminUser(data)
      res.end('{"ok": true, "admin": true}')
    } else {
      createUser(data)
      res.end('{"ok": true, "admin": false}')
    }
  })
}

function createAdminUser (user) {
  const key = user.id + user.name
  // ... 
}

function createUser (user) {
  // ... 
}

server.listen(3000)