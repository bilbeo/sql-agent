import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../providers/user.service';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user';
import { CronService } from '../../providers/cron.service';
import { Subscription } from 'rxjs';
import { SharedService } from '../../providers/shared.service';

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

  constructor(
    private userService: UserService,
    private router: Router,
    private cronService: CronService,
    private sharedService: SharedService) { }

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
        },
        (err) => {
          this.message = err;
        }
      );
  }

  signout() {
    this.userService.signout().subscribe(
      (result) => {
        this.router.navigate(['/auth']);
      },
      (err) => { });
  }

  ngOnDestroy() {
    this.cronSubscription.unsubscribe();
    this.cronService.stopCron();
    this.connectionSubs.unsubscribe();
    this.sharedService.removeConnectionListeners();
  }
}
