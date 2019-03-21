import { Component, OnInit } from '@angular/core';
import { UserService } from '../../providers/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
  
  }

  signout() {
    this.userService.signout().subscribe(
        (result) => { 
          this.router.navigate(['/auth']);
        },
        (err) => {});
  }

}
