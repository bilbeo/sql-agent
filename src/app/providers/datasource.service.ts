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

  getIndicatorHints() {
    const hints = {
      direction: 'Is it better when the value for this KPI increases or decreases? \n We recommend to upload KPIs with a direction, but some metrics have no direction (i.e: Inventory metrics).',
      keyIndicator: 'Mark your most important indicators as "Key indicator" to filter the most critical KPIs in the application.',
      snapshot: '"On" for most indicators.\n "Off" to disable the aggregation of time. \n i.e. For indicators of stocks, you will probably want to disable the time aggregation to always see the actual level of stock you have in your warehouse.',
      timeAggregation: '"Yes" for most indicators.\n "No" to disable the aggregation of time. \n i.e. For indicators of stocks, you will probably want to disable the time aggregation to always see the actual level of stock you have in your warehouse.',
      division: 'Examples of "single metrics": Users, Sales, Leads.Examples of "ratios": Conversion rate (computed by dividing the number of sales by the number of leads), Efficiency (computed by dividing the hours worked by the presence hours)',
      domain: 'Useful when you have a lot of KPIs, you may want to filter them by their domain (i.e: Sales, finance, logistics...).',
      aggregation: 'How to aggregate this KPI through breakdowns?i.e. Number of sales of 3 companies should be aggregated by "Sum" to get the total of sales of the 3 companies. However, conversion rate of 5 agents should be aggregated by "Average" to get the average conversion rate of the 5 agents.',
      atomicUpdateTrue: 'Selecting this option update the KPI with new data and overwrite previous data for same dates. You might want to do this for events data or if you don\'t save the data in your database.',
      atomicUpdateFalse: 'Selecting this option replaces previous data with the new data. You might want to do this if you previously uploaded incomplete or incorect data'
    };
    return hints;
  }
}
