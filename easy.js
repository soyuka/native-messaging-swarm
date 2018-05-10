const hyperdrive = require('hyperdrive')
const hyperdiscovery = require('hyperdiscovery')

const archive = hyperdrive('easy')

archive.ready(function () {
  console.log('Key: %s', archive.key.toString('hex'))
  const swarm = hyperdiscovery(archive)

  archive.writeFile('dat.json', JSON.stringify({url: `dat://${archive.key.toString('hex')}`}), function() {
    console.log('written')
  })
})
