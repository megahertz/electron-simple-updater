'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const request = require('httpreq');
const os = require('os');
const path = require('path');
const electronApi = require('../utils/electronApi');
const Platform = require('./Platform');

class Linux extends Platform {
  constructor(options, logger, emit) {
    super(options, logger, emit);

    this.quitAndInstall = this.quitAndInstall.bind(this);
    this.lastUpdatePath = null;
  }

  /**
   * @param {SimpleUpdater.Meta} meta
   */
  downloadUpdate(meta) {
    this.downloadUpdateFile(meta)
      .then(() => {
        this.logger.info(`New version ${meta.version} has been downloaded`);
        this.emit('update-downloaded', this.meta);
      })
      .catch(e => this.emit('error', e));
  }

  /**
   * @param {boolean} restartRequired
   */
  quitAndInstall(restartRequired = true) {
    if (!this.lastUpdatePath) {
      return;
    }

    electronApi.offApp('will-quit', this.quitAndInstall);

    const updateScript = `
      if [ "\${RESTART_REQUIRED}" = 'true' ]; then
        cp -f "\${UPDATE_FILE}" "\${APP_IMAGE}"
        (exec "\${APP_IMAGE}") & disown $!
      else
        (sleep 2 && cp -f "\${UPDATE_FILE}" "\${APP_IMAGE}") & disown $!
      fi
      kill "\${OLD_PID}" $(ps -h --ppid "\${OLD_PID}" -o pid)
      rm "\${UPDATE_FILE}"
    `;

    console.log(updateScript, {
      APP_IMAGE: this.getAppImagePath(),
      OLD_PID: process.pid,
      RESTART_REQUIRED: restartRequired === true ? 'true' : 'false',
      UPDATE_FILE: this.lastUpdatePath,
    });

    const proc = spawn('/bin/bash', ['-c', updateScript], {
      detached: true,
      stdio: 'ignore',
      env: {
        ...process.env,
        APP_IMAGE: this.getAppImagePath(),
        OLD_PID: process.pid,
        RESTART_REQUIRED: restartRequired === true ? 'true' : 'false',
        UPDATE_FILE: this.lastUpdatePath,
      },
    });
    proc.unref();

    if (restartRequired === true) {
      electronApi.quit();
    }
  }

  /**
   * @param {SimpleUpdater.Meta} meta
   * @package
   */
  async downloadUpdateFile(meta) {
    this.lastUpdatePath = this.getUpdatePath(meta.version);

    await downloadFile(meta.update, this.lastUpdatePath);
    await setExecFlag(this.lastUpdatePath);

    electronApi.onceApp('will-quit', this.quitAndInstall);

    return this.lastUpdatePath;
  }

  getAppImagePath() {
    const appImagePath = process.env.APPIMAGE;

    if (!appImagePath) {
      throw new Error('It seems that the app is not in AppImage format');
    }

    return appImagePath;
  }

  getUpdatePath(version) {
    const fileName = `${electronApi.getAppName()}-${version}.AppImage`;
    return path.join(os.tmpdir(), fileName);
  }
}

async function downloadFile(url, savePath) {
  return new Promise((resolve, reject) => {
    request.download(url, savePath, (err, progress) => {
      if (err) {
        return reject(err);
      }

      if (progress.statusCode !== 200) {
        return reject(progress.statusCode);
      }

      resolve(savePath);
    });
  });
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

module.exports = Linux;
