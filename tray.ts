import { app, Menu, Tray, nativeImage } from 'electron';
import * as path from 'path';

/**
 * Check for libappindicator1 support before creating tray icon
 */
function checkLinuxTraySupport(cb) {
  const cp = require('child_process');

  // Check that we're on Ubuntu (or another debian system) and that we have libappindicator1.
  cp.exec('dpkg --get-selections libappindicator1', function (err, stdout) {
    if (err) {
      return cb(err);
    }
    // Unfortunately there's no cleaner way, as far as I can tell, to check
    // whether a debian package is installed:
    if (stdout.endsWith('\tinstall\n')) {
      cb(null);
    } else {
      cb(new Error('debian package not installed'));
    }
  });
}

// enable tray minimizing
function createTray(win) {
  let tray = null;
  const icon = nativeImage.createFromPath(path.join(__dirname, 'bilbeo-logo.png'));
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
    console.log('win.on.close', app['isQuiting']);
    if (!app['isQuiting']) {
      event.preventDefault();
      win.hide();
    }

    return false;
  });
}


function initTray(window) {
  if (process.platform === 'linux') {
    checkLinuxTraySupport(function (err) {
      if (!err) {
        createTray(window);
      }
    });
  } else {
    // Widows, Mac
    createTray(window);
  }
}

export {
  initTray
};
