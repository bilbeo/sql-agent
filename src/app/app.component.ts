import { Component, OnInit, NgZone } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import dotenv from 'dotenv';
import { MatIconRegistry, MatSnackBar } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { SharedService } from './providers/shared.service';
import { IntercomService } from './providers/intercom.service';
const shell = require('electron').shell;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    public electronService: ElectronService,
    private translate: TranslateService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private sharedService: SharedService,
    private snackBar: MatSnackBar,
    private zone: NgZone,
    private intercomService: IntercomService
  ) {
    this.translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);
    // add .env variables in process.env
    dotenv.config();
    if (electronService.isElectron()) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
    this.registerIcons();
  }

  ngOnInit() {
    this.electronService.ipcRenderer.on('check-for-update', (event, message) => {
      this.intercomService.trackEvent('desktop-app-auto-update-failed', {
        source: 'sql-agent',
      });
      this.checkForUpdates();
    });
    this.electronService.ipcRenderer.on('app-update-success', (event, message) => {
      this.intercomService.trackEvent('desktop-app-auto-updated', {
        source: 'sql-agent'
      });
    });
  }

  checkForUpdates() {
    this.sharedService.checkLatestVersion()
      .then((res) => {
        this.zone.run(() => {
          this.showAlert(res['message'], res['url'], 'Update');
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  showAlert(message: string, url, action?: string) {
    this.snackBar.open(message, action, {
      duration: 10000
    })
      .onAction().subscribe(() => {
        if (action === 'Update') {
          shell.openExternal(url);
        }
      });
  }

  registerIcons() {
    // register svg icons that will be used with material's mat-icon component
    this.iconRegistry.addSvgIcon('edit-icon', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/svg-icons/edit.svg'));
    this.iconRegistry.addSvgIcon('back-icon', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/svg-icons/back_arrow.svg'));
    this.iconRegistry.addSvgIcon('exit-icon', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/svg-icons/exit_icon.svg'));
    this.iconRegistry.addSvgIcon('dropdown-icon', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/svg-icons/drop_down_icon.svg'));
    this.iconRegistry.addSvgIcon('done-icon', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/svg-icons/done_icon.svg'));
    this.iconRegistry.addSvgIcon('help-icon', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/svg-icons/help_icon.svg'));
    this.iconRegistry.addSvgIcon('offline-icon', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/svg-icons/wifi_offline_icon.svg'));
  }

}
