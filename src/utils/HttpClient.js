'use strict';

const request = require('httpreq');
const fs = require('fs');

class HttpClient {
  /**
   * @param {Options} options
   */
  constructor(options) {
    this.options = options;
  }

  async getJson(url) {
    return new Promise((resolve, reject) => {
      request.get(url, this.getHttpOptions(), (err, response) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          resolve(JSON.parse(response.body));
        } catch (e) {
          reject(new Error(
            `Error while parsing '${url}'. ${e}. Data:\\n ${response.body}`
          ));
        }
      });
    });
  }

  async downloadFile(url, savePath) {
    return new Promise((resolve, reject) => {
      const options = {
        ...this.getHttpOptions(),
        url,
        method: 'GET',
        downloadlocation: savePath,
        allowRedirects: true,
      };

      request.doRequest(options, (err, res) => {
        if (err) {
          return reject(err);
        }

        if (res.statusCode !== 200) {
          await fs.promises.unlink(savePath);
          return reject(new Error(`Wrong HTTP status: ${res.statusCode}`));
        }

        resolve(savePath);
      });
    });
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
        'User-Agent': 'electron-simple-updater',
        ...options.headers,
      },
    };
  }
}

module.exports = HttpClient;
