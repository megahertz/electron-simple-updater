'use strict';

/* eslint-env browser */
/* eslint-disable no-restricted-globals, no-alert */

const { ipcRenderer } = require('electron');

main();

function main() {
  ipcRenderer.invoke('getVersion').then(res => setText('version', res));
  ipcRenderer.invoke('getBuild').then(build => setText('build', build));

  attachUiHandlers();
  attachUpdaterHandlers();
}

function attachUiHandlers() {
  const btnUpdate = document.getElementById('btn-update');
  const btnInstall = document.getElementById('btn-install');
  const chkAutomatically = document.getElementById('automatically');

  btnUpdate.addEventListener('click', () => {
    ipcRenderer.invoke('checkForUpdates');
    document.body.classList.add('update-downloading');
  });

  btnInstall.addEventListener('click', () => {
    ipcRenderer.invoke('downloadUpdate');
  });

  chkAutomatically.addEventListener('change', function onChange() {
    ipcRenderer.invoke('setOption', 'autoDownload', this.checked);
  });
}

function attachUpdaterHandlers() {
  ipcRenderer.on('updater-event', (_, eventName, ...args) => {
    console.log({ eventName, args });

    switch (eventName) {
      case 'update-available': return onUpdateAvailable(args[0]);
      case 'update-downloading': return onUpdateDownloading();
      case 'update-downloaded': return onUpdateDownloaded();
      case 'update-log': return log(...args);
      default: return null;
    }
  });

  function onUpdateAvailable(meta) {
    setText('new-version', meta.version);
    setText('description', meta.readme);
    document.body.className = 'update-available';
  }

  function onUpdateDownloading() {
    document.body.classList.add('update-downloading');
  }

  function onUpdateDownloaded() {
    if (confirm('The app has been updated. Do you like to restart it now?')) {
      ipcRenderer.invoke('quitAndInstall');
    }
  }

  function log(level, ...texts) {
    const logMessages = document.getElementById('log-messages');
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(`[${level}] ${texts.join(' ')}`));
    logMessages.appendChild(p);
  }
}

function setText(id, text) {
  document.getElementById(id).appendChild(
    document.createTextNode(text)
  );
}
