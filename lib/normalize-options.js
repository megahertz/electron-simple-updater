'use strict';

const { app } = require('electron');
const path    = require('path');
const fs      = require('fs');
const win32   = require('./win32');

module.exports = normalizeOptions;


function normalizeOptions(options) {
  const def = {
    onSquirrelWinInstaller: win32.executeSquirrelDefaultAction,
    logger:                 console,
    checkUpdatesOnStart:    true,
    autoDownload:           true
  };

  if (typeof options === 'string') {
    options = { url: options };
  }

  options = Object.assign(def, options);

  // Do not log if a logger is empty
  if (!options.logger) {
    options.logger = { info() {}, warn() {} }
  }

  // If one of this options is not defined, check a package.json
  if (!options.url || !options.build || !options.channel || !options.version) {
    loadOptionsFromPackage(options);
  }

  if (!options.build) {
    options.build = makeBuildString();
  }

  if (!options.channel) {
    options.channel = 'prod';
  }

  const validateResult = validateOptions(options);
  if (validateResult === true) {
    return options;
  }

  options.logger.warn(
    'electron-simple-updater: Updates are disabled. ' + validateResult
  );
  options.disable = true;

  return options;
}

function loadOptionsFromPackage(options) {
  const packageFile = path.join(app.getAppPath(), 'package.json');
  const content = fs.readFileSync(packageFile, 'utf-8');
  const packageJson = JSON.parse(content);

  if (!options.url && packageJson.updater) {
    options.url = packageJson.updater.url;
  }

  if (!options.build && packageJson.updater) {
    options.build = packageJson.updater.build;
  }

  if (!options.channel && packageJson.updater) {
    options.channel = packageJson.updater.channel
  }

  if (!options.version) {
    options.version = packageJson.version;
  }

  return options;
}

function validateOptions(options) {
  if (!options.url) {
    return 'You must set a url parameter in package.json (updater.url) or ' +
      'through init({url})';
  }

  if (!options.version) {
    return 'Set version in a package.json';
  }

  return true;
}

function makeBuildString() {
  let build;

  if (process.mas) {
    build = 'mas';
  } else if (process.windowsStore) {
    build = 'winstore';
  } else {
    build = process.platform;
  }

  build += '-' + process.arch;

  return build;
}