import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../providers/user.service';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user';
import { CronService } from '../../providers/cron.service';
import { Subscription } from 'rxjs';

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

  constructor(
    private userService: UserService,
    private router: Router,
    private cronService: CronService) { }

  ngOnInit() {
    this.getUserDetails();
    // get notified when cron starts or finishes to inform the user
    this.cronSubscription = this.cronService.cronChangeObservable.subscribe((status) => {
      if (status === 'starting') {
        console.log('started');

        this.cronInProgress = true;
      } else {
        console.log('finished');
        this.cronInProgress = false;
      }
    });
  }

  getUserDetails() {
    this.userService.getUser()
      .subscribe(
        (user) => {
          this.user = user;
          this.cronService.initCron();
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
  }
}
