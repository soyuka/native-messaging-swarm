const runtime = require('browser.runtime')
const hyperdrive = require('hyperdrive')
const pump = require('pump')
const {Duplex, PassThrough, Transform} = require('stream')
const NativeEventEmitter = require('./eventemitter.js')

const archive = hyperdrive('./test')
const stream = archive.replicate({live: true, upload: true, download: true, timeout: 0})
const port = runtime.connectNative(`${__dirname}/native.js`)

archive.ready(() => {
  const hexKey = archive.key.toString('hex')
  port.postMessage({key: hexKey, event: 'prepare'})
  port.onMessage.addListener((message) => {
    if (message.event === 'ready') {
      console.log('[index] ready')

      stream.on('data', function (chunk) {
        console.log('[index] index => native', chunk.length)
        port.postMessage({event: 'write', key: hexKey, data: chunk})
      })
      return
    }

    if (message.event === 'write' && hexKey === message.key) {
      const buff = Buffer.from(message.data)
      console.log('[index] native => index', buff.length)
      stream.write(buff)
      return
    }
  })

  archive.writeFile('dat.json', JSON.stringify({url: `dat://${hexKey}`, title: 'test'}), function (err) {
  })
})
