const express = require('express')
const app = express()

app.get('/', (req, res) => res.send('hey'))


setTimeout(function myTimeout() { 
   console.log('I waited for you.')
}, 100)

app.listen(3000)
