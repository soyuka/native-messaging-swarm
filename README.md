Native messaging swarm
======================

## Installation

```
npm install native-messaging-swarm
```

## Usage

```javascript
const runtime = require('browser.runtime') // or window.runtime
const hyperdrive = require('hyperdrive')
const swarm = require('native-messaging-swarm')

const archive = hyperdrive('./test')
const port = runtime.connectNative(`${__dirname}/native.js`)

archive.ready(() => {
  // shares the archive through tcp/udp from the native app
  swarm(archive, port)
})
```

## Example

Thanks to `browser.runtime`, on nodejs it'll `spawn` a new process that mimics the native messaging app. In the future the native app can be packaged (https://github.com/zeit/pkg) and would work through a native messaging manifest (see [WebExtensions](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Native_messaging)).

Test this already by launching `node example.js`. It'll start an archive with a `dat.json` and share it through `hyperdiscovery` with the native app.
To clone using `hyperdiscovery` use `node clone.js [key]`.
