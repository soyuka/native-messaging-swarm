#!/usr/bin/env node

const {PassThrough, Transform} = require('stream')
const {NativeEncoder, NativeDecoder} = require('browser.runtime')
const hyperdrive = require('hyperdrive')
const swarm = require('hyperdiscovery')
const ram = require('random-access-memory')
const pump = require('pump')

const archives = {}
const streams = {}

const output = new PassThrough()
const input = new Transform({
  transform(chunk, enc, cb) {
    const buffer = JSON.parse(chunk.toString())

    // data to write to the replication stream
    if (buffer.event === 'write') {
      const data = Buffer.from(buffer.data)
      console.error('[native] (%s) index => native: ', buffer.key, data.length)
      streams[buffer.key].write(data)
      cb()
      return
    }

    // prepare event if not write
    const key = buffer.key

    if (archives[key]) {
      cb()
      return
    }

    console.error('preparing %s', key)
    archives[key] = hyperdrive(() => ram(), key, {sparse: false})
    streams[key] = archives[key].replicate({live: true, upload: true, download: true, timeout: 0})
    // on data write the data to origin
    streams[key].on('data', function (chunk) {
      console.error('[native] (%s) native => index: ', key, chunk.length)
      output.write(JSON.stringify({key: key, event: 'write', data: chunk}))
    })

    streams[key].on('error', function (err) {
      console.error('error in replication stream', err.message)
    })

    archives[key].ready(() => {
      swarm(archives[key])
      output.write(JSON.stringify({key: key, event: 'ready'}))
    })

    cb()
  }
})

pump(process.stdin, NativeDecoder(), input, function (err) {
  console.error('in ends', err)
})

pump(output, NativeEncoder(), process.stdout, function (err) {
  console.error('out ends', err)
})
