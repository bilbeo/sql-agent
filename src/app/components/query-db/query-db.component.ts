import { Component, OnInit, Input, SimpleChanges, OnChanges, SimpleChange } from '@angular/core';

import { DatabaseService } from '../../providers/database.service';
import { SharedService } from '../../providers/shared.service';
import { WorkspaceService } from '../../providers/workspace.service';
import { User } from '../../interfaces/user';
import { UserService } from '../../providers/user.service';
// for ace editor
import 'brace/mode/sql';
import { DbCredentials } from '../../interfaces/db-credentials';
import { MatSnackBar } from '@angular/material';
const shell = require('electron').shell;

@Component({
  selector: 'app-query-db',
  templateUrl: './query-db.component.html',
  styleUrls: ['./query-db.component.scss']
})
export class QueryDbComponent implements OnInit, OnChanges {
  @Input() selectedIndicator;
  @Input() localWorkspaceData;
  @Input() datasource;
  @Input() workspaceId;
  errMessage: string;
  successMessage: string;
  tableData: any;
  dbOutput: any;
  queryString: string;
  credentials: DbCredentials;
  saveLocal: boolean;
  querySucceded: boolean;
  dateColumnIndex: number;
  user: User;
  panelOpenState: boolean;

  constructor(
    private databaseServce: DatabaseService,
    private sharedService: SharedService,
    private workspaceService: WorkspaceService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.saveLocal = true;
    this.setQuery();
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
    if (this.localWorkspaceData && this.localWorkspaceData.queries.length) {
      const localIndicatorData = this.localWorkspaceData.queries.find((queryItem) => {
        return queryItem.indicatorId === this.selectedIndicator._id;
      });
      if (localIndicatorData) {
        this.queryString = localIndicatorData.query;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const selectedIndicator: SimpleChange = changes.selectedIndicator;
    if (selectedIndicator.previousValue && (selectedIndicator.previousValue._id !== selectedIndicator.currentValue._id)) {
      this.setQuery();
    }
  }

  queryDB() {
    this.querySucceded = false;
    this.successMessage = '';
    this.errMessage = '';
    this.dbOutput = null;
    this.tableData = null;
    // TODO: hardcoded parts to be removed after testings are done
    this.queryString = this.queryString || `SELECT InvoiceDate as 'date', Total as 'value', BillingCountry as 'breakdown_Country' FROM Invoice`;
    if (this.credentials.type === 'mongodb') {
      this.queryString = this.queryString || `instructions.aggregate([ { "$project": { "_id": 0, "value": "$amount", "date": "$processDate", "breakdown_type": "$type" } } ])`;
    }
    const options = {
      withFormatting: true,
      indicators: this.datasource.indicators
    };

    const queryObject = {
      indicatorId: this.selectedIndicator._id,
      query: this.queryString
    };

    this.databaseServce.executeQueries(this.credentials.type, this.credentials, queryObject, options)
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
            this.successMessage += ' Showing the first 100 records.';

            this.tableData = {
              rows: this.dbOutput['raw']['rows'].splice(0, 100),
              columns: this.dbOutput['raw']['columns']
            };

            // find the date columns to format them as a date
            this.dateColumnIndex = this.tableData.columns.findIndex((colName) => {
              return colName === 'date';
            });
          } else {
            this.querySucceded = false;
            this.errMessage = outputResult.message || 'Something went wrongquerying the database';
          }
        },
        (err) => {
          this.querySucceded = false;
          this.errMessage = err;
        }
      );
  }

  updateWorkspace() {
    if (this.querySucceded && this.dbOutput) {
      // save the query in local store
      if (this.saveLocal) {
        const queryItem = {
          indicatorId: this.selectedIndicator._id,
          query: this.queryString
        };
        this.localWorkspaceData.queries.push(queryItem);
        this.sharedService.setInStorage(`workspaces.${this.localWorkspaceData.id}`, this.localWorkspaceData);
      }

      // prepare the parameters to be sent in updateWorkspace
      const json = {
        KPIs: this.dbOutput['formatted']
      };

      const params = {};
      params['updatePartial'] = true;
      params['updateMode'] = 'replace';
      params['workspaceId'] = this.workspaceId;
      params['APIKey'] = this.user.APIKey;

      this.workspaceService.updateWorkspace(params, json)
        .subscribe(
          (res) => {
            console.log(res);
            this.showAlert('Workspace updated. Visit the webpage to see the updated workspace', 'Visit');
          },
          (error) => {
            console.log(error);
            this.errMessage = error;
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
}
