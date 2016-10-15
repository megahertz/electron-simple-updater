# electron-simple-updater
[![Build Status](https://travis-ci.org/megahertz/electron-simple-updater.svg?branch=master)](https://travis-ci.org/megahertz/electron-simple-updater)
[![npm version](https://badge.fury.io/js/electron-simple-updater.svg)](https://badge.fury.io/js/electron-simple-updater)

## Description

This module allows to automatically update your application. Your only
need to install this module and write two lines of code! To publish
your updates you just need a simple file hosting, it does not require
a dedicated server.

Support OS: 
 - Mac, ([Squirrel.Mac](https://github.com/Squirrel/Squirrel.Mac))
 - Windows ([Squirrel.Windows](https://github.com/Squirrel/Squirrel.Windows))
 - Linux (for [AppImage](http://appimage.org/) format)

## Installation

Install with [npm](https://npmjs.org/package/electron-simple-updater):

    npm install --save electron-simple-updater

## Usage

### Publish a new release
1. Build your release using electron-builder or another tool and upload it
to a file hosting.
2. Create a file updates.js which contains link to your new release and
upload it to a file hosting:
```json
{
  "linux-x64-prod": {
    "updateUrl": "https://github.com/megahertz/electron-simple-updater/releases/download/example-linux-x64-prod-v0.0.2/simple-updater-example-0.0.2-x86_64.AppImage",
    "version": "0.0.2",
    "platform": "linux",
    "readme": "Second version"
  },
  "win32-x64-prod": {
    "updateUrl": "https://github.com/megahertz/electron-simple-updater/releases/download/example-win32-x64-prod-v0.0.2",
    "version": "0.0.2",
    "platform": "win32",
    "readme": "Second version"
  },
  "darwin-x64-prod": {
    "updateUrl": "https://github.com/megahertz/electron-simple-updater/releases/download/example-darwin-x64-prod-v0.0.2/release.json",
    "version": "0.0.2",
    "platform": "darwin",
    "readme": "Second version"
  }
}
```

### Insert a link to updates.json to your code
```js
// Just place this code at the entry point of your application:
const updater = require('electron-simple-updater');
updater.init('https://raw.githubusercontent.com/megahertz/electron-simple-updater/master/example/updates.json');
```
You can set this link in package.json:updater.url instead.

### That's it!
Now your application will check for updates on start and download it 
automatically if an update is available. After app is restarted a new
version will be loaded. But you can customize it to ask a user if he
would like to install updates. See [the example](example) for details.
    
## Related
 - [electron-builder](https://github.com/electron-userland/electron-builder) -
 A complete solution to package and build an Electron app
    
    
## License

Licensed under MIT.