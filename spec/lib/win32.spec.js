'use strict';

const { expect } = require('chai');
const win32      = require('../../lib/win32');


describe('win32 lib', () => {
  beforeEach(() => {
    this.originalArgv1    = process.argv[1];
    this.originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'win32' });
  });

  afterEach(() => {
    process.argv[1] = this.originalArgv1;
    Object.defineProperty(process, 'platform', { value: this.originalPlatform });
  });

  it('should return Squirrel.Windows installer action', () => {
    process.argv[1] = '--squirrel-install';
    expect(win32.getSquirrelInstallerAction()).to.equal('squirrel-install');

    process.argv[1] = 'other';
    expect(win32.getSquirrelInstallerAction()).to.equal(false);

    process.argv[1] = '--squirrel-uninstall';
    expect(win32.getSquirrelInstallerAction()).to.equal('squirrel-uninstall');
  });
});