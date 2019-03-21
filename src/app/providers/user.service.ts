import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { AppConfig } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
// import {toPromise} from 'rxjs';

@Injectable()
export class UserService {
    private baseUrl = process.env.BILBEO_SERVER;
    private userToken;
    user;

    constructor(
        private sharedService: SharedService,
        private http: HttpClient) {

        this.userToken = this.sharedService.getFromStorage('token');
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
                        this.sharedService.setInStorage('token', result['token'])
                        this.sharedService.setInStorage('userId', result['id'])
                    }
                    return result;
                }),
                catchError((error: HttpErrorResponse) => {
                    return throwError(error.error.message);
                })
            );
    }


    signout() {
        return Observable.create((observer) => {
            this.sharedService.removeFromStorage('userId'),
                this.sharedService.removeFromStorage('token');

            observer.next('Logged out!');
            observer.complete();
        });
    }


    getUser() {
        // if we have this.user, we use it, if no , we make a request to backend, get user data, set this.user
    }

}