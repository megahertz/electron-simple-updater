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
      this.options.logger.info(`New version ${version} has been downloaded`);
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
    if (!this.checkIsInitialized()) return;
    returnthis.options.url;
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
          opt.logger.info(
            `Updates for ${this.buildId} are not available`);
          this.emit('update-not-available');
        }
      })
      .catch((e) => {
        opt.logger.warn(e);
        this.emit('error', e);
      });
  }

  downloadUpdate() {
    let feedUrl = autoUpdater.getFeedURL();
    /**
     * @event update-downloading
     * @param {Object} meta Update metadata
     */
    this.emit('update-downloading', this.meta);


    if (this.meta.platform === 'linux') {
      feedUrl = this.meta.updateUrl;
    } else {
      autoUpdater.checkForUpdates();
    }

    this.options.logger.info(`Downloading updates from ${feedUrl}`);
  }

  quitAndInstall() {
    return autoUpdater.quitAndInstall();
  }

  get build() {
    if (!this.checkIsInitialized()) return;
    return this.options.build;
  }

  get buildId() {
    if (!this.checkIsInitialized()) return;
    return `${this.build}-${this.channel}-v${this.version}`;
  }

  get channel() {
    if (!this.checkIsInitialized()) return;
    return this.options.channel;
  }

  get version() {
    if (!this.checkIsInitialized()) return;
    return this.options.version;
  }

  /**
   * Called when updates metadata has been downloaded
   * @private
   * @param meta
   */
  onFoundUpdate(meta) {
    this.meta = meta;
    const opt = this.options;

    opt.logger.info(`Found version ${meta.version} at ${meta.updateUrl}`);
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

  checkIsInitialized() {
    if (!this.options) {
      console.warn('electron-simple-updater is not initialized');
      return false;
    } else {
      return true;
    }
  }
}

module.exports = new SimpleUpdater();