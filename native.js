#!/usr/bin/env node

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

onmessage.on('data', function (d) {
  const {event, data} = JSON.parse(d.toString())

  if (event === 'prepare') {
    try {
      const key = toBuf(data)
      archives[data] = hyperdrive(function () {
        return ram()
      }, key)

      archives[data].ready(function() {
        swarms[data] = swarm(archives[data])
        swarms[data].on('connection', (peer, info) => {
          console.error('Swarm connection', info)
        })

        streams[data] = archives[data].replicate({live: true})
        streams[data].on('error', function (err) {
          console.error('error rep', err.message)
        })
        send('replicate')
      })
    } catch (e) {
      send('error', e.message)
    }

    return
  }

  if (event === 'write') {
    streams[data.key].write(Buffer.from(data.data))
    return
  }

  if (event === 'read') {
    send('read', streams[data.key].read(data.data))
    return
  }

})

