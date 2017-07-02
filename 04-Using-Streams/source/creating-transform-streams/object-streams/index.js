'use strict'

const through = require('through2')
const { serialize } = require('ndjson')

const xyz = through.obj(({x, y}, enc, cb) => {
  cb(null, {z: x + y})
})

xyz.pipe(serialize()).pipe(process.stdout)

xyz.write({x: 199, y: 3})

xyz.write({x: 10, y: 12})
