import { app, BrowserWindow, screen, Menu, Tray, nativeImage, dialog } from 'electron';
const { autoUpdater } = require('electron-updater');
import * as path from 'path';
import * as url from 'url';
import * as AutoLaunch from 'auto-launch';
import * as tray from './tray';
const logger = require("electron-log");

// checking for app newer version
function checkForUpdates() {
  autoUpdater.on('update-available', (info) => {
    logger.info("update available", info);
  });

  autoUpdater.on('checking-for-update', (info) => {
    logger.info("Checking for updates");
  });

  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    };
    dialog.showMessageBox(dialogOpts, (response) => {
      if (response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });
  autoUpdater.on('error', message => {
    logger.error('There was a problem updating the application');
    logger.error(message);
  });

  autoUpdater.checkForUpdatesAndNotify();
}

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

// auto launch on OS startup, skipped in development
function enableAutoLaunch() {
  if (serve) {
    return;
  }
  let config = {
    name: app.getName(),
    path: process.execPath,
    isHidden: true
  };

  if (process.env.APPIMAGE) {
    config = Object.assign(config, { path: process.env.APPIMAGE });
  }

  const autoLauncher = new AutoLaunch(config);
  autoLauncher.enable();

  autoLauncher.isEnabled()
    .then(function (isEnabled) {
      if (isEnabled) {
        return;
      }
      autoLauncher.enable();
    })
    .catch(function (err) {
      logger.error('err', err);
    });
}

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
    icon: path.join(__dirname, 'src/favicon.png')
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

  // when app is launched on system startup, launch it as minimzed
  const startMinimized = args.some(val => val === '--hidden');
  if (startMinimized == true) {
    win.hide();
    logger.info('App is started by AutoLaunch');
  } else {
    logger.info('App is started by User');
  }
}

try {
  // run only one instance of the app
  const isFirstInstance = app.requestSingleInstanceLock();

  if (!isFirstInstance) {
    console.log('not the first instance');
    app.quit();
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      console.log('second instance');
      // Someone tried to run a second instance, we should focus our window.
      if (win) {
        if (!win.isVisible()) {
          win.show();
        }
        win.focus();
      }
    });

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', () => {
      createWindow();
      checkForUpdates();
      tray.initTray(win);
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

    app.on('before-quit', function () {
      app['isQuiting'] = true;
    });
  }

} catch (e) {
  // Catch Error
  // throw e;
}
