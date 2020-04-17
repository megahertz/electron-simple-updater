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
 * @param {HttpClient} httpClient
 * @param {string} platform
 * @return {Platform}
 */
function createPlatform(
  options,
  logger,
  emit,
  httpClient,
  platform = process.platform
) {
  switch (platform) {
    case 'darwin': return new Platform(options, logger, emit, httpClient);
    case 'win32': return new Windows(options, logger, emit, httpClient);
    default: return new Linux(options, logger, emit, httpClient);
  }
}
