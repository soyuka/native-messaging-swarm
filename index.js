function swarm(archive, port, opts = {}) {
  const stream = typeof opts.stream === 'function' ? opts.stream() : archive.replicate({live: true, upload: true, download: true, timeout: 0})
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
}

module.exports = swarm
