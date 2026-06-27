const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require('electron');
const path = require('path');

// Single compact, transparent, always-on-top overlay window.
let win = null;

const WIN_WIDTH = 212;
const WIN_HEIGHT = 392;

function createWindow() {
  const { workArea } = screen.getPrimaryDisplay();

  win = new BrowserWindow({
    width: WIN_WIDTH,
    height: WIN_HEIGHT,
    // Dock to the right edge of the screen, a little below the top (out of the
    // way of the in-game scoreboard / minimap area).
    x: workArea.x + workArea.width - WIN_WIDTH - 12,
    y: workArea.y + 96,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    fullscreenable: false,
    // Keep keyboard focus on the game; we only need mouse clicks here.
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // 'screen-saver' level keeps it above borderless/windowed fullscreen games.
  win.setAlwaysOnTop(true, 'screen-saver');
  // Show on top of full-screen spaces (mainly relevant on macOS).
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  // Global hotkey: toggle the overlay's visibility without alt-tabbing.
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    if (!win) return;
    if (win.isVisible()) win.hide();
    else win.show();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Renderer asks to quit (the X button).
ipcMain.on('overlay:close', () => {
  app.quit();
});

// Toggle click-through so the panel never blocks game clicks when "locked".
ipcMain.on('overlay:clickthrough', (_event, enabled) => {
  if (win) win.setIgnoreMouseEvents(enabled, { forward: true });
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
