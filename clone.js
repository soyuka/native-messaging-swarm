const hyperdrive = require('hyperdrive')
const hyperdiscovery = require('hyperdiscovery')
const ram = require('random-access-memory')

const key = process.argv[2]

const archive = hyperdrive(function () {
  return ram()
}, key)

archive.ready(function () {
  const swarm = hyperdiscovery(archive)

  setTimeout(() => {
    archive.readdir('/', function (err, d) {
      console.log(err, d)
    })
  }, 1000)
})
