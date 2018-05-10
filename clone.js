const hyperdrive = require('hyperdrive')
const hyperdiscovery = require('hyperdiscovery')
const ram = require('random-access-memory')

const key = process.argv[2]

const archive = hyperdrive(function () {
  return ram()
}, key)

archive.ready(function () {
  const swarm = hyperdiscovery(archive)

  // archive.readdir('/', function(err, d) {
  //   console.log(d)
  // })
  // setTimeout(() => {
  //   console.log('t')
  //   archive.stat('dat.json', function (err, d) {
  //     console.log(err, d)
  //   })
  // }, 2000)
})
