'use strict';

const crypto = require('crypto');
const fs = require('fs');

module.exports = {
  calcSha256Hash,
};

function calcSha256Hash(filePath) {
  const stream = fs.createReadStream(filePath);
  const shaSum = crypto.createHash('sha256');

  return new Promise((resolve, reject) => {
    stream
      .on('data', data => shaSum.update(data))
      .on('end', () => resolve(shaSum.digest('hex')))
      .on('error', reject);
  });
}
