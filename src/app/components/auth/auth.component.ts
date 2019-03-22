import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../providers/shared.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../providers/user.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  loginForm: FormGroup;
  message: string;
  constructor(
    private sharedService: SharedService,
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService) {

  }

  ngOnInit() {
    this.checkUserAuthenticated();
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  checkUserAuthenticated() {
    if (this.sharedService.getFromStorage('token')) {
      this.router.navigate(['/home']);
    }
  }


  signin() {
    this.message = '';

    if (!this.loginForm.valid) {
      return;
    }

    const payload = {
      mail: this.loginForm.controls['email'].value,
      password: this.loginForm.controls['password'].value
    };

    this.userService.signin(payload).subscribe(
      (res) => {
        this.router.navigate(['/home']);
      },
      (errMessage) => {
        this.message = errMessage;
      });

  }
}
