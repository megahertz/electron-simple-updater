'use strict';

const sinon = require('sinon');

const mock = require('mock-require');
mock('electron', {
  app: {
    quit: sinon.spy(),
    getAppPath() {
      return __dirname;
    }
  }
});