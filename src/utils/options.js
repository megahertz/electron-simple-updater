'use strict';

const electonApi = require('./electronApi');

module.exports = {
  getOptions,
};

function getOptions() {
  return new Options();
}

class Options {
  constructor() {
    /**
     * @type {boolean}
     */
    this.autoDownload = true;

    /**
     * @type {string}
     */
    this.build = this.makeBuildString(process);

    /**
     * @type {string}
     */
    this.channel = 'prod';

    /**
     * @type {object}
     */
    this.http = {};

    /**
     * @type {string}
     */
    this.version = '';

    /**
     * @type {string}
     */
    this.url = '';

    /**
     * @type {boolean}
     */
    this.checkUpdateOnStart = true;

    /**
     * @type {boolean}
     */
    this.disabled = false;

    /**
     * @type {Partial<Logger>}
     */
    this.logger = console;

    /**
     * @type {boolean}
     */
    this.isInitialized = false;

    /**
     * @type {string}
     */
    this.appPath = undefined;
  }

  setOptions(nameOrOptions, value = undefined) {
    if (typeof nameOrOptions === 'object') {
      Object.entries(nameOrOptions)
        .forEach(([optName, optValue]) => this.setOptions(optName, optValue));
      return;
    }

    const name = nameOrOptions;

    if (value === undefined) {
      return;
    }

    this[name] = value;
  }

  /**
   * @param {Partial<Options>} options
   * @param {Logger} logger
   * @return {boolean}
   */
  initialize(options, logger) {
    if (this.isInitialized) {
      logger.error('It has been initialized before');
      return false;
    }

    this.version = electonApi.getAppVersion();
    this.loadOptionsFromPackage(options.appPath);

    if (typeof options === 'string') {
      options = { url: options };
    }

    this.setOptions(options);

    if (!this.validate(logger)) {
      this.disabled = true;
      return false;
    }

    this.isInitialized = true;

    return true;
  }

  /**
   * @param {string} appPath
   * @private
   */
  loadOptionsFromPackage(appPath = undefined) {
    const packageJson = electonApi.readPackageJson(appPath);
    const options = packageJson.updater || {};

    options.version = packageJson.version;
    this.setOptions(options);
  }

  /**
   * @param {NodeJS.Process} process
   * @return {string}
   * @package
   */
  makeBuildString(process) {
    let build = process.platform;

    if (process.mas) {
      build = 'mas';
    } else if (process.windowsStore) {
      build = 'winstore';
    }

    return `${build}-${process.arch}`;
  }

  /**
   * @param {Logger} logger
   * @return {boolean}
   * @private
   */
  validate(logger) {
    if (!this.url) {
      logger.warn(
        'You must set an url parameter in package.json (updater.url) or '
          + 'when calling init({ url })'
      );
      return false;
    }

    if (!this.version) {
      logger.warn('Set version in a package.json or when calling init()');
      return false;
    }

    return true;
  }
}
