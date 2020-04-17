'use strict';

const request = require('httpreq');

class HttpClient {
  constructor() {
    this.options = {};
  }

  setOptions(options) {
    options = options || {};
    this.options = {
      ...options,
      headers: {
        'User-Agent': 'electron-simple-updater',
        ...options.headers,
      },
    };
  }

  async getJson(url) {
    return new Promise((resolve, reject) => {
      request.get(url, this.options, (err, response) => {
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
        ...this.options,
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
          return reject(new Error(`Wrong HTTP status: ${res.statusCode}`));
        }

        resolve(savePath);
      });
    });
  }
}

module.exports = HttpClient;
