const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
// Note: We use dynamic import for electron-is-dev to support ES modules if needed, or just hardcode isDev
const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "CloserAI - Desktop OS",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Remove default menu
  mainWindow.setMenuBarVisibility(false);

  // Load React App
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;
    
  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // Register Global Shortcut (e.g., Ctrl+Shift+M to wake up Closer)
  globalShortcut.register('CommandOrControl+Shift+M', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      // Send IPC event to React to instantly start voice listening
      mainWindow.webContents.send('os-wakeup');
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
