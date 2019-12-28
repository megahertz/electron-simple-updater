'use strict';

const { jasmine } = require('humile');
const mock  = require('mock-require');

mock('electron', {
  app: {
    quit: jasmine.createSpy(),
    getAppPath() {
      return __dirname;
    },
    getVersion() {
      return '0.0.1';
    },
  },
});
