'use strict';

const electronApi = require('../utils/electronApi');

class Platform {
  /**
   * @param {Options} options
   * @param {Logger} logger
   * @param {Function} emit
   */
  constructor(options, logger, emit) {
    /**
     * @type {Function}
     */
    this.emit = emit;

    /**
     * @type {Options}
     */
    this.options = options;

    /**
     * @type {Logger}
     */
    this.logger = logger;
  }

  init() {
    // Empty by default
  }

  /**
   * @param {SimpleUpdater.Meta} meta
   */
  downloadUpdate(meta) {
    electronApi.setFeedURL(meta.update);
    electronApi.checkForUpdates();
  }

  quitAndInstall() {
    electronApi.quitAndInstallUpdates();
  }
}

module.exports = Platform;
