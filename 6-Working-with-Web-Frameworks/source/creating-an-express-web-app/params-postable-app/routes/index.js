'use strict'

const {Router} = require('express')
const router = Router()

router.get('/:name?', function (req, res) {
  const title = 'Express'
  // CAUTION: never place user input
  // directly into HTML output in production
  // without sanitizing it first. Otherwise, we make
  // ourselves vulnerable to XSS attacks.
  // See Chapter 8 Dealing with Security for details 
  const name = req.params.name
  res.send(`
    <html>
      <head>
        <title> ${title} </title>
        <link rel="stylesheet" href="styles.css">
      </head>
      <body>
        <h1> ${title} </h1>
        <p> Welcome to ${title}${name ? `, ${name}.` : ''} </p>
        <form method=POST action=data>
        Name: <input name=name> <input type=submit>
        </form>
      </body>
    </html>
  `)
})

router.post('/data', function (req, res) {
  res.redirect(`/${req.body.name}`)
})

module.exports = router
