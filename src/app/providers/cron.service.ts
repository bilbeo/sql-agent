import { Injectable } from '@angular/core';
const CronJob = (<any>window).require('cron').CronJob;
import * as moment from 'moment';
import * as async from 'async';

import { SharedService } from './shared.service';
import { DatabaseService } from './database.service';
import { WorkspaceService } from './workspace.service';
import { UserService } from './user.service';
import { User } from '../interfaces/user';
import { DatasourceService } from './datasource.service';
import { Subject } from 'rxjs';

@Injectable()
export class CronService {
  cronJobInProgress: boolean;
  user: User;
  cronJob;
  private onCronChange = new Subject<any>();
  cronChangeObservable = this.onCronChange.asObservable();

  constructor(
    private sharedService: SharedService,
    private databaseService: DatabaseService,
    private workspaceService: WorkspaceService,
    private datasourceService: DatasourceService,
    private userService: UserService) { }

  initCron() {
    this.userService.getUser()
      .subscribe(
        (userRes) => {
          this.user = userRes;
          // run now and every hour on 00 minutes 00 seconds
          this.startCron();
          this.cronJob = new CronJob('0 0 * * * *', () => {
            this.startCron();
          });
          this.cronJob.start();
        },
        (err) => {
          console.log(err);
        });
  }

  startCron() {
    if (!this.cronJobInProgress) {
      const workspaces = this.findAutoPushWorkspaces();
      if (workspaces.length) {
        this.emitCronChange('checking');
        this.cronJobInProgress = true;
        async.eachSeries(workspaces, (workspace, callback) => {
          this.startAutoPush(workspace, callback);
        }, () => {
          this.cronJobInProgress = false;
          this.emitCronChange('finished');
        });
      }
    }
  }

  stopCron() {
    if (this.cronJob) {
      this.cronJob.stop();
    }
  }

  private emitCronChange(status) {
    this.onCronChange.next(status);
  }

  private findAutoPushWorkspaces() {
    const allWorkspaces = this.sharedService.getFromStorage('workspaces');
    const autoPushWorkspaces = [];
    for (const key in allWorkspaces) {
      if (allWorkspaces.hasOwnProperty(key)) {
        const item = allWorkspaces[key];
        // filter autoPush enabled workspaces of the subject user
        if(item.userId === this.user._id && item.credentials && item.credentials.autoPushing && (item.credentials.autoPushing !== 'none')) {
          autoPushWorkspaces.push(item);
        }
      }
    }
    return autoPushWorkspaces;
  }

