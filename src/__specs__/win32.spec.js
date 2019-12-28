'use strict';

const { after, before, describe, expect, it } = require('humile');
const win32 = require('../win32');

describe('win32 lib', () => {
  before(() => {
    this.originalArgv1    = process.argv[1];
    this.originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'win32' });
  });

  after(() => {
    process.argv[1] = this.originalArgv1;
    Object.defineProperty(process, 'platform', {
      value: this.originalPlatform,
    });
  });

  it('should return Squirrel.Windows installer action', () => {
    process.argv[1] = '--squirrel-install';
    expect(win32.getSquirrelInstallerAction()).toBe('squirrel-install');

    process.argv[1] = 'other';
    expect(win32.getSquirrelInstallerAction()).toBe(false);

    process.argv[1] = '--squirrel-uninstall';
    expect(win32.getSquirrelInstallerAction()).toBe('squirrel-uninstall');
  });
});
