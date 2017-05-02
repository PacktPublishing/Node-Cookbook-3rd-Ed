'use strict'

const fs = require('fs')

const exists = (file) => new Promise((resolve, reject) => {
  fs.access(file, (err) => {
    if (err) {
      if (err.code !== 'ENOENT') { return reject(err) }
      return resolve({file, exists: false})
    }
    resolve({file, exists: true})
  })  
})

exists(process.argv[2])
  .then(({file, exists}) => console.log(`"${file}" does${exists ? '' : ' not'} exist`))
  .catch(console.error)