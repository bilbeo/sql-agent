import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Workspace } from '../interfaces/workspace';

@Injectable()
export class WorkspaceService {
  private baseUrl = process.env.BILBEO_SERVER;
  private userToken;

  constructor(
    private http: HttpClient,
    private sharedService: SharedService) {

    this.userToken = this.sharedService.getFromStorage('token');
  }

  getWorkspaceDetails(workspaceId): Observable<Workspace> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.userToken
      })
    };

    return this.http.get(this.baseUrl + `/api/workspace/${workspaceId}`, httpOptions)
      .pipe(
        map((result) => {
          const workspace = { ...result['data'] };
          workspace['id'] = result['id'];
          return workspace;
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(error.error.message || error.error);
        })
      );
  }

  getDesktopWorkspaces() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.userToken
      })
    };
    const date = new Date();

    return this.http.get(this.baseUrl + `/api/workspaces/desktop?foobar=${date.getTime()}`, httpOptions)
      .pipe(
        map((result) => {

          return result['data'];
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(error.error.message || error.error);
        })
      );
  }

  createDesktopWorkspace(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.userToken
      })
    };

    return this.http.post(this.baseUrl + `/api/oem/workspace/create`, data, httpOptions)
      .pipe(
        map((result) => {
          return result;
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(error.error.message || error.error);
        })
      );
  }

  updateWorkspace() {

  }

  getDatabaseTypes() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.userToken
      })
    };

    return this.http.get(this.baseUrl + `/api/db/connection/types`, httpOptions)
      .pipe(
        map((result) => {
          return { ...result['types'] };
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(error.error.message || error.error);
        })
      );

  }
}
