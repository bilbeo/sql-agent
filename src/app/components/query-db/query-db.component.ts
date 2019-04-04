import { Component, OnInit, Input } from '@angular/core';
// import { DBMySqlService } from '../../providers/db-connectors/mysql';
import 'brace/mode/sql';
import { DatabaseService } from '../../providers/database.service';

@Component({
  selector: 'app-query-db',
  templateUrl: './query-db.component.html',
  styleUrls: ['./query-db.component.scss']
})
export class QueryDbComponent implements OnInit {
  @Input() selectedIndicator;
  @Input() localData;
  message: string;
  dbOutput: any;
  queryString: string;
  credentials;

  constructor(
    private databaseServce: DatabaseService
  ) { }

  ngOnInit() {
    this.queryString = '';
    this.credentials = this.localData ? this.localData.credentials : {};
  }


  queryDB(query?) {

    this.message = '';
    const queryString = query || `SELECT InvoiceDate as 'date', Total as 'value', BillingCountry as 'breakdown_Country' FROM Invoice`;


    this.databaseServce.executeQueries('mysql', this.credentials, queryString, {})
      .subscribe(
        (outputResult) => {
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

  }

}
