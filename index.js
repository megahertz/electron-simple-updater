'use strict';

const { autoUpdater } = require('electron');
const events          = require('events');

const win32            = require('./lib/win32');
const getUpdatesMeta   = require('./lib/get-updates-meta');
const normalizeOptions = require('./lib/normalize-options');


class SimpleUpdater extends events.EventEmitter {
  init(options) {
    if (this.options) {
      this.options.logger.warn(
        'electron-simple updater has been initialized before'
      );
    }

    this.options = normalizeOptions(options);

    const squirrelAction = win32.getSquirrelInstallerAction();
    if (squirrelAction) {
      const exitNow = this.options.onSquirrelWinInstaller(squirrelAction);
      if (exitNow) {
        process.exit();
      }
    }

    if (this.options.checkUpdatesOnStart) {
      this.checkForUpdates();
    }

    /**
     * @event update-downloaded
     * @param {Object} meta Update metadata
     */
    autoUpdater.on('update-downloaded', () => {
      const version = this.meta.version;
      this.options.logger.log(`New version ${version} has been downloaded`);
      this.emit('update-downloaded', this.meta);
    });
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
    const opt = this.options;

    if (opt.disabled) {
      opt.logger.warn(`Update is disabled`);
    }

    getUpdatesMeta(opt.url, opt.build, opt.channel, opt.version)
      .then((updateMeta) => {
        if (updateMeta) {
          this.onFoundUpdate(updateMeta);
        } else {
          opt.logger.log(`Updates for ${this.options.build} are not available`);
          this.emit('update-not-available');
        }
      })
      .catch((e) => {
        opt.logger.warn(e);
        this.emit('error', e);
      });
  }

  downloadUpdate() {
    const feedUrl = autoUpdater.getFeedURL();
    /**
     * @event update-downloading
     * @param {Object} meta Update metadata
     */
    this.emit('update-downloading', this.meta);
    this.options.logger.log(`Downloading updates from ${feedUrl}`);

    if (this.meta.platform === 'linux') {

    } else {
      autoUpdater.checkForUpdates();
    }
  }

  quitAndInstall() {
    return autoUpdater.quitAndInstall();
  }

  /**
   * Called when updates metadata has been downloaded
   * @private
   * @param meta
   */
  onFoundUpdate(meta) {
    this.meta = meta;
    const opt = this.options;

    opt.logger.log(`Found version ${meta.name} at '${meta.updateUrl}'`);
    autoUpdater.setFeedURL(meta.updateUrl);
    /**
     * @event update-available
     * @param {Object} meta Update metadata
     */
    this.emit('update-available', meta);
    if (opt.autoDownload) {
      this.downloadUpdate();
    }
  }
}

module.exports = new SimpleUpdater();