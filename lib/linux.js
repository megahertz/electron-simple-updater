'use strict';

const { exec, spawn } = require('child_process');
const { app }         = require('electron');
const fs              = require('fs');
const request         = require('httpreq');
const path            = require('path');

class DesktopFile {
  constructor(content, filePath) {
    this.content = content;
    this.filePath = filePath;
  }

  /**
   * @param {string} filePath
   * @returns {Promise<DesktopFile>}
   */
  static async load(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, content) => {
        err ? reject(err) : resolve(new DesktopFile(content, filePath));
      });
    });
  }

  /**
   * @param {string} appName
   * @returns {Promise<DesktopFile>}
   */
  static async loadByAppName(appName) {
    return this.load(path.join(
      process.env.HOME,
      '.local/share/applications',
      `appimagekit-${path.basename(appName)}.desktop`
    ));
  }

  get version() {
    const match = this.content.match(DesktopFile.REGEXP_VERSION);
    return match ? match[1] : undefined;
  }

  set version(version) {
    this.content = this.content
      .replace(DesktopFile.REGEXP_VERSION, 'X-AppImage-Version=' + version);
  }

  get buildId() {
    const match = this.content.match(DesktopFile.REGEXP_BUILD_ID);
    return match ? match[1] : undefined;
  }

  set buildId(buildId) {
    this.content = this.content
      .replace(DesktopFile.REGEXP_BUILD_ID, 'X-AppImage-BuildId=' + buildId);
  }

  async save() {
    if (!this.filePath) {
      throw new Error('Cannot save desktop file, filePath is not set');
    }

    return new Promise((resolve, reject) => {
      fs.writeFile(this.filePath, this.content, e => e ? reject(e) : resolve());
    });
  }
}

DesktopFile.REGEXP_VERSION = /X-AppImage-Version=(\d+\.\d+\.\d+)/;
DesktopFile.REGEXP_BUILD_ID = /X-AppImage-BuildId=([\w-]+)/;

module.exports.extractDesktopFile = extractDesktopFile;
module.exports.downloadUpdate     = downloadUpdate;
module.exports.quitAndInstall     = quitAndInstall;
module.exports.DesktopFile        = DesktopFile;

async function checkUpdateSavePath(appImagePath) {
  const saveDir = path.dirname(appImagePath);
  return new Promise((resolve, reject) => {
    fs.access(saveDir, fs.W_OK, (err) => {
      err ? reject(`Cannot save update to ${saveDir}`) : resolve();
    });
  });
}

async function cmd(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, e => e ? reject(e) : resolve());
  });
}

async function downloadFile(url, tempPath) {
  return new Promise((resolve, reject) => {
    request.download(url, tempPath, (err, progress) => {
      if (err) {
        return reject(err);
      }

      if (progress.statusCode !== 200) {
        return reject(progress.statusCode);
      }

      resolve(tempPath);
    });
  });
}

async function downloadUpdate(downloadUrl, logger, appName) {
  const appImagePath = getAppImagePath();
  const updateFilePath = getUpdatePath();

  await checkUpdateSavePath(appImagePath);
  await downloadFile(downloadUrl, updateFilePath);
  await setExecFlag(updateFilePath);

  try {
    await patchDesktopFile(updateFilePath, appName);
  } catch (e) {
    // it's ok to fail when patching
    logger.warn(e.message);
  }

  app.once('will-quit', updateOnQuit);

  return updateFilePath;
}

/**
 * Escape ' for a bash statement
 * @param {string} str
 * @returns {string}
 */
function escape(str) {
  return str.replace(/'/g, '\'\\\'\'');
}

/**
 * @param {string} appImagePath
 * @param {string} appName for package.json:name, not productName
 * @returns {Promise<DesktopFile>}
 */
async function extractDesktopFile(appImagePath, appName) {
  // Check if the AppImage supports extract command
  await cmd(`cat '${escape(appImagePath)}' | grep -- --appimage-extract`);

  const tmp = '/tmp/updater-' + Math.random().toString(36).substring(7);
  const root = path.join(tmp, 'squashfs-root');

  await cmd(`mkdir -p '${root}'`);
  await cmd(`'${escape(appImagePath)}' --appimage-extract ${appName}.desktop`, {
    cwd: tmp,
  });
  await cmd(`'${escape(appImagePath)}' --appimage-extract appimage.desktop`, {
    cwd: tmp,
  });

  let file;
  try {
    file = await DesktopFile.load(path.join(root, `${appName}.desktop`));
  } catch (e) {
    file = await DesktopFile.load(path.join(root, 'appimage.desktop'));
  }

  await cmd(`rm -rf '${tmp}'`);

  return file;
}

function getAppImagePath() {
  const appImagePath = process.env.APPIMAGE;

  if (!appImagePath) {
    throw new Error('It seems that the app is not in AppImage format');
  }

  return appImagePath;
}

function getUpdatePath() {
  return `${getAppImagePath()}.update`;
}

async function patchDesktopFile(appImagePath, appName) {
  const appImageDesk = await extractDesktopFile(appImagePath, appName);
  const existedDesk = await DesktopFile.loadByAppName(app.getPath('exe'));

  existedDesk.buildId = appImageDesk.buildId;
  existedDesk.version = appImageDesk.version;

  await existedDesk.save();
}

function quitAndInstall() {
  app.off('will-quit', updateOnQuit);

  // https://github.com/electron-userland/electron-builder/issues/1728
  const appImagePath = escape(getAppImagePath());
  const updateFilePath = escape(getUpdatePath());

  const restartScript = `
    mv -f '${updateFilePath}' '${appImagePath}'
    (exec '${appImagePath}') & disown $!
    kill ${process.pid} $(ps -h --ppid ${process.pid} -o pid)
  `;

  const proc = spawn('/bin/bash', ['-c', restartScript], {
    detached: true,
    stdio: 'ignore',
  });
  proc.unref();

  app.quit();
}

function updateOnQuit() {
  const appImagePath = escape(getAppImagePath());
  const updateFilePath = escape(getUpdatePath());

  const restartScript = `
    (sleep 2 && cp -f '${updateFilePath}' '${appImagePath}') & disown $!
    kill ${process.pid} $(ps -h --ppid ${process.pid} -o pid)
  `;

  const proc = spawn('/bin/bash', ['-c', restartScript], {
    detached: true,
    stdio: 'ignore',
  });
  proc.unref();
}

async function setExecFlag(filePath) {
  return new Promise((resolve, reject) => {
    fs.access(filePath, fs.X_OK, (err) => {
      if (!err) {
        return resolve(filePath);
      }

      fs.chmod(filePath, '0755', (e) => {
        e ? reject(`Cannot chmod of ${filePath}`) : resolve(filePath);
      });
    });
  });
}
