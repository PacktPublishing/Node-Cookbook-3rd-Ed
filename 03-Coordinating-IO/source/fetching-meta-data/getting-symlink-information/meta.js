'use strict'

const fs = require('fs')
const path = require('path')
const tableaux = require('tableaux')

const write = tableaux(
  {name: 'Name', size: 20},
  {name: 'Created', size: 30},
  {name: 'Inode', size: 10},
  {name: 'Mode', size: 8},
  {name: 'Lnks', size: 4},
  {name: 'Size', size:  6}
)

function print(dir) {
  fs.readdirSync(dir)
    .map((file) => ({file, dir}))
    .map(toMeta)
    .forEach(output)
  write.newline()
}

function toMeta({file, dir}) {
  const stats = fs.lstatSync(path.join(dir, file))
  let {birthtime, ino, mode, nlink, size} = stats
  birthtime = birthtime.toUTCString()
  mode = mode.toString(8)
  size += 'B'
  return {
    file,
    dir,
    info: [birthtime, ino, mode, nlink, size],
    isDir: stats.isDirectory(),
    isSymLink: stats.isSymbolicLink()
  }
}

function output({file, dir, info, isDir, isSymLink}) {
  if (isSymLink) {
    outputSymlink(file, dir, info)
    return
  }
  write(file, ...info)
  if (!isDir) { return }
  const p = path.join(dir, file)
  write.arrow()
  fs.readdirSync(p).forEach((f) => {
    const stats = fs.lstatSync(path.join(p, f))
    const style = stats.isDirectory() ? 'bold' : 'dim'
    if (stats.isSymbolicLink()) { f = '\u001b[33m' + f + '\u001b[0m'}
    write[style](f)
  })
  write.newline()
}

function outputSymlink(file, dir, info) {
  write('\u001b[33m' + file + '\u001b[0m', ...info)
  process.stdout.write('\u001b[33m')
  write.arrow(4)
  write.bold(fs.readlinkSync(path.join(dir, file)))
  process.stdout.write('\u001b[0m')
  write.newline()
}

print(process.argv[2] || '.')
