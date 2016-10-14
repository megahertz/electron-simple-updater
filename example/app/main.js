'use strict';

const {app, BrowserWindow} = require('electron');
const updater              = require('electron-simple-updater');


let mainWindow;

updater
  .init({
    logger: require('electron-log'),
    checkUpdatesOnStart: false
  })
  .on('update-available', (meta) => {
    if (mainWindow) {
      mainWindow.webContents.send('update-available', meta);
    }
  })
  .on('update-not-available', () => {
    if (mainWindow) {
      mainWindow.webContents.send('update-not-available');
    }
  })
  .on('update-downloaded', (meta) => {
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded', meta);
    }
  });


app.on('ready', () => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800
  });

  mainWindow.loadURL('file://' + __dirname + '/index.html');

  updater.checkForUpdates();
});