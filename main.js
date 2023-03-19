// The main JS is a nodeJs process and we can consider this as our backend logic where we are going to place everything.
const { app, BrowserWindow, Menu, ipcMain, shell} = require('electron')
const path = require('path')
const os = require('os')
const fs = require('fs')
const resizeImg = require('resize-img')

// When we create a new window we are instantiating a BrowserWindow, by using Chromium

const isDev = process.env.NODE_ENV !== 'development'
const isMac = process.platform === 'darwin'

let mainWindow

function createMainWindow() {
  mainWindow = new BrowserWindow({
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

  // Remove main window from memoey on close
  mainWindow.on('closed', () => {mainWindow = null})

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

// Respond to ipcRender resize request
ipcMain.on('image:resize', (e, options) => {
  options.dest = path.join(os.homedir(), 'imageresizer')
  resizeImage(options)
  console.log(options)
})

async function resizeImage({imgPath, width, heigth, dest}) {
  try{
    const newPath = await resizeImg(fs.readFileSync(imgPath),{
      width: +width,
      heigth: +heigth,
    })

    const fileName = path.basename(imgPath)

    if(!fs.existsSync(dest)) {
      fs.mkdirSync(dest)
    }

    fs.writeFileSync(path.join(dest, fileName), newPath)
    mainWindow.webContents.send('image:done')

    // Open dest folder
    shell.openPath(dest)
  }catch(error){
    console.log(error)
  }
}

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})