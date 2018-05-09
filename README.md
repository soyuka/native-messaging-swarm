put good name here
==================

WIP experiment where:
- a browser extension launches a Native Messaging app (`native.js`)
- hyperdrive gets instantiated in the browser
- swarm (hyperdiscovery on tcp/udp) is started from the native app
- hyperdrive is replicated from the browser to the native app

TODO:
- fix timeout error (once replication has ended, `stream.finalize()`?) (`Remote timed out`)
- ability to "clone" a given key from browser. Native will join the swarm at the discovery key and replicate native => browser

## Usage

```
npm install
node index.js
```

On nodejs it'll `spawn` a new process that acts as native messaging app. In the future the native app can be packaged (https://github.com/zeit/pkg) and would work through a native messaging manifest.
