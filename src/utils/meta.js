'use strict';

const semver = require('semver');
const request = require('httpreq');

module.exports = {
  getUpdatesMeta,
  extractUpdateMeta,
};

/**
 * Return promise which can return false if there are no updates available
 * or object which contains the update information
 * @param {string} updatesUrl
 * @param {string} build {platform}-${arch}
 * @param {string} channel prod, beta, dev and so on
 * @param {string} version 0.0.1
 * @returns {Promise<object|void>}
 */
async function getUpdatesMeta(updatesUrl, build, channel, version) {
  const [platform, arch] = build.split('-');

  const url = updatesUrl
    .replace('{platform}', platform)
    .replace('{arch}', arch)
    .replace('{channel}', channel);

  const json = await getJson(url);
  return extractUpdateMeta(json, build, channel, version);
}

function extractUpdateMeta(updatesMeta, build, channel, version) {
  const meta = updatesMeta[`${build}-${channel}`];
  if (!meta || !meta.version || !meta.update) {
    return;
  }

  if (semver.gt(meta.version, version)) {
    return meta;
  }
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    request.get(url, (err, response) => {
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
