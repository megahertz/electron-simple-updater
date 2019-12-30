'use strict';

const { describe, expect, it } = require('humile');
const Windows = require('../Windows');

describe('platform/Windows', () => {
  describe('getSquirrelInstallerAction', () => {
    it('should detect install action', () => {
      const windows = new Windows(null, null, null);
      const action = windows.getSquirrelInstallerAction('--squirrel-install');
      expect(action).toBe('squirrel-install');
    });

    it('should detect uninstall action', () => {
      const windows = new Windows(null, null, null);
      const action = windows.getSquirrelInstallerAction('--squirrel-uninstall');
      expect(action).toBe('squirrel-uninstall');
    });

    it('should detect no squirrel action', () => {
      const windows = new Windows(null, null, null);
      const action = windows.getSquirrelInstallerAction('other args');
      expect(action).toBe('');
    });
  });
});
