const hyperdrive = require('hyperdrive')
const pump = require('pump')
const {Duplex} = require('stream')
const NativeEventEmitter = require('./eventemitter.js')

const archive = hyperdrive('./test')
// Uses runtime.connectNative with a send/on api
const port = new NativeEventEmitter(`${__dirname}/native.js`)

archive.ready(() => {
  archive.writeFile('/hello.txt', 'world', function (err) {
    rep(function () {
      // rep(() => {})
    })
  })
})


port.on('error', function(err) {
  console.error('got err upstream', err)
})
function rep(cb) {
  const hexKey = archive.key.toString('hex')
  console.log(hexKey)

  port.on('replicate', function () {
    const stream = archive.replicate({live: true})
    const replicate = new Duplex({
      read(size) {
        port.once('read', (data) => {
          this.push(data)
        })

        port.send('read', {key: hexKey, data: size})
      },
      write(chunk, encoding, cb) {
        port.send('write', {
          key: hexKey,
          data: chunk
        })

        cb()
      }
    })

    replicate.pipe(stream).pipe(replicate)

    stream.on('end', () => {
      console.log('end rep')
      cb && cb()
    })
  })

  port.send('prepare', hexKey)
}
