'use strict';

const { expect } = require('chai');
const path       = require('path');
const {
  DesktopFile,
  extractDesktopFile,
} = require('../../lib/linux');

describe('linux lib', () => {
  describe('DesktopFile', () => {
    const fileName = path.join(__dirname, '../resources/sample.desktop');

    it('should be loaded from a file', async () => {
      const file = await DesktopFile.load(fileName);
      expect(file.version).equals('0.0.2');
      expect(file.buildId).equals('1DPB0c43blt5k3jZmv15VXKdKRm');
    });

    it('should modify version and build id data', async () => {
      const file = await DesktopFile.load(fileName);
      file.version = '0.0.3';
      file.buildId = 'Build-003';

      expect(file.content).equals([
        '[Desktop Entry]',
        'Name=appimage',
        'Comment=electron-simple-updater test project',
        'Exec=AppRun',
        'X-AppImage-Version=0.0.3',
        'X-AppImage-BuildId=Build-003',
        '',
      ].join('\n'));
    });
  });

  it('should extract desktop file from AppImage', async () => {
    const file = await extractDesktopFile(
      path.join(__dirname, '../resources/sample.AppImage')
    );

    expect(file.buildId).equals('1DPB0c43blt5k3jZmv15VXKdKRm');
    expect(file.version).equals('0.0.1');
  });
});
