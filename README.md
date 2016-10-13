# electron-simple-updater
[![Build Status](https://travis-ci.org/megahertz/electron-simple-updater.svg?branch=master)](https://travis-ci.org/megahertz/electron-simple-updater)
[![npm version](https://badge.fury.io/js/electron-simple-updater.svg)](https://badge.fury.io/js/electron-simple-updater)

# This package is not ready for production. It'll be ready in a few days.

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

```js
// Just place this code at the entry point of your application:
const updater = require('electron-simple-updater');
updater.init('http://example.com/updates.json');
```
    
## Related
 - [electron-builder](https://github.com/electron-userland/electron-builder) -
 A complete solution to package and build an Electron app
    
    
## License

Licensed under MIT.