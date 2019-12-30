'use strict';

const { describe, expect, it } = require('humile');
const path = require('path');
const file = require('../file');

describe('file', () => {
  it('calcSha256Hash', async () => {
    const filePath = path.resolve(__dirname, 'fixtures/package.json');
    const hash = await file.calcSha256Hash(filePath);

    expect(hash)
      .toBe('dde2795c8ca938731339131371f149c6cef2a2ac989931022d6c842a1654a669');
  });
});
