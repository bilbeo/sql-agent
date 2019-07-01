import { Injectable } from '@angular/core';


@Injectable()
export class IntercomService {

  boot(settings?){
    settings = settings? settings: {};
    settings.app_id = process.env.INTERCOM_KEY;
    (<any>window).Intercom('boot',settings);
  }

  update(newSettings){
    (<any>window).Intercom('update',newSettings);
  }

  shutdown(){
    (<any>window).Intercom('shutdown');
  }

  trackEvent(eventName, metadata){
    (<any>window).Intercom('trackEvent', eventName, metadata);
  }
}