'use strict';

const {app, BrowserWindow} = require('electron');
const updater              = require('../../index');
//const updater              = require('electron-simple-updater');


updater.init({
  logger: require('electron-log')
});

let mainWindow;
app.on('ready', () => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800
  });

  mainWindow.loadURL('file://' + __dirname + '/index.html');
});