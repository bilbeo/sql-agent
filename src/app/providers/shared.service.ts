import { Injectable } from '@angular/core';
import { Subject, ReplaySubject } from 'rxjs';
const Store = require('electron-store');

@Injectable()
export class SharedService {
  isOnline;
  private storage;
  private connectionStatusSubject = new ReplaySubject<any>();
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

  private offlineListener() {
    this.isOnline = false;
    this.emitConnectionStatus(this.isOnline);
  }

  private onlineListener() {
    this.isOnline = true;
    this.emitConnectionStatus(this.isOnline);
  }
}
