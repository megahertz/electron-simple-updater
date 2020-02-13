'use strict';

const fs = require('fs');
const path = require('path');
const Logger = require('./Logger');

let electron;
try {
  // eslint-disable-next-line global-require,import/no-unresolved
  electron = require('electron');
} catch (e) {
  electron = null;
}

let logger = Logger.createEmpty();

module.exports = {
  offApp,
  onceApp,
  checkForUpdates,
  getAppName,
  getAppVersion,
  isPackaged,
  onUpdater,
  readPackageJson,
  setFeedURL,
  setLogger,
  quit,
  quitAndInstallUpdates,
};

function offApp(event, listener) {
  getApp() && getApp().off(event, listener);
}

function onceApp(event, listener) {
  getApp() && getApp().on(event, listener);
}

function checkForUpdates() {
  getAutoUpdater() && getAutoUpdater().checkForUpdates();
}

/**
 * @return {Electron.App}
 */
function getApp() {
  return getElectronModule('app');
}

/**
 * @return {string}
 */
function getAppName() {
  const app = getApp();
  if (!app) return '';

  return 'name' in app ? app.name : app.getName();
}

function getElectronModule(name) {
  if (!electron) {
    logger.error('electron is unavailable');
    return null;
  }

  if (electron[name]) {
    return electron[name];
  }

  if (electron.remote) {
    return electron.remote[name];
  }

  logger.error(`electron.${name} module is unavailable`);

  return null;
}

/**
 * @return {string}
 */
function getAppVersion() {
  return (getApp() && getApp().getVersion()) || '';
}

/**
 * @return {Electron.AutoUpdater}
 */
function getAutoUpdater() {
  return getElectronModule('autoUpdater');
}

function isPackaged() {
  const app = getApp();
  if (!app) {
    return false;
  }

  if (app.isPackaged !== true) {
    return false;
  }

  if (getAppName().toLowerCase() === 'electron') {
    return false;
  }

  return true;
}

function setFeedURL(updateUrl) {
  getAutoUpdater() && getAutoUpdater().setFeedURL(updateUrl);
}

/**
 * Set logger instance for electronApi
 * @param {Logger} newLogger
 */
function setLogger(newLogger) {
  if (newLogger instanceof Logger) {
    logger = newLogger;
  }
}

function onUpdater(event, listener) {
  getAutoUpdater() && getAutoUpdater().on(event, listener);
}

function quit() {
  const app = getApp();
  if (app) {
    app.quit();
  } else {
    process.exit();
  }
}

function quitAndInstallUpdates() {
  getAutoUpdater() && getAutoUpdater().quitAndInstall();
}

/**
 * @param {string} appPath
 * @return {{}|any}
 */
function readPackageJson(appPath = undefined) {
  try {
    const packageFile = path.join(
      appPath || getApp().getAppPath(),
      'package.json'
    );
    const content = fs.readFileSync(packageFile, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    return {};
  }
}
