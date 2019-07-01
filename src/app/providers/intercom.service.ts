import { Injectable } from '@angular/core';
import { AppConfig } from '../../environments/environment';

@Injectable()
export class IntercomService {

  boot(settings?) {
    settings = settings ? settings : {};
    if (AppConfig['environment'] === 'PROD') {
      settings.app_id = AppConfig['intercom'];
    } else {
      settings.app_id = process.env.INTERCOM_KEY;
    }

    (<any>window).Intercom('boot', settings);
  }

  update(newSettings) {
    (<any>window).Intercom('update', newSettings);
  }

  shutdown() {
    (<any>window).Intercom('shutdown');
  }

  trackEvent(eventName, metadata) {
    (<any>window).Intercom('trackEvent', eventName, metadata);
  }
}
