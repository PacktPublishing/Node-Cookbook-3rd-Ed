const content = require('./content')
const {Router} = require('express')
const router = new Router()

router.get('/', (req, res) => {
  res.send(content())
})

module.exports = router