const { app, BrowserWindow, ipcMain, desktopCapturer, remote } = require('electron');
const path = require('path');
const { setupWebSocketServer, setupClientServer } = require('./server')
const { getPrivateIP, removePrevFireWall, addNewFireWall, getSetting, updateSetting, resetSetting } = require('./ipcHandlers')
const { useMouse } = require('./useMouse')
const { useKeyboard } = require('./useKeyboard')

// Live Reload
require('electron-reload')(__dirname, {
  electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
  awaitWriteFinish: true
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = async () => {
  const setting = await getSetting()
  setupClientServer(setting.browserPort)
  setupWebSocketServer(setting.browserPort + 1)
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.webContents.session.setPreloads([path.join(__dirname, 'preload-get-display-media-polyfill.js')])
  mainWindow.webContents.session.setPermissionCheckHandler(async (webContents, permission, details) => {
    return true
  })
  mainWindow.webContents.session.setPermissionRequestHandler(async (webContents, permission, callback, details) => {
    callback(true)
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  let dialog
  ipcMain.handle('openDialog', (e, sources) => {
    dialog = new BrowserWindow({ parent: mainWindow, modal: true, webPreferences: { nodeIntegration: true }, useContentSize: true })
    dialog.loadURL(`http://${setting.privateIP}:${setting.browserPort}/#/select`)
    dialog.webContents.session.setPreloads([path.join(__dirname, 'preload-get-display-media-polyfill.js')])
    dialog.webContents.session.setPermissionCheckHandler(async (webContents, permission, details) => {
      return true
    })
    dialog.webContents.session.setPermissionRequestHandler(async (webContents, permission, callback, details) => {
      callback(true)
    })
    dialog.webContents.openDevTools()
    setTimeout(() => {
      console.log('send sources')
      dialog.send('sources', sources)
    }, 500);
    dialog.show('ready-to-show', () => dialog.show())
    return
  })
  ipcMain.handle('decideWindow', (e, id, name) => {
    mainWindow.webContents.send('id', id, name)
    dialog.hide()
    return
  })
  ipcMain.handle('getPrivateIP', (e) => {
    const ip = getPrivateIP()
    return ip
  })
  ipcMain.handle('removePrevFireWall', (e, addr, port) => {
    removePrevFireWall(addr, port)
    return
  })
  ipcMain.handle('addNewFireWall', (e, addr, port) => {
    addNewFireWall(addr, port)
    return
  })
  ipcMain.handle('getSetting', async (e, addr, port) => {
    const setting = await getSetting(addr, port)
    return setting
  })
  ipcMain.handle('updateSetting', async (e, newSetting) => {
    await updateSetting(newSetting)
    return
  })
  ipcMain.handle('resetSetting', async (e) => {
    await resetSetting()
    return
  })
  const {
    scroll,
    init,
    dispose,
    move,
    dragEdge,
    dragging,
    click
  } = useMouse()
  ipcMain.handle('init', (e) => {
    init()
    return
  })
  ipcMain.handle('dispose', (e) => {
    dispose()
    return
  })
  ipcMain.handle('scroll', (e, dPoint) => {
    console.log('scroll', dPoint)
    scroll(dPoint)
    return
  })
  ipcMain.handle("move", (e, dPoint) => {
    console.log('move: ', dPoint)
    move(dPoint);
    return;
  });
  ipcMain.handle("dragStart", (e) => {
    console.log("dragStart")
    dragEdge({ down: 'down', button: 'left' });
    return;
  });
  ipcMain.handle("dragEnd", (e) => {
    console.log("dragEnd")
    dragEdge({ down: 'up', button: 'left' });
    return;
  });
  ipcMain.handle("dragging", (e, dPoint) => {
    console.log('dragging: ', dPoint)
    dragging(dPoint);
    return;
  });
  ipcMain.handle("click", (e) => {
    console.log('click from ipcMain')
    click();
    return;
  });
  const { keyTap } = useKeyboard()
  ipcMain.handle('keyTap', (e, type) => {
    console.log('keyTap', type)
    keyTap(type)
  })
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.allowRendererProcessReuse = true

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