  private startAutoPush(workspace, callback) {
    const processDate1 = moment().set({ 'hours': 1, 'minutes': 0 });
    const processDate2 = moment().set({ 'hours': 7, 'minutes': 0 });
    const processDate3 = moment().set({ 'hours': 13, 'minutes': 0 });
    const processDate4 = moment().set({ 'hours': 19, 'minutes': 0 });
    const now = moment();
    if (workspace.credentials.autoPushing === '24h') {
      // once daily:
      // if now it is >= 7:00am and the last query was made before today 7:00am,
      if (now.isSameOrAfter(processDate2) && (!workspace.lastQueryDate || (workspace.lastQueryDate && moment(workspace.lastQueryDate).isBefore(processDate2)))) {
        this.queryDB(workspace, callback);
      } else {
        callback();
      }
    } else if (workspace.credentials.autoPushing === '12h') {
      // twice daily:
      // if now it is equal or after 7:00am, less than < 19:00 and the last query was made before today 7:00am, query!
      // if now it is equal or after 19:00, and the last query was made before today 19:00, query!
      if (now.isSameOrAfter(processDate2) && now.isBefore(processDate4)) {
        // 07:00 -> 19:00
        if (!workspace.lastQueryDate || (workspace.lastQueryDate && moment(workspace.lastQueryDate).isBefore(processDate2))) {
          this.queryDB(workspace, callback);
        } else {
          callback();
        }
      } else if (now.isSameOrAfter(processDate4)) {
        // 19:00 -> 23:59
        if (!workspace.lastQueryDate || (workspace.lastQueryDate && moment(workspace.lastQueryDate).isBefore(processDate4))) {
          this.queryDB(workspace, callback);
        } else {
          callback();
        }
      } else {
        // 00:00 -> 06:59 do nothing
        callback();
      }
    } else if (workspace.credentials.autoPushing === '6h') {
      // four times daily: 01, 07, 13, 19
      // if now it is equal or after 01:00am, and less than < 07:00am and the last query was made before today 01:00am, query!
      // if now it is equal or after 7:00am, less than < 13:00 and the last query was made before today 7:00am, query!
      // if now it is equal or after 13:00, less than < 19:00 and the last query was made before today 13:00, query!
      // if now it is equal or after 19:00, and the last query was made before today 19:00, query!
      if (now.isSameOrAfter(processDate1) && now.isBefore(processDate2)) {
        // 01:00 -> 07:00
        if (!workspace.lastQueryDate || (workspace.lastQueryDate && moment(workspace.lastQueryDate).isBefore(processDate1))) {
          this.queryDB(workspace, callback);
        } else {
          callback();
        }
      } else if (now.isSameOrAfter(processDate2) && now.isBefore(processDate3)) {
        // 07:00 -> 13:00
        if (!workspace.lastQueryDate || (workspace.lastQueryDate && moment(workspace.lastQueryDate).isBefore(processDate2))) {
          this.queryDB(workspace, callback);
        } else {
          callback();
        }
      } else if (now.isSameOrAfter(processDate3) && now.isBefore(processDate4)) {
        // 13:00 -> 19:00
        if (!workspace.lastQueryDate || (workspace.lastQueryDate && moment(workspace.lastQueryDate).isBefore(processDate3))) {
          this.queryDB(workspace, callback);
        } else {
          callback();
        }
      } else if (now.isSameOrAfter(processDate4)) {
        // 19:00 -> 23:59
        if (!workspace.lastQueryDate || (workspace.lastQueryDate && moment(workspace.lastQueryDate).isBefore(processDate4))) {
          this.queryDB(workspace, callback);
        } else {
          callback();
        }
      } else {
        // 00:00 -> 01:00 do nothing
        callback();
      }
    }
  }

  private queryDB(workspace, callback) {
    this.emitCronChange('running');
    const queries = [];
    workspace.queries.forEach((queryItem) => {
      queries.push({
        indicatorId: queryItem.indicatorId,
        query: queryItem.query
      });
    });
    this.workspaceService.getWorkspaceDetails(workspace.id)
      .subscribe(
        (res) => {
          this.datasourceService.getDatasourceByName(res.dataSource)
            .subscribe(
              (dataRes) => {
                const options = {
                  withFormatting: true,
                  indicators: dataRes['indicators']
                };
                this.databaseService.executeQueries(workspace.credentials.type, workspace.credentials, queries, options)
                  .subscribe(
                    (outputResult) => {
                      this.updateWorkspace(workspace, outputResult, callback);
                    },
                    (err) => {
                      console.log(err);
                      callback(err);
                    }
                  );
              },
              (err) => {
                console.log(err);
                callback(err);
              }
            );
        },
        (error) => {
          console.log(error);
          callback(error);
        });
  }

  private updateWorkspace(workspace, queryResult, callback) {
    // prepare the parameters to be sent in updateWorkspace
    const json = {
      KPIs: []
    };
    queryResult.forEach((resultItem) => {
      resultItem['formatted'].forEach((formattedItem) => {
        json.KPIs.push(formattedItem);
      });
    });
    const params = {};
    params['updatePartial'] = true;
    params['updateMode'] = 'replace';
    params['workspaceId'] = workspace.id;
    params['APIKey'] = this.user.APIKey;

    return this.workspaceService.updateWorkspace(params, json)
      .subscribe(
        (res) => {
          // update the last query date in local store
          workspace['lastQueryDate'] = moment().format();
          this.sharedService.setInStorage(`workspaces.${workspace.id}`, workspace);
          console.log(res);
          callback();
        },
        (error) => {
          console.log(error);
          callback(error);
        }
      );
  }
}
