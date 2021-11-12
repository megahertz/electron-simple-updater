'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { calcSha256Hash } = require('../utils/file');
const electronApi = require('../utils/electronApi');
const Platform = require('./Platform');

class Linux extends Platform {
  constructor(options, logger, emit, httpClient) {
    super(options, logger, emit, httpClient);

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

    const proc = spawn('/bin/bash', ['-c', updateScript], {
      detached: true,
      stdio: 'ignore',
      env: {
        ...process.env,
        APP_IMAGE: this.getAppImagePath(),
        OLD_PID: process.pid,
        RESTART_REQUIRED: String(restartRequired),
        UPDATE_FILE: this.lastUpdatePath,
      },
    });
    proc.unref();

    if (restartRequired === true) {
      electronApi.quit();
      process.exit();
    }
  }

  /**
   * @param {SimpleUpdater.Meta} meta
   * @package
   */
  async downloadUpdateFile(meta) {
    this.lastUpdatePath = this.getUpdatePath(meta.version);

    if (!fs.existsSync(this.lastUpdatePath)) {
      await this.httpClient.downloadFile(meta.update, this.lastUpdatePath);
      await setExecFlag(this.lastUpdatePath);
    }

    if (meta.sha256) {
      try {
        await this.checkHash(meta.sha256, this.lastUpdatePath);
      } catch (e) {
        await fs.promises.unlink(this.lastUpdatePath);
        throw e;
      }
    }

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

  async checkHash(hash, filePath) {
    const fileHash = await calcSha256Hash(filePath);
    if (fileHash !== hash) {
      throw new Error(
        `Update is corrupted. Expected hash: ${hash}, actual: ${fileHash}`
      );
    }
  }
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
