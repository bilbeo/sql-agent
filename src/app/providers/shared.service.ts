import { Injectable } from '@angular/core';
import { Subject, ReplaySubject } from 'rxjs';
const Store = require('electron-store');
const got = (<any>window).require('got');
const semver = (<any>window).require('semver');

@Injectable()
export class SharedService {
  isOnline;
  private storage;
  private connectionStatusSubject = new Subject<any>();
  connectionStatusChange = this.connectionStatusSubject.asObservable();

  constructor() {
    this.storage = new Store();
  }

  getFromStorage(key) {
    return this.storage.get(key);
  }

  setInStorage(key, value) {
    this.storage.set(key, value);
  }

  removeFromStorage(key) {
    this.storage.delete(key);
  }

  // this method is called whenever there are potential changes in connectionStatus
  emitConnectionStatus(status) {
    this.connectionStatusSubject.next(status);
  }

  monitorConnection() {
    window.addEventListener('online', this.onlineListener.bind(this));
    window.addEventListener('offline', this.offlineListener.bind(this));
  }

  removeConnectionListeners() {
    window.removeEventListener('offline', this.offlineListener);
    window.removeEventListener('online', this.onlineListener);
  }

  getConnectionStatus() {
    this.isOnline = window.navigator.onLine;
    this.monitorConnection();
    return window.navigator.onLine;
  }

  checkLatestVersion() {
    return new Promise((resolve, reject) => {
      got.head('https://github.com/bilbeo/sql-agent/releases/latest')
        .then(res => {
          let latestTag = res.socket._httpMessage.path.split('/').pop();
          return latestTag;
        })
        .then((tag) => {
          // Check if tag is valid semver
          if (!tag || !semver.valid(semver.clean(tag))) {
            reject('Could not find a valid release tag.');
          }
          const currentVersion = require('electron').remote.app.getVersion();
          const latestVersion = semver.clean(tag);
          
          // Compare with current version.
          if (semver.lt(currentVersion, latestVersion)) {
            resolve({
              message: `There is a newer version (${tag}) of the app.`,
              url: "https://github.com/bilbeo/sql-agent/releases/latest"
            });
          } else {
            reject('There is no newer version.');
          }
        })
        .catch(err => {
          if (err) {
            reject('Unable to get latest release tag from Github.')
          }
        });
    })
  }

  private offlineListener() {
    this.isOnline = false;
    this.emitConnectionStatus(this.isOnline);
  }

  private onlineListener() {
    this.isOnline = true;
    this.emitConnectionStatus(this.isOnline);
  }
}
