import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { AppConfig } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from '../interfaces/user';
import { Workspace } from '../interfaces/workspace';

@Injectable()
export class DatasourceService {
  private baseUrl = process.env.BILBEO_SERVER;
  private userToken;

  constructor(
    private http: HttpClient,
    private sharedService: SharedService) {

    this.userToken = this.sharedService.getFromStorage('token');
  }

  createDatasource(datasourceName) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.userToken
      })
    };

    let data = {
      defaultLang: "en_GB",
      id: null,
      indicators: [],
      langs: ["en_GB"],
      metrics: [],
      name: datasourceName,
      _id: null
    }

    return this.http.post(this.baseUrl + `/api/datasource`, data, httpOptions)
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