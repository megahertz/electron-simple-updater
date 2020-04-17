'use strict';

const updater = require('electron-simple-updater');

updater.init()
  .on('update-downloaded', () => updater.quitAndInstall());
