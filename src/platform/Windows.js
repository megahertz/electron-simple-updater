'use strict';

const path = require('path');
const { spawn } = require('child_process');
const electronApi = require('../utils/electronApi');
const Platform = require('./Platform');

const SQUIRREL_INSTALL = 'squirrel-install';
const SQUIRREL_UPDATED = 'squirrel-updated';
const SQUIRREL_UNINSTALL = 'squirrel-uninstall';
const SQUIRREL_OBSOLETE = 'squirrel-obsolete';

const SQUIRREL_ACTIONS = [
  SQUIRREL_INSTALL, SQUIRREL_UPDATED, SQUIRREL_UNINSTALL, SQUIRREL_OBSOLETE,
];

class Windows extends Platform {
  init() {
    const squirrelAction = this.getSquirrelInstallerAction();
    if (!squirrelAction) {
      return;
    }

    const event = { squirrelAction, preventDefault: false };
    this.emit('squirrel-win-installer', event);

    if (!event.preventDefault) {
      processSquirrelInstaller(squirrelAction);
      process.exit();
    }
  }

  /**
   * @param {string} argv1
   * @return {string}
   * @package
   */
  getSquirrelInstallerAction(argv1 = process.argv[1]) {
    const handledArguments = SQUIRREL_ACTIONS.map(act => `--${act}`);
    const actionIndex = handledArguments.indexOf(argv1);
    return actionIndex > -1 ? SQUIRREL_ACTIONS[actionIndex] : '';
  }
}

function processSquirrelInstaller(action) {
  const execPath = path.basename(process.execPath);

  switch (action) {
    case SQUIRREL_INSTALL:
    case SQUIRREL_UPDATED: {
      run([`--createShortcut=${execPath}`], electronApi.quit);
      return true;
    }
    case SQUIRREL_UNINSTALL: {
      run([`--removeShortcut=${execPath}`], electronApi.quit);
      return false;
    }
    case SQUIRREL_OBSOLETE: {
      electronApi.quit();
      return false;
    }
    default: {
      return false;
    }
  }
}

function run(args, done) {
  const updateExe = path.resolve(
    path.dirname(process.execPath),
    '../Update.exe'
  );
  spawn(updateExe, args, { detached: true }).on('close', done);
}

module.exports = Windows;
