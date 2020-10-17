const { app, BrowserWindow, ipcMain, shell, autoUpdater, dialog, screen } = require('electron');
const path = require('path');
const http = require("http");
const { useMouse } = require('./useMouse')
const { useKeyboard } = require('./useKeyboard');

// Live Reload
require('electron-reload')(__dirname, {
  electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
  awaitWriteFinish: true
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
try {
  if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    app.quit();
  }
} catch (e) {
  console.error(e)
}

const createWindow = async () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    // RELEASE: to 400
    width: 400,
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
  // RELEASE: in
  mainWindow.removeMenu()

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));

  // RELEASE: out
  // mainWindow.webContents.openDevTools();

  let dialogWindow
  ipcMain.handle('openDialog', (e, sources) => {
    dialogWindow = new BrowserWindow({ parent: mainWindow, modal: true, webPreferences: { nodeIntegration: true }, useContentSize: true })
    dialogWindow.loadFile(path.join(__dirname, '../public/index.html'));
    dialogWindow.webContents.session.setPreloads([path.join(__dirname, 'preload-get-display-media-polyfill.js')])
    dialogWindow.webContents.session.setPermissionCheckHandler(async (webContents, permission, details) => {
      return true
    })
    dialogWindow.webContents.session.setPermissionRequestHandler(async (webContents, permission, callback, details) => {
      callback(true)
    })
    dialogWindow.removeMenu()
    setTimeout(() => {
      dialogWindow.send('sources', sources)
    }, 500);
    // updateの確認
    setTimeout(() => {
      addUpdateProcess()
    }, 1000)
    dialogWindow.show('ready-to-show', () => dialogWindow.show())
    return
  })
  let windowName = ""
  ipcMain.handle('decideWindow', (e, id, name) => {
    windowName = name
    mainWindow.webContents.send('id', id, name)
    dialogWindow.hide()
    return
  })
  let reqUrl = ""
  ipcMain.handle('login', async () => {
    if (reqUrl) {
      return reqUrl
    }
    const REDIRECT_URL = 'http://localhost:19952'
    const PORT = 19952
    await shell.openExternal('https://portablerg.ryoha.moe/#/login')
    return new Promise((resolve, reject) => {
      const server = http.createServer(function (req, res) {
        res.writeHead(200);
        res.end();
        reqUrl = req.url
        resolve(req.url)
        server.close()
      });
      server.listen(PORT);
    })
  })
  ipcMain.handle('getWindowRect', (e) => {
    if (windowName.startsWith('Screen')) {
      const primaryDisplay = screen.getPrimaryDisplay()
      if (windowName.includes('1')) {
        return {
          top: primaryDisplay.bounds.y,
          left: primaryDisplay.bounds.x,
          right: primaryDisplay.bounds.width + primaryDisplay.bounds.x,
          bottom: primaryDisplay.bounds.height + primaryDisplay.bounds.y
        }
      } else {
        for (const display of screen.getAllDisplays()) {
          if (display.id !== primaryDisplay.id) {
            return {
              top: display.bounds.y,
              left: display.bounds.x,
              right: display.bounds.width + display.bounds.x,
              bottom: display.bounds.height + display.bounds.y
            }
          }
        }
      }
    }

    const { U , DStruct } = require('win32-api')
    const ref = require("ref-napi")
    const StructDi = require('ref-struct-di')
    const Struct = StructDi(ref)

    const user32 = U.load()  // load all apis defined in lib/{dll}/api from user32.dll
    const lpszWindow = Buffer.from(windowName, 'ucs2')
    const hWnd = user32.FindWindowExW(0, 0, null, lpszWindow)

    if (typeof hWnd === 'number' && hWnd > 0
      || typeof hWnd === 'bigint' && hWnd > 0
      || typeof hWnd === 'string' && hWnd.length > 0
    ) {
      const rect = new Struct(DStruct.RECT)()
      const res = user32.GetWindowRect(hWnd, rect.ref())
      if (res) {
        const resRect = {
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
        }
        return resRect
      }
    }
    return null
  })
  const {
    scroll,
    init,
    dispose,
    move,
    dragEdge,
    dragging,
    click,
    moveClick,
    moveDragStart,
    moveDragging
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
    scroll(dPoint)
    return
  })
  ipcMain.handle("move", (e, dPoint) => {
    move(dPoint);
    return;
  });
  ipcMain.handle("dragStart", (e) => {
    dragEdge({ down: 'down', button: 'left' });
    return;
  });
  ipcMain.handle("dragEnd", (e) => {
    dragEdge({ down: 'up', button: 'left' });
    return;
  });
  ipcMain.handle("dragging", (e, dPoint) => {
    dragging(dPoint);
    return;
  });
  ipcMain.handle("click", (e) => {
    click();
    return;
  });
  ipcMain.handle("moveClick", (e, point) => {
    moveClick(point);
    return;
  });
  ipcMain.handle("moveDragStart", (e, point) => {
    moveDragStart(point);
    return;
  });
  ipcMain.handle("moveDragging", (e, point) => {
    moveDragging(point);
    return;
  });
  const { keyUp, keyDown } = useKeyboard()
  ipcMain.handle('keyDown', (e, type) => {
    keyDown(type)
  })
  ipcMain.handle('keyUp', (e, type) => {
    keyUp(type)
  })

  let isRequest = false
  const addUpdateProcess = () => {
    try {
      if (!isRequest) {
        isRequest = true
        mainWindow.webContents.send('error', 'update start')
        autoUpdater.setFeedURL("https://github.com/ryoha000/portablerg-electron/releases/latest/download");
        mainWindow.webContents.send('error', 'fired feedURL')
        autoUpdater.checkForUpdates()
        mainWindow.webContents.send('error', 'fired check')
        autoUpdater.on("update-downloaded", () => {
          mainWindow.webContents.send('error', 'update existed')
          dialog.showMessageBox({
            type: 'question',
            buttons: ['再起動', 'あとで'],
            defaultId: 0,
            message: '新しいバージョンをダウンロードしました。再起動しますか？',
            detail: message
          }, response => {
            if (response === 0) {
              setTimeout(() => autoUpdater.quitAndInstall(), 100);
            }
          });
        });
        autoUpdater.on("update-not-available", () => {
          mainWindow.webContents.send('error', 'update not existed')
        });
        autoUpdater.on("error", (e) => {
          mainWindow.webContents.send('error', 'err')
          dialog.showMessageBox({
            message: "アップデートエラーが起きました",
            buttons: ["OK"]
          });
          mainWindow.webContents.send('error', e.toString())
          mainWindow.webContents.send('error', e)
        });
      }
    } catch (e) {
      try {
        mainWindow.webContents.send('error', e.toString())
        mainWindow.webContents.send('error', e)
      } catch {}
      console.error(e)
    }
  }
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
