const {Router} = require('express')
const router = Router()

router.get('/', function(req, res, next) {
  const title = 'Express'
  res.send(`
    <html>
      <head>
        <title> ${title} </title>
        <link rel="stylesheet" href="styles.css">
      </head>
      <body>
        <h1> ${title} </h1>
        <p> Welcome to ${title} </p>
      </body>
    </html>
  `)
})

module.exports = router
