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
          const cron = new CronJob('*/30 * * * * *', () => {
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
    console.log(autoPushWorkspaces);
    return autoPushWorkspaces;
  }

  private startAutoPush(workspace, callback) {
    console.log(workspace);
    this.queryDB(workspace, callback);

    if (workspace.credentials.autoPush === 'hourly') {
      // HOURLY: just make the query
      // this.queryDB(workspace);
      // TODO: call the callback correctly
    } else if (workspace.credentials.autoPush === 'daily') {
      // DAILY: check the last query time if it was before 13:00 today, and no it is >= 13:00 make the query
    }
  }

  queryDB(workspace, callback) {
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

  updateWorkspace(workspace, queryResult, callback) {
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
          // TODO: update the queryDate in localstore
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
