'use strict';

const Linux = require('./Linux');
const Platform = require('./Platform');
const Windows = require('./Windows');

module.exports = {
  createPlatform,
};

/**
 * @param {Options} options
 * @param {Logger} logger
 * @param {Function} emit
 * @param {string} platform
 * @return {Platform}
 */
function createPlatform(options, logger, emit, platform = process.platform) {
  switch (platform) {
    case 'darwin': return new Platform(options, logger, emit);
    case 'win32': return new Windows(options, logger, emit);
    default: return new Linux(options, logger, emit);
  }
}
