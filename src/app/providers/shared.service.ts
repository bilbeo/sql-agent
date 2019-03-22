import { Injectable } from '@angular/core';
const Store = require('electron-store');

@Injectable()
export class SharedService {
    private storage;

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
}

