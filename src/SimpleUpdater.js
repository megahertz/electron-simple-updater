'use strict';

const { EventEmitter } = require('events');
const { createPlatform } = require('./platform');
const electronApi = require('./utils/electronApi');
const Logger = require('./utils/Logger');
const { getUpdatesMeta } = require('./utils/meta');
const { getOptions } = require('./utils/options');

class SimpleUpdater extends EventEmitter {
  constructor() {
    super();

    /**
     * @type {Options}
     */
    this.options = getOptions();

    /**
     * @type {Logger}
     */
    this.logger = new Logger(this.options);
    electronApi.setLogger(this.logger);

    /**
     * @type {SimpleUpdater.Meta}
     */
    this.meta = {
      update: '',
      version: '',
    };

    this.platform = createPlatform(
      this.options,
      this.logger,
      this.emit.bind(this)
    );

    electronApi.onUpdater('update-downloaded', () => {
      const version = this.meta.version;
      this.logger.info(`New version ${version} has been downloaded`);
      this.emit('update-downloaded', this.meta);
    });

    this.on('error', this.logger.warn);
    electronApi.onUpdater('error', e => this.emit('error', e));
  }

  /**
   * Initialize updater module
   * @param {Partial<Options> | string} options
   * @return {this}
   */
  init(options = {}) {
    if (options.logger) {
      this.options.setOptions('logger', options.logger);
    }

    if (!electronApi.isPackaged()) {
      this.logger.info('Update is disabled because the app is not packaged');
      this.options.disabled = true;
      return this;
    }

    if (!this.options.initialize(options, this.logger)) {
      this.logger.warn('Update is disabled because of wrong configuration');
    }

    this.platform.init();

    if (this.options.checkUpdateOnStart) {
      this.checkForUpdates();
    }

    return this;
  }

  /**
   * Asks the server whether there is an update. url must be set before
   * @return {this}
   */
  checkForUpdates() {
    const opt = this.options;

    if (opt.disabled) {
      this.logger.warn('Update is disabled');
      return this;
    }

    if (!opt.url) {
      this.emit('error', 'You must set url before calling checkForUpdates()');
      return this;
    }

    this.emit('checking-for-update');

    // noinspection JSUnresolvedFunction,JSValidateTypes
    getUpdatesMeta(opt.url, opt.build, opt.channel, opt.version)
      .then((updateMeta) => {
        if (updateMeta) {
          this.onFoundUpdate(updateMeta);
          return;
        }

        this.logger.debug(`Update for ${this.buildId} is not available`);
        this.emit('update-not-available');
      })
      .catch(e => this.emit('error', e));

    return this;
  }

  /**
   * Start downloading update manually.
   * You can use this method if autoDownload option is set to false
   * @return {this}
   */
  downloadUpdate() {
    if (!this.meta.update) {
      this.emit('error', 'No metadata for update. Run checkForUpdates first.');
      return this;
    }

    this.emit('update-downloading', this.meta);
    this.options.logger.info(`Downloading updates from ${this.meta.update}`);

    this.platform.downloadUpdate(this.meta);

    return this;
  }

  /**
   * Restarts the app and installs the update after it has been downloaded.
   * It should only be called after update-downloaded has been emitted.
   * @return {void}
   */
  quitAndInstall() {
    this.platform.quitAndInstall();
  }

  /**
   * Set one or a few options
   * @param {string|object} name
   * @param {*} value
   * @return {this}
   */
  setOptions(name, value = null) {
    this.options.setOptions(name, value);
    return this;
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
   * Return the current updates.json URL
   * @return {string}
   */
  getFeedURL() {
    if (!this.checkIsInitialized()) return '';
    return this.options.url;
  }

  /**
   * Called when updates metadata has been downloaded
   * @param {*} meta
   * @private
   */
  onFoundUpdate(meta) {
    this.meta = meta;
    const opt = this.options;

    opt.logger.debug(`Found version ${meta.version} at ${meta.update}`);
    this.emit('update-available', meta);

    if (opt.autoDownload) {
      this.downloadUpdate();
    }
  }

  /**
   * @return {boolean}
   * @private
   */
  checkIsInitialized() {
    if (!this.options.isInitialized) {
      this.emit('error', new Error('Not initialized'));
      return false;
    }

    return true;
  }
}

module.exports = SimpleUpdater;
