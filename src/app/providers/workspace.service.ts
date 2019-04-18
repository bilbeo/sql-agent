import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Workspace } from '../interfaces/workspace';

@Injectable()
export class WorkspaceService {
  private baseUrl = process.env.BILBEO_SERVER;
  constructor(
    private http: HttpClient,
    private sharedService: SharedService) {


  }

  getWorkspaceDetails(workspaceId): Observable<Workspace> {
    const userToken = this.sharedService.getFromStorage('token');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
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
    const userToken = this.sharedService.getFromStorage('token');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      })
    };

    return this.http.get(this.baseUrl + `/api/workspaces/desktop`, httpOptions)
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
    const userToken = this.sharedService.getFromStorage('token');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
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

  updateWorkspace(params, jsonData) {
    const userToken = this.sharedService.getFromStorage('token');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      })
    };

    const paylod = {
      APIKey: params['APIKey'],
      workspaceId: params['workspaceId'],
      updateMode: params['updateMode'],
      updatePartial: params['updatePartial'],
      compressed: false,
      data: jsonData
    };

    return this.http.post(this.baseUrl + `/api/oem/workspace/update`, paylod, httpOptions)
      .pipe(
        map((result) => {
          return result;
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(error.error.message || error.error);
        })
      );
  }

  getDatabaseTypes() {
    const userToken = this.sharedService.getFromStorage('token');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
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

  updateWorkspaceName(workspaceId, newName) {
    const userToken = this.sharedService.getFromStorage('token');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      })
    };

    return this.http.post(this.baseUrl + `/api/workspace/${workspaceId}/updateName`, { name: newName }, httpOptions)
      .pipe(
        map((result) => {
          return result;
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(error.error.message || error.error);
        })
      );
  }

  deleteWorkspace(workspaceId) {
    const userToken = this.sharedService.getFromStorage('token');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      })
    };

    return this.http.post(this.baseUrl + `/api/workspace/${workspaceId}/delete`, {}, httpOptions)
      .pipe(
        map((result) => {
          return result;
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(error.error.message || error.error);
        })
      );
  }
}
