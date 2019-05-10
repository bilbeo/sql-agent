import { Component, OnDestroy } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import dotenv from 'dotenv';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { SharedService } from './providers/shared.service';
// require('dotenv').config();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  constructor(
    public electronService: ElectronService,
    private translate: TranslateService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private sharedService: SharedService
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
    this.sharedService.getConnectionStatus();
  }

  registerIcons() {
    // register svg icons that will be used with material's mat-icon component
    this.iconRegistry.addSvgIcon('edit-icon', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/svg-icons/edit.svg'));
    this.iconRegistry.addSvgIcon('back-icon', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/svg-icons/back_ios.svg'));
    this.iconRegistry.addSvgIcon('exit-icon', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/svg-icons/exit_icon.svg'));
    this.iconRegistry.addSvgIcon('dropdown-icon', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/svg-icons/drop_down_icon.svg'));
    this.iconRegistry.addSvgIcon('done-icon', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/svg-icons/done_icon.svg'));
    this.iconRegistry.addSvgIcon('help-icon', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/svg-icons/help_icon.svg'));
  }

  ngOnDestroy() {
    this.sharedService.removeConnectionListeners();
  }
}
