'use strict';

const { expect } = require('chai');
const getUpdatesMeta = require('rewire')('../../lib/get-updates-meta');


const extractUpdateMeta = getUpdatesMeta.__get__('extractUpdateMeta');


describe('get-updates-meta lib', () => {
  it('should check if there is a new version', () => {
    const meta = {
      'win32-x64-prod': { version: '1.0.1' },
      'win32-ia32-beta': { version: '1.0.2' },
      'nsis-prod': { version: '0.3.2' },
      'linux-x64-prod': { version: '1.0.2' },
      'darwin-x64-prod': { version: '2.0.0' }
    };

    expect(extractUpdateMeta(meta, 'win32-x64', 'prod', '1.0.1'))
      .to.equal(false);
    expect(extractUpdateMeta(meta, 'win32-ia32', 'beta', '1.0.1'))
      .to.equal(meta['win32-ia32-beta']);
    expect(extractUpdateMeta(meta, undefined, 'beta', '1.0.1'))
      .to.equal(false);

    expect(extractUpdateMeta(meta, 'darwin-x64', 'prod', '2.0.0'))
      .to.equal(false);
    expect(extractUpdateMeta(meta, 'darwin-x64', 'prod', '1.9.0'))
      .to.equal(meta['darwin-x64-prod']);

    expect(extractUpdateMeta(meta, 'nsis', 'prod', '0.3.0'))
      .to.equal(meta['nsis-prod']);
  });
});