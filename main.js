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
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }, //nodeJs is used in the main process, however in the renderer process we can't for security reasons
    // with the webPreferences we can use node modules in render safety
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

function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: 'About Image Resizer',
    width: 300,
    height: 300,
  })

  aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

// Menu Template
const menu = [
  ...(isMac ? [{
    label: app.name,
    submenu: [
      {
        label: 'About',
        click: createAboutWindow
      }
    ]
  }] : []),
  {
    role: 'fileMenu',
  },
  ...(!isMac ? [
    {
      label: 'Help',
      submenu: [{
        label: 'About',
        click: createAboutWindow
      }]
    }
  ] : [])
]

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})