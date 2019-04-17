import { Component, OnInit } from '@angular/core';
import { UserService } from '../../providers/user.service';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  message;
  output;
  user: User;
  workspaces;

  constructor(
    private userService: UserService,
    private router: Router) { }

  ngOnInit() {
    this.getUserDetails();

  }

  getUserDetails() {
    this.userService.getUser()
      .subscribe(
        (user) => {
          this.user = user;
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

}
