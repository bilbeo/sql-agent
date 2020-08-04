import { Component, OnInit, Input, SimpleChanges, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';

import { DatabaseService } from '../../providers/database.service';
import { SharedService } from '../../providers/shared.service';
import { WorkspaceService } from '../../providers/workspace.service';
import { User } from '../../interfaces/user';
import { UserService } from '../../providers/user.service';
// for ace editor
import 'brace/mode/sql';
import { DbCredentials } from '../../interfaces/db-credentials';
import { MatSnackBar } from '@angular/material';
import { IntercomService } from '../../providers/intercom.service';
const shell = require('electron').shell;

@Component({
  selector: 'app-query-db',
  templateUrl: './query-db.component.html',
  styleUrls: ['./query-db.component.scss']
})
export class QueryDbComponent implements OnInit, OnChanges {
  @Input() queryIndicator;
  @Input() localWorkspaceData;
  @Input() datasource;
  @Input() workspace;
  @Output() previousStepClick = new EventEmitter();
  @Output() workspaceUpdated = new EventEmitter();
  errMessage: string;
  successMessage: string;
  tableData: any;
  dbOutput: any;
  queryString: string;
  credentials: DbCredentials;
  querySucceded: boolean;
  dateColumnIndex: number;
  user: User;
  panelOpenState: boolean;
  requestInProgress: boolean;

  constructor(
    private databaseService: DatabaseService,
    private sharedService: SharedService,
    private workspaceService: WorkspaceService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private intercomService: IntercomService
  ) { }

  ngOnInit() {
    this.setQuery();
    this.panelOpenState = false;
    this.credentials = this.localWorkspaceData ? this.localWorkspaceData.credentials : {};

    this.userService.getUser()
      .subscribe(
        (userRes) => {
          this.user = userRes;
        },
        (err) => { });
  }

  setQuery() {
    this.queryString = '';
    this.successMessage = '';
    this.errMessage = '';
    this.dbOutput = null;
    this.tableData = null;
    if (this.localWorkspaceData && this.localWorkspaceData.queries.length) {
      const localIndicatorData = this.localWorkspaceData.queries.find((queryItem) => {
        return queryItem.indicatorId === this.queryIndicator._id;
      });
      if (localIndicatorData) {
        this.queryString = localIndicatorData.query;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const queryIndicator: SimpleChange = changes.queryIndicator;
    if (queryIndicator && queryIndicator.previousValue && (queryIndicator.previousValue._id !== queryIndicator.currentValue._id)) {
      this.setQuery();
      return;
    }
    //  if the credentials have been updated we want to update them in the component
    const localWorkspaceData: SimpleChange = changes.localWorkspaceData;
    if (localWorkspaceData && localWorkspaceData.previousValue && (localWorkspaceData.previousValue.credentials !== localWorkspaceData.currentValue.credentials)) {
      this.credentials = this.localWorkspaceData ? this.localWorkspaceData.credentials : {};
    }
  }

  queryDB() {
    this.querySucceded = false;
    this.successMessage = '';
    this.errMessage = '';
    this.dbOutput = null;
    this.tableData = null;
    const options = {
      withFormatting: true,
      indicators: this.datasource.indicators
    };

    if (this.queryString) {
      const queryObject = {
        indicatorId: this.queryIndicator._id,
        query: this.queryString
      };
      this.requestInProgress = true;
      this.databaseService.executeQueries(this.credentials.type, this.credentials, queryObject, options)
        .subscribe(
          (outputResult) => {
            if (!(outputResult instanceof Error)) {
              this.querySucceded = true;
              this.dbOutput = outputResult;

              const totalRows = this.dbOutput['numberOfRows'];
              const invalidRows = this.dbOutput['numberOfInvalidRows'];

              this.successMessage = 'Query succeeded and returned ' + totalRows + ' row' + (totalRows === 1 ? '' : 's') + '.';
              if (invalidRows) {
                this.successMessage += ' ' + (totalRows - invalidRows) + ' row' + (totalRows === 1 ? '' : 's') + ' have been kept';
                this.successMessage += ' and ' + invalidRows + ' row' + (totalRows === 1 ? '' : 's') + ' were invalid (missing or invalid id/value/date)';
              }
              if (totalRows > 100) {
                this.successMessage += ' Showing the first 100 records.';
              }

              this.tableData = {
                rows: this.dbOutput['raw']['rows'].splice(0, 100),
                columns: this.dbOutput['raw']['columns']
              };

              // find the date columns to format them as a date
              this.dateColumnIndex = this.tableData.columns.findIndex((colName) => {
                return colName === 'date';
              });
              this.intercomService.trackEvent('db querying succeeded', {
                source: 'sql-agent',
              });
            } else {
              this.querySucceded = false;
              this.errMessage = outputResult.message || 'Something went wrong querying the database';
            }
            this.requestInProgress = false;
          },
          (err) => {
            this.requestInProgress = false;
            this.querySucceded = false;
            this.errMessage = err;
            this.intercomService.trackEvent('db querying failed', {
              source: 'sql-agent',
              status: this.errMessage
            });
          }
        );
    }
  }

  updateWorkspace() {
    if (this.querySucceded && this.dbOutput) {
      // save the query in local store
      if (this.localWorkspaceData) {
        const queryItem = {
          indicatorId: this.queryIndicator._id,
          query: this.queryString
        };
        this.localWorkspaceData.queries.push(queryItem);
        this.sharedService.setInStorage(`workspaces.${this.localWorkspaceData.id}`, this.localWorkspaceData);
      }

      // prepare the parameters to be sent in updateWorkspace
      const json = {
        KPIs: []
      };
      this.dbOutput['formatted'].forEach((formattedItem) => {
        json.KPIs.push(formattedItem);
      });
      // SAT-MDS: datasourceId added in params
      const params = {};
      params['updatePartial'] = true;
      params['updateMode'] = 'replace';
      params['workspaceId'] = this.workspace.id;
      params['APIKey'] = this.user.APIKey;
      params['datasourceId'] = this.workspace.dataSources[0]._id
      this.requestInProgress = true;
      this.workspaceService.updateWorkspace(params, json)
        .subscribe(
          (res) => {
            this.workspaceUpdated.emit('updated');
            this.requestInProgress = false;
            this.showAlert('Workspace updated. Visit the webpage to see the updated workspace', 'Visit');

            this.intercomService.trackEvent('updated a workspace', {
              source: 'sql-agent',
            });
          },
          (error) => {
            this.requestInProgress = false;
            console.log(error);
            this.errMessage = error;
            this.intercomService.trackEvent('failed to update a workspace', {
              source: 'sql-agent',
              status: this.errMessage
            });
          }
        );
    }
  }

  showAlert(message: string, action?: string) {
    this.snackBar.open(message, action, {
      duration: 10000
    })
      .onAction().subscribe(() => {
        if (action === 'Visit') {
          // open external web browser window
          shell.openExternal(this.user.webURL || 'https://www.bilbeo.net');
        }
      });
  }

  previousStep() {
    this.previousStepClick.emit('go back');
  }
}
