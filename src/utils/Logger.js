'use strict';

const PREFIX = 'electron-simple-updater:';

class Logger {
  constructor(options) {
    /**
     * @type {Options}
     */
    this.options = options;

    this.error = this.log.bind(this, 'error');
    this.warn = this.log.bind(this, 'warn');
    this.info = this.log.bind(this, 'info');
    this.debug = this.log.bind(this, 'debug');
  }

  log(level, ...args) {
    const customLogger = this.options.logger;
    if (!customLogger || typeof customLogger[level] !== 'function') {
      return;
    }

    customLogger[level](PREFIX, ...args);
  }

  static createEmpty() {
    return new Logger({});
  }
}

module.exports = Logger;
