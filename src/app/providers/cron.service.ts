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

@Injectable()
export class CronService {

  cronJobInProgress: boolean;
  user: User;

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
          // run every hour on 00 minutes 00 seconds
          const cron = new CronJob('0 0 * * * *', () => {
            if (!this.cronJobInProgress) {
              const workspaces = this.findAutoPushWorkspaces();
              if (workspaces.length) {
                this.cronJobInProgress = true;
                async.eachSeries(workspaces, (workspace, callback) => {
                  this.startAutoPush(workspace, callback);
                }, () => {
                  this.cronJobInProgress = false;
                });
              }
            }
          });
          cron.start();
        },
        (err) => {
          console.log(err);
        });
  }

  private findAutoPushWorkspaces() {
    const allWorkspaces = this.sharedService.getFromStorage('workspaces');
    const autoPushWorkspaces = [];
    for (const key in allWorkspaces) {
      if (allWorkspaces.hasOwnProperty(key)) {
        const item = allWorkspaces[key];
        // filter autoPush enabled workspaces
        if (item.credentials && item.credentials.autoPushing && (item.credentials.autoPushing !== 'none')) {
          autoPushWorkspaces.push(item);
        }
      }
    }
    return autoPushWorkspaces;
  }

  private startAutoPush(workspace, callback) {
    if (workspace.credentials.autoPushing === 'hourly') {
      // HOURLY: just make the query with every cron tick (*:00:00)
      this.queryDB(workspace, callback);
    } else if (workspace.credentials.autoPushing === 'daily') {
      // DAILY: check the last query time if it was before 13:00 of today, and now it is >= 13:00 make the query
      const processDateTime = moment().set({ 'hours': 13, 'minutes': 0 });
      if (moment().isSameOrAfter(processDateTime) && (!workspace.lastQueryDate || (workspace.lastQueryDate && moment(workspace.lastQueryDate).isBefore(processDateTime)))) {
        this.queryDB(workspace, callback);
      } else {
        callback();
      }
    }
  }

  private queryDB(workspace, callback) {
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
