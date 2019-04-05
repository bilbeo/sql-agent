import { Component, OnInit, Input, SimpleChanges, OnChanges, SimpleChange } from '@angular/core';
import 'brace/mode/sql';
import { DatabaseService } from '../../providers/database.service';
import { SharedService } from '../../providers/shared.service';
import { WorkspaceService } from '../../providers/workspace.service';
import { User } from '../../interfaces/user';
import { UserService } from '../../providers/user.service';

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
  dbOutput: any;
  queryString: string;
  credentials;
  saveLocal: boolean;
  querySucceded: boolean;
  dateColumnIndex;
  user: User;

  constructor(
    private databaseServce: DatabaseService,
    private sharedService: SharedService,
    private workspaceService: WorkspaceService,
    private userService: UserService
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
    this.errMessage = '';
    this.queryString = this.queryString || `SELECT InvoiceDate as 'date', Total as 'value', BillingCountry as 'breakdown_Country' FROM Invoice`;
    if (this.credentials.type === 'mongodb') {
      this.queryString = this.queryString || `instructions.aggregate([ { "$project": { "_id": 0, "value": "$amount", "date": "$processDate", "breakdown_type": "$type" } } ])`;
    }
    const options = {};

    const queryObject = {
      indicatorId: this.selectedIndicator._id,
      query: this.queryString
    };

    this.databaseServce.executeQueries(this.credentials.type, this.credentials, queryObject, options)
      .subscribe(
        (outputResult) => {
          this.querySucceded = true;
          this.dbOutput = {
            rows: outputResult['rows'].splice(0, 100),
            columns: outputResult['columns']
          };
          // find the date columns to format them as a date
          this.dateColumnIndex = this.dbOutput.columns.findIndex((colName) => {
            return colName === 'date';
          });
        },
        (err) => {
          this.errMessage = err;
        }
      );
  }

  updateWorkspace() {
    if (this.saveLocal) {
      const queryItem = {
        indicatorId: this.selectedIndicator._id,
        query: this.queryString
      };
      this.localWorkspaceData.queries.push(queryItem);
      this.sharedService.setInStorage(`workspaces.${this.localWorkspaceData.id}`, this.localWorkspaceData);
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
          this.querySucceded = true;
          if (!(outputResult instanceof Error)) {
            // prepare the parameters to be sent in updateWorkspace
            const json = {
              KPIs: outputResult['formatted']
            };

            // var totalRows = outputResult['numberOfRows'];
            // var invalidRows = outputResult['numberOfInvalidRows'];

            // var message = 'Query succeeded and returned ' + totalRows + ' row' + (totalRows === 1 ? '' : 's') + '.';
            // if (invalidRows) {
            //   message += ' ' + (totalRows - invalidRows) + ' row' + (totalRows === 1 ? '' : 's') + ' have been kept';
            //   message += ' and ' + invalidRows + ' row' + (totalRows === 1 ? '' : 's') + ' were invalid (missing or invalid id/value/date)';
            // }

            const params = {};
            params['updatePartial'] = true;
            params['updateMode'] = 'replace';
            params['workspaceId'] = this.workspaceId;
            params['APIKey'] = this.user.APIKey;

            this.workspaceService.updateWorkspace(params, json)
              .subscribe(
                (res) => {
                  console.log(res);
                  // TODO: show a success popup ("visit BI to see your updated workspace")

                },
                (err) => {
                  console.log(err);
                  // TODO: show the error message

                }
              );
          }
        },
        (err) => {
          this.errMessage = err;
        }
      );
  }
}
