import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../providers/user.service';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user';
import { CronService } from '../../providers/cron.service';
import { Subscription } from 'rxjs';
import { SharedService } from '../../providers/shared.service';
import { IntercomService } from '../../providers/intercom.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  message;
  output;
  user: User;
  workspaces;
  cronSubscription: Subscription;
  cronInProgress;
  cronCheckInProgress;
  isOnline = true;
  connectionSubs;
  appVersion = require('electron').remote.app.getVersion();

  constructor(
    private userService: UserService,
    private router: Router,
    private cronService: CronService,
    private sharedService: SharedService,
    private intercomService: IntercomService) { }

  ngOnInit() {
    // get notified when cron starts or finishes to inform the user
    this.cronSubscription = this.cronService.cronChangeObservable.subscribe((status) => {
      if (status === 'checking') {
        this.cronCheckInProgress = true;
        this.cronInProgress = false;
      } else if (status === 'running') {
        this.cronInProgress = true;
        this.cronCheckInProgress = false;
      } else {
        this.cronInProgress = false;
        this.cronCheckInProgress = false;
      }
    });
    this.isOnline = this.sharedService.getConnectionStatus();
    if (this.isOnline) {
      this.getUserDetails();
    }
    this.connectionSubs = this.sharedService.connectionStatusChange.subscribe((isOnlineRes) => {
      this.isOnline = isOnlineRes;
      if (!this.user && isOnlineRes) {
        setTimeout(() => {
          this.getUserDetails();
        }, 500);
      }
    });
  }

  getUserDetails() {
    this.userService.getUser()
      .subscribe(
        (user) => {
          this.user = user;
          if (!this.cronService.cronJob) {
            this.cronService.initCron();
          }
          this.intercomService.boot({
            email: this.user.mail,
            user_id: this.user._id,
            name: this.user.firstName + ' ' + this.user.lastName,
            language_override: this.user.language.split('_')[0] || 'en',
            // without the below property, intercom widget is not shown
            widget: { activator: '#IntercomDefaultWidget' }
          });
        },
        (err) => {
          this.message = err;
        }
      );
  }

  signout() {
    this.userService.signout().subscribe(
      (result) => {
        this.intercomService.shutdown();
        this.router.navigate(['/auth']);
      },
      (err) => { });
  }

  goToMyWorkspaces() {
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.cronSubscription.unsubscribe();
    this.cronService.stopCron();
    this.connectionSubs.unsubscribe();
    this.sharedService.removeConnectionListeners();
  }
}
