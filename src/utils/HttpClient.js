'use strict';

const axios = require('axios');
const fs = require('fs');
const stream = require('stream');
const util = require('util');

const pipeline = util.promisify(stream.pipeline);

class HttpClient {
  /**
   * @param {Options} options
   */
  constructor(options) {
    this.options = options;
  }

  async getJson(url) {
    const { data } = await axios.get(url, this.getHttpOptions());
    return data;
  }

  async downloadFile(url, savePath) {
    const { data: httpRequest } = await axios.get(url, {
      ...this.getHttpOptions(),
      responseType: 'stream',
    });
    return pipeline(httpRequest, fs.createWriteStream(savePath));
  }

  /**
   * @private
   * @return {object}
   */
  getHttpOptions() {
    const options = this.options.http || {};
    return {
      ...options,
      headers: {
        'User-Agent': 'electron-simple-updater 1.0',
        ...options.headers,
      },
    };
  }
}

module.exports = HttpClient;
