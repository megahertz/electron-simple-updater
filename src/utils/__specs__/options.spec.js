'use strict';

const { describe, expect, it } = require('humile');
const path = require('path');
const Logger = require('../Logger');
const { getOptions } = require('../options');

describe('options', () => {
  // before(() => {
  //   this.originalPlatform = process.platform;
  //   this.originalArch = process.arch;
  //
  //   Object.defineProperty(process, 'platform', { value: 'win32' });
  //   Object.defineProperty(process, 'arch',     { value: 'x64' });
  // });
  //
  // after(() => {
  //   Object.defineProperty(process, 'platform', {
  //     value: this.originalPlatform,
  //   });
  //   Object.defineProperty(process, 'arch', { value: this.originalArch });
  // });

  describe('should make a build string', () => {
    it('on linux', () => {
      const process = { platform: 'linux', arch: 'x64' };
      expect(getOptions().makeBuildString(process)).toBe('linux-x64');
    });

    it('on mac', () => {
      const process = { platform: 'darwin', arch: 'x64' };
      expect(getOptions().makeBuildString(process)).toBe('darwin-x64');
    });

    it('on windows', () => {
      const process = { platform: 'win32', arch: 'ia32' };
      expect(getOptions().makeBuildString(process)).toBe('win32-ia32');
    });

    it('on mas', () => {
      const process = { platform: 'darwin', arch: 'x64', mas: true };
      expect(getOptions().makeBuildString(process)).toBe('mas-x64');
    });

    it('on Windows Store', () => {
      const process = { platform: 'win32', arch: 'x64', windowsStore: true };
      expect(getOptions().makeBuildString(process)).toBe('winstore-x64');
    });
  });

  it('should read options from a package.json', () => {
    const options = getOptions();

    options.initialize(
      { appPath: path.resolve(__dirname, 'fixtures') },
      Logger.createEmpty()
    );

    expect(options.url).toBe('https://example.com/updates.json');
    expect(options.version).toBe('0.0.1');
    expect(options.disabled).toBe(false);
  });

  it('should be disabled if no required options are set', () => {
    const options = getOptions();
    options.initialize({}, Logger.createEmpty());
    expect(options.disabled).toBe(true);
  });
});
