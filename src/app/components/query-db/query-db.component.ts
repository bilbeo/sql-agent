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
  message: string;
  dbOutput: any;
  queryString: string;
  credentials;
  saveLocal: boolean;
  querySucceded: boolean;

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
        return queryItem.indicatorId === this.selectedIndicator._id
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


  queryDB(query?) {
    this.querySucceded = false;
    this.message = '';
    this.queryString = query || `SELECT InvoiceDate as 'date', Total as 'value', BillingCountry as 'breakdown_Country' FROM Invoice`;


    this.databaseServce.executeQueries(this.credentials.type, this.credentials, this.queryString, {})
      .subscribe(
        (outputResult) => {
          this.querySucceded = true
          this.dbOutput = {
            rows: outputResult['rows'].splice(0, 100),
            columns: outputResult['columns']
          }

        },
        (err) => {
          this.message = err;
        }
      );
  }

  updateWorkspace() {
    if (this.saveLocal) {
      let queryItem = {
        indicatorId: this.selectedIndicator._id,
        query: this.queryString
      }
      this.localWorkspaceData.queries.push(queryItem)
      this.sharedService.setInStorage(`workspaces.${this.localWorkspaceData.id}`, this.localWorkspaceData);
    }


    // here goes the payload structuring for updating the workspace
  }

}
