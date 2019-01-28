'use strict';

const { expect }       = require('chai');
const normalizeOptions = require('../../lib/normalize-options');

const makeBuildString        = normalizeOptions.makeBuildString;
const loadOptionsFromPackage = normalizeOptions.loadOptionsFromPackage;

describe('normalize-options lib', () => {
  beforeEach(() => {
    this.originalPlatform        = process.platform;
    this.originalArch            = process.arch;

    Object.defineProperty(process, 'platform', { value: 'win32' });
    Object.defineProperty(process, 'arch',     { value: 'x64' });
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: this.originalPlatform,
    });
    Object.defineProperty(process, 'arch', { value: this.originalArch });
  });

  it('should make a build string', () => {
    expect(makeBuildString()).to.equal('win32-x64');

    process.mas = true;
    expect(makeBuildString()).to.equal('mas-x64');
    delete process.mas;
  });

  it('should read options from a package.json', () => {
    expect(loadOptionsFromPackage()).to.deep.equal({
      appName: 'esu-test',
      url: 'https://example.com/updates.json',
      version: '0.0.1',
    });
  });

  it('should properly use default values', () => {
    const opt1 = normalizeOptions();
    expect(opt1).to.have.property('checkUpdateOnStart', true);
    expect(opt1).to.have.property('autoDownload', true);
    expect(opt1).to.have.property('url', 'https://example.com/updates.json');

    const opt2 = normalizeOptions({ autoDownload: false });
    expect(opt2).to.have.property('autoDownload', false);
  });
});
