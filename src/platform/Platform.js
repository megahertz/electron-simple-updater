'use strict';

const electronApi = require('../utils/electronApi');

class Platform {
  /**
   * @param {Options} options
   * @param {Logger} logger
   * @param {Function} emit
   * @param {HttpClient} httpClient
   */
  constructor(options, logger, emit, httpClient) {
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

    /**
     * @type {HttpClient}
     */
    this.httpClient = httpClient;
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
