import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Datasource } from '../interfaces/datasource';


@Injectable()
export class DatasourceService {
  private baseUrl = process.env.BILBEO_SERVER;

  constructor(
    private http: HttpClient,
    private sharedService: SharedService) {
  }

  createDatasource(datasourceName) {
    const userToken = this.sharedService.getFromStorage('token');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      })
    };

    const data = {
      defaultLang: 'en_GB',
      id: null,
      indicators: [],
      langs: ['en_GB'],
      metrics: [],
      name: datasourceName,
      _id: null
    };

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

  getDatasourceByName(datasourceName): Observable<Datasource> {
    const userToken = this.sharedService.getFromStorage('token');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      })
    };
    return this.http.get(this.baseUrl + `/api/datasource/${datasourceName}`, httpOptions)
      .pipe(
        map((result) => {
          const datasource = { ...result['datasource'] };
          return datasource;
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(error.error.message || error.error);
        })
      );

  }


  updateDatasource(newData, datasourceId) {
    const userToken = this.sharedService.getFromStorage('token');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      })
    };

    const payload = {
      data: newData
    };

    return this.http.post(this.baseUrl + `/api/datasource/${datasourceId}`, payload, httpOptions)
      .pipe(
        map((result) => {
          return { ...result['data'] };
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(error.error.message || error.error);
        })
      );
  }

  removeDatasource(datasourceName) {
    const userToken = this.sharedService.getFromStorage('token');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      })
    };

    const payload = {
      name: datasourceName
    };

    return this.http.post(this.baseUrl + `/api/datasource/delete`, payload, httpOptions)
      .pipe(
        map((result) => {
          return { ...result['data'] };
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(error.error.message || error.error);
        })
      );
  }

  getUnitGroups() {
    const groups = [
      {
        name: 'Currency',
        items: [{
          name: 'Euros',
          value: 'EUR0',
          group: 'Currency'
        }, {
          name: 'US Dollars',
          value: 'USD0',
          group: 'Currency'
        }, {
          name: 'Israeli Shekels',
          value: 'ILS',
          group: 'Currency'
        }, {
          name: 'france',
          value: 'XPF',
          group: 'Currency'
        }]
      }, {
        name: 'Number',
        items: [{
          name: 'No decimals',
          value: '+.0',
          group: 'Number'
        }, {
          name: '1 decimal',
          value: '+.1',
          group: 'Number'
        }, {
          name: '2 decimal',
          value: '+.2',
          group: 'Number'
        }]
      }, {
        name: 'Percentage',
        items: [{
          name: 'No decimals',
          value: '+.0',
          group: 'Percentage'
        }, {
          name: '1 decimal',
          value: '+.1',
          group: 'Percentage'
        }, {
          name: '2 decimal',
          value: '+.2',
          group: 'Percentage'
        }]
      }, {
        name: 'Time',
        items: [{
          name: 'Hours : minutes : seconds',
          value: 'hhmmss',
          group: 'Time'
        }, {
          name: 'Seconds',
          value: 'sec',
          group: 'Time'
        }]
      }
    ];
    return groups;
  }
}
