const rs = fs.createReadStream('/dev/urandom')
const size = 0

rs.on('data', (data) => {
  size += data.length
  console.log('File size:', size)
})