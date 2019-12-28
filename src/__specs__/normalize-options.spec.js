'use strict';

const { after, before, describe, expect, it } = require('humile');
const normalizeOptions = require('../normalize-options');

const makeBuildString = normalizeOptions.makeBuildString;
const loadOptionsFromPackage = normalizeOptions.loadOptionsFromPackage;

describe('normalize-options lib', () => {
  before(() => {
    this.originalPlatform = process.platform;
    this.originalArch = process.arch;

    Object.defineProperty(process, 'platform', { value: 'win32' });
    Object.defineProperty(process, 'arch',     { value: 'x64' });
  });

  after(() => {
    Object.defineProperty(process, 'platform', {
      value: this.originalPlatform,
    });
    Object.defineProperty(process, 'arch', { value: this.originalArch });
  });

  it('should make a build string', () => {
    expect(makeBuildString()).toBe('win32-x64');

    process.mas = true;
    expect(makeBuildString()).toBe('mas-x64');
    delete process.mas;
  });

  it('should read options from a package.json', () => {
    expect(loadOptionsFromPackage()).toEqual({
      appName: 'esu-test',
      url: 'https://example.com/updates.json',
      version: '0.0.1',
    });
  });

  it('should properly use default values', () => {
    const opt1 = normalizeOptions();

    expect(opt1.checkUpdateOnStart).toBe(true);
    expect(opt1.autoDownload).toBe(true);
    expect(opt1.url).toBe('https://example.com/updates.json');

    const opt2 = normalizeOptions({ autoDownload: false });
    expect(opt2.autoDownload).toBe(false);
  });
});
