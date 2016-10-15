'use strict';

const { app, autoUpdater } = require('electron');
const events               = require('events');
const exec                 = require('child_process').exec;

const win32            = require('./lib/win32');
const linux            = require('./lib/linux');
const getUpdatesMeta   = require('./lib/get-updates-meta');
const normalizeOptions = require('./lib/normalize-options');

class SimpleUpdater extends events.EventEmitter {
  constructor() {
    super();

    // Just for better auto-complete
    this.options = {
      autoDownload:           true,
      build:                  '',
      channel:                'prod',
      checkUpdateOnStart:     true,
      disabled:               false,
      empty:                  true, // Mark that it's not initialized
      logger:                 console,
      version:                '',
      url:                    ''
    };

    this.meta = {
      empty:     true, // Mark that it's not initialized
      platform:  '',
      version:   '',
      updateUrl: ''
    };

    autoUpdater.on('update-downloaded', () => {
      const version = this.meta.version;
      this.options.logger.info(`New version ${version} has been downloaded`);
      /**
       * @event SimpleUpdater#update-downloaded
       * @param {object} meta Update metadata
       */
      this.emit('update-downloaded', this.meta);
    });

    this.on('error', (e) => {
      if (this.options.logger) {
        this.options.logger.warn(e);
      }
    });
    autoUpdater.on('error', e => this.emit('error', e));
  }

  /**
   * Initialize a package.
   * By default it finish the process if run by Squirrel.Windows installer
   *
   * @param {object|string} [options]
   * @param {bool}   [options.autoDownload=true] Auto download update if found
   * @param {string} [options.build] Build type, like 'linux-x64'
   * @param {string} [options.channel=prod] Release channel, like 'beta'
   * @param {bool}   [options.checkUpdateOnStart=true]
   * @param {bool}   [options.disabled=false] Disable this package
   * @param {object} [options.logger=console] Logger object like console,
   *   electron-log or winston
   * @param {string} [options.version] Current app version
   * @param {string} [options.url] URL to a file updates.json
   *
   * @fires SimpleUpdater#error
   * @return {SimpleUpdater}
   */
  init(options) {
    if (!this.options.empty) {
      /**
       * @event SimpleUpdater#error
       * @param {object|string} error
       */
      this.emit(
        'error',
        'electron-simple updater has been initialized before'
      );
      return this;
    }

    this.options = normalizeOptions(options);

    const squirrelAction = win32.getSquirrelInstallerAction();
    if (squirrelAction) {
      const event = { preventDefault: false };
      /**
       * @event SimpleUpdater#squirrel-win-installer
       * @param {string} action one of:
       *   squirrel-install
       *   squirrel-updated
       *   squirrel-uninstall
       *   squirrel-obsolete
       */
      this.emit('squirrel-win-installer', event);
      if (!event.preventDefault) {
        win32.processSquirrelInstaller(squirrelAction);
        process.exit();
      }
      return this;
    }

    if (this.options.checkUpdateOnStart) {
      this.checkForUpdates();
    }

    return this;
  }

  /**
   * Sets the url and initialize the auto updater.
   * Instead of built-in auto-updater, it's a URL to updates.json
   * @param {string} url
   */
  setFeedURL(url) {
    if (this.options.empty) {
      this.init(url);
    } else {
      this.options.url = url;
    }
  }

  /**
   * Returns String - The current updates.json URL.
   * @return {string}
   */
  getFeedURL() {
    if (!this.checkIsInitialized()) return '';
    return this.options.url;
  }

  /**
   * Asks the server whether there is an update. updates.json url must be set
   * before this call
   * @fires SimpleUpdater#error
   * @return {SimpleUpdater}
   */
  checkForUpdates() {
    const opt = this.options;

    if (opt.disabled) {
      opt.logger.warn(`Update is disabled`);
      return this;
    }

    if (!opt.url) {
      this.emit('error', 'You must set url before calling checkForUpdates()');
      return this;
    }

    //noinspection JSUnresolvedFunction
    getUpdatesMeta(opt.url, opt.build, opt.channel, opt.version)
      .then((updateMeta) => {
        if (updateMeta) {
          this.onFoundUpdate(updateMeta);
        } else {
          opt.logger.info(
            `Update for ${this.buildId} is not available`
          );
          /**
           * @event SimpleUpdater#update-not-available
           */
          this.emit('update-not-available');
        }
      })
      .catch(e => this.emit('error', e));

    return this;
  }

  /**
   * Start downloading update manually, if autoDownload is set to false
   * @fires SimpleUpdater#update-downloading
   * @fires SimpleUpdater#update-downloaded
   * @fires SimpleUpdater#error
   * @return {SimpleUpdater}
   */
  downloadUpdate() {
    if (!this.meta.updateUrl) {
      const msg = 'There is no metadata for update. Run checkForUpdates first.';
      this.emit('error', msg);
      return this;
    }

    let feedUrl = autoUpdater.getFeedURL();
    /**
     * @event SimpleUpdater#update-downloading
     * @param {object} meta Update metadata
     */
    this.emit('update-downloading', this.meta);

    if (this.meta.platform === 'linux') {
      feedUrl = this.meta.updateUrl;

      linux.downloadUpdate(feedUrl)
        .then((appImagePath) => {
          this.appImagePath = appImagePath;
          const version = this.meta.version;
          this.options.logger.info(`New version ${version} has been downloaded`);
          this.emit('update-downloaded', this.meta);
        })
        .catch(e => this.emit('error', e));
    } else {
      autoUpdater.checkForUpdates();
    }

    this.options.logger.info(`Downloading updates from ${feedUrl}`);

    return this;
  }

  /**
   * Restarts the app and installs the update after it has been downloaded.
   * It should only be called after update-downloaded has been emitted.
   * @return {void}
   */
  quitAndInstall() {
    if (this.appImagePath) {
      exec(this.appImagePath);
      app.quit();
    } else {
      return autoUpdater.quitAndInstall();
    }
  }

  get build() {
    if (!this.checkIsInitialized()) return;
    return this.options.build;
  }

  /**
   * Return a build name with a channel and version
   * @return {string}
   */
  get buildId() {
    if (!this.checkIsInitialized()) return '';
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
   * Set one or a few options
   * @param {string|object} name
   * @param {*} value
   * @return {SimpleUpdater}
   */
  setOptions(name, value = null) {
    if (typeof name === 'object') {
      Object.assign(this.options, name);
      return this;
    }
    this.options[name] = value;
    return this;
  }

  /**
   * Called when updates metadata has been downloaded
   * @private
   * @fires SimpleUpdater#update-available
   * @param {object} meta
   */
  onFoundUpdate(meta) {
    this.meta = meta;
    const opt = this.options;

    opt.logger.info(`Found version ${meta.version} at ${meta.updateUrl}`);
    autoUpdater.setFeedURL(meta.updateUrl);
    /**
     * @event SimpleUpdater#update-available
     * @param {object} meta Update metadata
     */
    this.emit('update-available', meta);
    if (opt.autoDownload) {
      this.downloadUpdate();
    }
  }

  /**
   * @private
   * @fires SimpleUpdater#error
   * @return {boolean}
   */
  checkIsInitialized() {
    if (this.options.empty) {
      this.emit('error', 'electron-simple-updater is not initialized');
      return false;
    } else {
      return true;
    }
  }
}

module.exports = new SimpleUpdater();