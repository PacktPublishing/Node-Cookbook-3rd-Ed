'use strict'

const chokidar = require('chokidar')
const human = require('human-time')
const watcher = chokidar.watch(process.argv[2] || '.', {
  alwaysStat: true
})

watcher.on('ready', () => {
  watcher
    .on('add', (file, stat) => {
      console.log(`${file} created ${human((stat.birthtime))}`)
    })
    .on('unlink', (file) => {
      console.log(`${file} removed`)
    })
    .on('change', (file, stat) => {
      const msg = (+stat.ctime === +stat.mtime) ? 'updated' : 'modified'
      console.log(`${file} ${msg} ${human((stat.ctime))}`)
    })
    .on('addDir', (dir, stat) => {
      console.log(`${dir} folder created ${human((stat.birthtime))}`)
    })
    .on('unlinkDir', (dir) => {
      console.log(`${dir} folder removed`)
    })
})
  