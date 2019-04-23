import { app, BrowserWindow, screen, Menu, Tray, nativeImage } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as AutoLaunch from 'auto-launch';

// auto launch on OS startup, skipped in development
function enableAutoLaunch() {
  if (serve) {
    return;
  }
  let alConfig = {
    name: app.getName(),
    path: process.execPath,
    isHidden: true
  };

  if (process.env.APPIMAGE) {
    alConfig = Object.assign(alConfig, { path: process.env.APPIMAGE });
  }

  const autoLauncher = new AutoLaunch(alConfig);
  autoLauncher.enable();

  autoLauncher.isEnabled()
    .then(function (isEnabled) {
      if (isEnabled) {
        return;
      }
      autoLauncher.enable();
    })
    .catch(function (err) {
      console.log("err", err);
    });
}

// enable tray minimizing
function createTray() {
  let tray = null;
  const icon = nativeImage.createFromPath(path.join(__dirname, 'bilbeoGA.png'));
  
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App', click: function () {
        win.show();
      }
    },
    {
      label: 'Quit', click: function () {
        app['isQuiting'] = true;
        tray.destroy();
        app.quit();
      }
    }
  ]);

  tray.setToolTip('SQL Agent');
  tray.setContextMenu(contextMenu);

  win.on('minimize', function (event) {
    event.preventDefault();
    win.hide();
  });

  win.on('close', function (event) {
    console.log("win.on.close", app['isQuiting'])
    if (!app['isQuiting']) {
      event.preventDefault();
      win.hide();
    }

    return false;
  });
}

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

function createWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (serve) {
    win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', ()=>{
    createWindow();
    createTray();
  });

  enableAutoLaunch();

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
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
