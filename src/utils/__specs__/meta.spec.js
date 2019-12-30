'use strict';

const { describe, expect, it } = require('humile');
const { extractUpdateMeta } = require('../meta');

describe('get-updates-meta lib', () => {
  it('should check if there is a new version', () => {
    const update = 'http://example.com/update';
    const meta = {
      'win32-x64-prod': { version: '1.0.1', update },
      'win32-ia32-beta': { version: '1.0.2', update },
      'nsis-prod': { version: '0.3.2', update },
      'linux-x64-prod': { version: '1.0.2', update },
      'darwin-x64-prod': { version: '2.0.0', update },
    };

    expect(extractUpdateMeta(meta, 'win32-x64', 'prod', '1.0.1'))
      .toBe(undefined);
    expect(extractUpdateMeta(meta, 'win32-ia32', 'beta', '1.0.1'))
      .toBe(meta['win32-ia32-beta']);
    expect(extractUpdateMeta(meta, undefined, 'beta', '1.0.1'))
      .toBe(undefined);

    expect(extractUpdateMeta(meta, 'darwin-x64', 'prod', '2.0.0'))
      .toBe(undefined);
    expect(extractUpdateMeta(meta, 'darwin-x64', 'prod', '1.9.0'))
      .toBe(meta['darwin-x64-prod']);

    expect(extractUpdateMeta(meta, 'nsis', 'prod', '0.3.0'))
      .toBe(meta['nsis-prod']);
  });
});
