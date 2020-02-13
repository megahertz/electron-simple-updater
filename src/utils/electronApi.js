'use strict';

const fs = require('fs');
const path = require('path');

let electron;
try {
  // eslint-disable-next-line global-require,import/no-unresolved
  electron = require('electron');
} catch (e) {
  electron = null;
}

module.exports = {
  offApp,
  onceApp,
  checkForUpdates,
  getAppName,
  getAppVersion,
  isPackaged,
  onUpdater,
  readPackageJson,
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
  getAutoUpdater() && getAutoUpdater.checkForUpdates();
}

/**
 * @return {Electron.App}
 */
function getApp() {
  return electron && electron.app;
}

/**
 * @return {string}
 */
function getAppName() {
  const app = getApp();
  if (!app) return '';

  return 'name' in app ? app.name : app.getName();
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
  return electron && electron.autoUpdater;
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
