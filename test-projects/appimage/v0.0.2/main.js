'use strict';

const { app, BrowserWindow } = require('electron');
const { request }            = require('http');

const SHOW_WINDOW = false;

request(`http://localhost:3003/finish?pid=${process.pid}`, (res) => {
  res.on('data', () => SHOW_WINDOW || app.quit());
}).end();

if (SHOW_WINDOW) {
  app.on('ready', () => {
    const wnd = new BrowserWindow({ width: 200, height: 150 });
    wnd.loadURL('data:text/html,<b>v0.0.2</b>');
  });

  app.on('window-all-closed', () => app.quit());
}
