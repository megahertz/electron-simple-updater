'use strict';

const { spawn } = require('child_process');
const { app } = require('electron');
const fs = require('fs');
const request = require('httpreq');
const path = require('path');

module.exports.downloadUpdate = downloadUpdate;
module.exports.quitAndInstall = quitAndInstall;

async function checkUpdateSavePath(appImagePath) {
  const saveDir = path.dirname(appImagePath);
  return new Promise((resolve, reject) => {
    fs.access(saveDir, fs.W_OK, (err) => {
      err ? reject(`Cannot save update to ${saveDir}`) : resolve();
    });
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

async function downloadUpdate(downloadUrl) {
  const appImagePath = getAppImagePath();
  const updateFilePath = getUpdatePath();

  await checkUpdateSavePath(appImagePath);
  await downloadFile(downloadUrl, updateFilePath);
  await setExecFlag(updateFilePath);

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
