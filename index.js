const ipc = require('electron').ipcMain;
const { Menu, dialog, MenuItem } = require('electron');
const { app, BrowserWindow } = require('electron/main');
const path = require('node:path');
const { setupTitlebar, attachTitlebarToWindow } = require('custom-electron-titlebar/main');
const fs = require('fs');
const fetch = require('node-fetch');

setupTitlebar();

function createWindow () {
  const win = new BrowserWindow({
    // icon: path.resolve('renderer', 'multum.png'),
		width: 1000,
		height: 600,
    frame: true,
		titleBarStyle: 'hidden',
		titleBarOverlay: true,
		webPreferences: {
			sandbox: false,
			preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule: true
		}
	})

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  win.loadFile('renderer/manager.html')
  attachTitlebarToWindow(win);
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: "Open Mods",
        /**
         * 
         * @param {MenuItem} menuItem 
         * @param {BrowserWindow} browserWindow 
         */
        click: async (menuItem, browserWindow) => {
          const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openFile', 'multiSelections'],
            filters: [
              {name: "Minecraft Mod", extensions: ['jar', 'zip']}
            ]
          });
          if(!canceled) browserWindow.webContents.send('openmods', filePaths)
        }
      },
      { role: 'quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { 
        label: "Settings",
        click: async () => {
          const win = new BrowserWindow({
            width: 800,
            height: 600,
            autoHideMenuBar: true,
            webPreferences: {
              preload: path.join(__dirname, 'preload.js')
            }
          })
        
          win.loadFile('renderer/settings.html')
        }
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { 
        label: "Home",
        /**
         * 
         * @param {MenuItem} menuItem 
         * @param {BrowserWindow} browserWindow 
         */
        click: async (menuItem, browserWindow) => {
          browserWindow.loadFile('renderer/manager.html')
        }
      },
      { role: 'close' }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Help may be avalible on github when I have time'
      }
    ]
  }
]