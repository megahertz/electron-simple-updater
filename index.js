'use strict';

const { autoUpdater } = require('electron');
const events          = require('events');

const win32            = require('./lib/win32');
const getUpdatesMeta   = require('./lib/get-updates-meta');
const normalizeOptions = require('./lib/normalize-options');


class SimpleUpdater extends events.EventEmitter {
  init(options) {
    this.options = normalizeOptions(options);
  }

  setFeedURL(url) {
    if (!this.options) {
      this.init(url);
    } else {
      this.options.url = url;
    }
  }

  getFeedURL() {
    return this.options ? this.options.url : null;
  }

  checkForUpdates() {
    getUpdatesMeta(this.options.url)
  }

  quitAndInstall() {
    return autoUpdater.quitAndInstall();
  }
}

return new SimpleUpdater();