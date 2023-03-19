// The main JS is a nodeJs process and we can consider this as our backend logic where we are going to place everything.
const { app, BrowserWindow, Menu} = require('electron')
const path = require('path')
// When we create a new window we are instantiating a BrowserWindow, by using Chromium

const isDev = process.env.NODE_ENV !== 'development'
const isMac = process.platform === 'darwin'

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    title: 'Image Resizer',
    width: isDev ? 1000 : 500,
  })

  //Open DEV tools in dev_env
  if(isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

// Boiler plate
// App is ready
app.whenReady().then(() => {
  createMainWindow()

  // Implement menu
  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

// Menu Template
const menu = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        click: () => app.quit(),
        accelerator: 'CmdOrCtrl+W'
      }
    ]
  }
]

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})