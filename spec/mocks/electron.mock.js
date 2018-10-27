'use strict';

const mock  = require('mock-require');
const sinon = require('sinon');

mock('electron', {
  app: {
    quit: sinon.spy(),
    getAppPath() {
      return __dirname;
    },
    getVersion() {
      return '0.0.1';
    },
  },
});
