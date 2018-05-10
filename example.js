const runtime = require('browser.runtime')
const hyperdrive = require('hyperdrive')
const swarm = require('./')

const archive = hyperdrive('./test')
const port = runtime.connectNative(`${__dirname}/native.js`)

archive.ready(() => {
  swarm(archive, port)
  archive.writeFile('dat.json', JSON.stringify({url: `dat://${archive.key.toString()}`, title: 'test'}), function (err) {
  })
})
