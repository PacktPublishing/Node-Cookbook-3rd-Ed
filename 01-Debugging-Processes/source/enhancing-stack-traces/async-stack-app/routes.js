const content = require('./content')
const {Router} = require('express')
const router = new Router()

router.get('/', (req, res) => {
  content()((err, html) => { 
    if (err) {
      res.send(500)
      return
    } 
    res.send(html)
  })
})

module.exports = router