const runtime = require('browser.runtime')

function NativeEventEmitter(native) {
  this.port = runtime.connectNative(native)

  this.port.onMessage.addListener((message) => {
    const listeners = this.listeners[message.event]
    if (typeof listeners === 'undefined') return

    listeners.forEach((l) => l(message.data))
  })

  this.listeners = {}
}

NativeEventEmitter.prototype.send = function (event, data) {
  this.port.postMessage({
    event: event,
    data: data
  })
}

NativeEventEmitter.prototype.on = function (event, fn) {
  if (!this.listeners[event]) {
    this.listeners[event] = []
  }

  this.listeners[event].push(fn)
}

NativeEventEmitter.prototype.once = function (event, fn) {
  if (!this.listeners[event]) {
    this.listeners[event] = []
  }

  const i = this.listeners[event].length
  this.listeners[event].push((data) => {
    fn(data)
    this.listeners[event].splice(i, 1)
  })
}

module.exports = NativeEventEmitter
