const runtime = require('browser.runtime')
const hyperdrive = require('hyperdrive')
const pump = require('pump')
const {Duplex, PassThrough, Transform} = require('stream')
const NativeEventEmitter = require('./eventemitter.js')

const archive = hyperdrive('./test')
// Uses runtime.connectNative with a send/on api
// const port = new NativeEventEmitter(`${__dirname}/native.js`)
const port = runtime.connectNative(`${__dirname}/native.js`)

archive.ready(() => {
  const hexKey = archive.key.toString('hex')
  archive.writeFile('dat.json', JSON.stringify({url: `dat://${hexKey}`, title: 'test'}), function (err) {
    const stream = archive.replicate({live: true, upload: true, download: true, timeout: 0})

    const output = new Transform({
      transform(chunk, enc, cb) {
        console.log('message out', chunk.length)
        port.postMessage(chunk)
        cb()
      }
    })

    const input = new PassThrough()

    port.onMessage.addListener((message) => {
      const buff = Buffer.from(message)
      console.log('message in', buff.length)
      input.write(buff)
    })

    pump(stream, output, function (err) {
      console.log('out ends')
    })

    pump(input, stream, function (err) {
      console.log('in ends')
    })
  })
})

// port.on('error', function(err) {
//   console.error('got err upstream', err)
// })
//
// function rep(cb) {
//   const hexKey = archive.key.toString('hex')
//   console.log(hexKey)
//
//   port.on('replicate', function () {
//     const stream = archive.replicate({live: true, upload: true, download: true, timeout: 0})
//
//     // Should we send read instructions from the "native"?
//     // port.on('read', function (d) {
//     //   if (d.key !== hexKey) return
//     //   // port.send('read', {key: d.key, data: stream.read(d.data)})
//     // })
//
//     const replicate = new Duplex({
//       read(size) {
//       },
//       write(chunk, encoding, cb) {
//         port.send('write', {
//           key: hexKey,
//           data: chunk
//         })
//
//         port.once('writend', cb)
//       }
//     })
//
//     stream.pipe(replicate)
//     // replicate.pipe(stream).pipe(replicate)
//
//     stream.on('error', (err) => {
//       console.error('err', err.message)
//     })
//
//     // useful?
//     // stream.on('end', () => {
//     //   console.log('end rep')
//     //   port.send('finalize', {key: hexKey})
//     //   stream.finalize()
//     //   cb && cb()
//     // })
//   })
//
//   port.send('prepare', hexKey)
// }
