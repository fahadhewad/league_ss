const { contextBridge, ipcRenderer } = require('electron');

// Minimal, safe bridge between the UI and the main process.
contextBridge.exposeInMainWorld('overlay', {
  close: () => ipcRenderer.send('overlay:close'),
  setClickThrough: (enabled) => ipcRenderer.send('overlay:clickthrough', enabled),
  resize: (w, h) => ipcRenderer.send('overlay:resize', { w, h })
});
