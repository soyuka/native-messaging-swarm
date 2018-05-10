const hyperdrive = require('hyperdrive')
const pump = require('pump')
const {Duplex} = require('stream')
const NativeEventEmitter = require('./eventemitter.js')

const archive = hyperdrive('./test')
// Uses runtime.connectNative with a send/on api
const port = new NativeEventEmitter(`${__dirname}/native.js`)

archive.ready(() => {
  archive.writeFile('dat.json', JSON.stringify({url: `dat://${archive.key.toString('hex')}`, title: 'test'}), function (err) {
    rep()
  })
})

port.on('error', function(err) {
  console.error('got err upstream', err)
})

function rep(cb) {
  const hexKey = archive.key.toString('hex')
  console.log(hexKey)

  port.on('replicate', function () {
    const stream = archive.replicate({live: true, upload: true, download: true, timeout: 0})

    // Should we send read instructions from the "native"?
    // port.on('read', function (d) {
    //   if (d.key !== hexKey) return
    //   // port.send('read', {key: d.key, data: stream.read(d.data)})
    // })

    const replicate = new Duplex({
      read(size) {
      },
      write(chunk, encoding, cb) {
        port.send('write', {
          key: hexKey,
          data: chunk
        })

        port.once('writend', cb)
      }
    })

    replicate.pipe(stream).pipe(replicate)

    stream.on('error', (err) => {
      console.error('err', err.message)
    })

    // useful?
    // stream.on('end', () => {
    //   console.log('end rep')
    //   port.send('finalize', {key: hexKey})
    //   stream.finalize()
    //   cb && cb()
    // })
  })

  port.send('prepare', hexKey)
}
