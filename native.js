#!/usr/bin/env node

const {Duplex, PassThrough, Transform} = require('stream')
const {toBuf} = require('dat-encoding')
const {NativeEncoder, NativeDecoder} = require('browser.runtime')
const hyperdrive = require('hyperdrive')
const swarm = require('hyperdiscovery')
const onmessage = new PassThrough()
const postMessage = new PassThrough()
const ram = require('random-access-memory')
const pump = require('pump')

// pump(process.stdin, NativeDecoder(), onmessage, function (err) {})
// pump(postMessage, NativeEncoder(), process.stdout, function (err) {})

const key = `39d494a6728654721f5b857030bdccf3c5807ddcf8f62399f0bdadf5a22e3b62`
const archive = hyperdrive('rep', key, {sparse: false})
const stream = archive.replicate({live: true, upload: true, download: true, timeout: 0})

stream.on('error', function (err) {
  console.error('err st', err)
})

const input = new Transform({
  transform(chunk, enc, cb) {
    const buffer = Buffer.from(JSON.parse(chunk.toString()))
    // console.error('in', buffer.length)
    cb(null, buffer)
  }
})

const output = new Transform({
  transform(chunk, enc, cb) {
    // console.error('out', buffer.length)
    cb(null, JSON.stringify(chunk))
  }
})


pump(process.stdin, NativeDecoder(), input, stream, function (err) {
  console.error('in ends')
})

pump(stream, output, NativeEncoder(), process.stdout, function (err) {
  console.error('out ends')
})

archive.ready(() => {
  setTimeout(() => {
    archive.readFile('dat.json', (err, d) => {
      console.error('test', err, d.toString())
    })
  }, 1000)
})

// pump(stream, NativeEncoder(), process.stdout, function (err) {})

// const archives = {}
// const streams = {}
// const swarms = {}
//
// function send(event, data) {
//   postMessage.write(JSON.stringify({event: event, data: data}))
// }
//
// function init(key) {
//
//   const stream = archives[key].replicate({live: true, upload: true, download: true, timeout: 0})
//   streams[key] = new PassThrough()
//
//   pump(stream, streams[key], function (err) {
//     console.log('end rep')
//   })
//
//   streams[key].on('error', function (err) {
//     console.error('error rep', err.message)
//   })
//
//   // should we send read instructions?
//   // const replicate = new Duplex({
//   //   read(size) {
//   //     send('read', {key: key, data: size})
//   //   },
//   //   write(chunk, encoding, cb) {
//   //     cb()
//   //   }
//   // })
//   //
//   // replicate.pipe(streams[key]).pipe(replicate)
//
//   swarms[key] = swarm(archives[key], {stream: () => stream})
//   swarms[key].on('connection', (peer, info) => {
//     console.error('Swarm connection')
//   })
//   send('replicate')
// }
//
// onmessage.on('data', function (d) {
//   const {event, data} = JSON.parse(d.toString())
//
//   console.error('Got event %s', event)
//
//   if (event === 'prepare') {
//     try {
//       const key = toBuf(data)
//
//       if (typeof archives[data] === 'undefined') {
//         archives[data] = hyperdrive('rep', key, {sparse: false})
//
//         archives[data].ready(function() {
//           init(data)
//         })
//
//         setTimeout(() => {
//           archives[data].readdir('/', function (e, d) {
//             console.error(e, d)
//           })
//         }, 1000)
//         return
//       }
//
//       init(data)
//     } catch (e) {
//       send('error', e.message)
//     }
//     return
//   }
//
//   if (event === 'write') {
//     streams[data.key].write(Buffer.from(data.data), null, function() {
//       send('writend')
//     })
//     return
//   }
//
//   // data read from index.js
//   if (event === 'read') {
//     console.error('read', data)
//     // send('read', streams[data.key].read(data.data))
//     return
//   }
//
//   if (event === 'finalize') {
//     // streams[data.key].finalize()
//     return
//   }
// })
//
