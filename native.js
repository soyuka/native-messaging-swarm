#!/usr/bin/env node

const {Duplex} = require('stream')
const {toBuf} = require('dat-encoding')
const {PassThrough} = require('stream')
const {NativeEncoder, NativeDecoder} = require('browser.runtime')
const hyperdrive = require('hyperdrive')
const swarm = require('hyperdiscovery')
const onmessage = new PassThrough()
const postMessage = new PassThrough()
const ram = require('random-access-memory')
const pump = require('pump')

pump(process.stdin, NativeDecoder(), onmessage, function (err) {})
pump(postMessage, NativeEncoder(), process.stdout, function (err) {})

const archives = {}
const streams = {}
const swarms = {}

function send(event, data) {
  postMessage.write(JSON.stringify({event: event, data: data}))
}

function init(key) {

  streams[key] = archives[key].replicate({live: true, upload: true, download: true, timeout: 0})

  streams[key].on('error', function (err) {
    console.error('error rep', err.message)
  })

  // should we send read instructions?
  // const replicate = new Duplex({
  //   read(size) {
  //     send('read', {key: key, data: size})
  //   },
  //   write(chunk, encoding, cb) {
  //     cb()
  //   }
  // })
  //
  // replicate.pipe(streams[key]).pipe(replicate)

  swarms[key] = swarm(archives[key])
  swarms[key].on('connection', (peer, info) => {
    console.error('Swarm connection')
  })
  send('replicate')
}

onmessage.on('data', function (d) {
  const {event, data} = JSON.parse(d.toString())

  console.error('Got event %s', event)

  if (event === 'prepare') {
    try {
      const key = toBuf(data)

      if (typeof archives[data] === 'undefined') {
        archives[data] = hyperdrive('rep', key, {sparse: false})

        archives[data].ready(function() {
          init(data)
        })
        return
      }

      init(data)
    } catch (e) {
      send('error', e.message)
    }
    return
  }

  if (event === 'write') {
    streams[data.key].write(Buffer.from(data.data), null, function() {
      send('writend')
    })
    return
  }

  // data read from index.js
  if (event === 'read') {
    console.error('read', data)
    // send('read', streams[data.key].read(data.data))
    return
  }

  if (event === 'finalize') {
    // streams[data.key].finalize()
    return
  }
})

