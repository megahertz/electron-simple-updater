'use strict';

/* eslint-disable no-path-concat, import/no-unresolved */

const { app, BrowserWindow, ipcMain } = require('electron');
const updater = require('electron-simple-updater');

let mainWindow;

updater.init({
  checkUpdateOnStart: false,
  autoDownload: false,
  logger: {
    info(...args) { ipcSend('update-log', 'info', ...args); },
    warn(...args) { ipcSend('update-log', 'warn', ...args); },
  },
});

updater
  .on('update-available', m => ipcSend('update-available', m))
  .on('update-downloading', () => ipcSend('update-downloading'))
  .on('update-downloaded', () => ipcSend('update-downloaded'));

ipcMain.handle('getBuild', () => updater.buildId);
ipcMain.handle('getVersion', () => updater.version);
ipcMain.handle('checkForUpdates', () => { updater.checkForUpdates(); });
ipcMain.handle('downloadUpdate', () => { updater.downloadUpdate(); });
ipcMain.handle('quitAndInstall', () => { updater.quitAndInstall(); });
ipcMain.handle('setOption', (_, opt, val) => { updater.setOptions(opt, val); });

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 640,
    height: 480,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL('file://' + __dirname + '/index.html');
});

function ipcSend(event, ...args) {
  mainWindow?.webContents.send('updater-event', event, ...args);
}
