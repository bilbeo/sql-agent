import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from '../interfaces/user';
import { AppConfig } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable()
export class UserService {
  private baseUrl;
  private userToken;
  user: User;

  constructor(
    private sharedService: SharedService,
    private http: HttpClient,
    private router: Router
  ) {
    this.userToken = this.sharedService.getFromStorage('token');
    if(AppConfig['environment'] === 'PROD'){
      this.baseUrl = AppConfig['server'];
    } else {
      this.baseUrl = process.env.BILBEO_SERVER;
    }
  }

  signin(loginData) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(this.baseUrl + '/api/user/authenticate', loginData, httpOptions)
      .pipe(
        map((result) => {
          if (result['status'] === 'success') {
            this.userToken = result['token'];
            this.sharedService.setInStorage('token', result['token']);
            this.sharedService.setInStorage('userId', result['id']);
          }
          return result;
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(error.error.message);
        })
      );
  }

  signout() {
    return new Observable((observer) => {
      this.user = null;
      this.userToken = null;
      this.sharedService.removeFromStorage('userId');
      this.sharedService.removeFromStorage('token');
      observer.next('Logged out!');
      observer.complete();
    });
  }

  getUser(): Observable<User> {
    if (this.user) {
      return of(this.user);
    } else {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.userToken
        })
      };
      return this.http.post(this.baseUrl + '/api/user/get', {}, httpOptions)
        .pipe(
          map((result) => {
            this.user = Object.assign({}, result['user']);
            return result['user'];
          }),
          catchError((error: HttpErrorResponse) => {
            this.sharedService.setInStorage('token', null);
            this.sharedService.setInStorage('userId', null);
            this.router.navigate(['/']);
            return throwError(error.error.message || error.error);
          })
        );
    }
  }

}
