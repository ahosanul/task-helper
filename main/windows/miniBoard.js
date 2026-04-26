const { BrowserWindow } = require('electron');
const path = require('path');

let miniBoardWindow = null;

function createMiniBoardWindow() {
  if (miniBoardWindow) {
    miniBoardWindow.focus();
    return miniBoardWindow;
  }

  miniBoardWindow = new BrowserWindow({
    width: 350,
    height: 500,
    minWidth: 280,
    minHeight: 300,
    alwaysOnTop: true,
    frame: false,
    resizable: true,
    movable: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    miniBoardWindow.loadURL('http://localhost:5173#/miniboard');
  } else {
    miniBoardWindow.loadFile(path.join(__dirname, '../../renderer/dist/index.html'), { hash: '/miniboard' });
  }

  miniBoardWindow.once('ready-to-show', () => {
    miniBoardWindow.show();
  });

  miniBoardWindow.on('closed', () => {
    miniBoardWindow = null;
  });

  return miniBoardWindow;
}

function getMiniBoardWindow() {
  return miniBoardWindow;
}

function toggleMiniBoard() {
  if (miniBoardWindow) {
    if (miniBoardWindow.isVisible()) {
      miniBoardWindow.hide();
      return false;
    } else {
      miniBoardWindow.show();
      return true;
    }
  } else {
    createMiniBoardWindow();
    return true;
  }
}

module.exports = {
  createMiniBoardWindow,
  getMiniBoardWindow,
  toggleMiniBoard
};
