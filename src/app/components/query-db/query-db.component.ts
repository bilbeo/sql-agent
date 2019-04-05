import { Component, OnInit, Input, SimpleChanges, OnChanges, SimpleChange } from '@angular/core';
import 'brace/mode/sql';
import { DatabaseService } from '../../providers/database.service';
import { SharedService } from '../../providers/shared.service';

@Component({
  selector: 'app-query-db',
  templateUrl: './query-db.component.html',
  styleUrls: ['./query-db.component.scss']
})
export class QueryDbComponent implements OnInit, OnChanges {
  @Input() selectedIndicator;
  @Input() localWorkspaceData;
  errMessage: string;
  dbOutput: any;
  queryString: string;
  credentials;
  saveLocal: boolean;
  querySucceded: boolean;
  dateColumnIndex;

  constructor(
    private databaseServce: DatabaseService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.saveLocal = true;
    this.setQuery();
    this.credentials = this.localWorkspaceData ? this.localWorkspaceData.credentials : {};
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

    this.databaseServce.executeQueries(this.credentials.type, this.credentials, this.queryString, {})
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


    // here goes the payload structuring for updating the workspace
  }

}
