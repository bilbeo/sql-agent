import { Component, OnInit, Input } from '@angular/core';
import { DBMySqlService } from '../../providers/db-mysql.service';
import "brace/mode/sql"

@Component({
  selector: 'app-query-db',
  templateUrl: './query-db.component.html',
  styleUrls: ['./query-db.component.scss']
})
export class QueryDbComponent implements OnInit {
  @Input() selectedIndicator;
  message;
  dbOutput: any;
  queryString: string;

  constructor(
    private mySqlService: DBMySqlService
  ) { }

  ngOnInit() {
    this.queryString = '';
  }


  queryMySql(query?) {
    this.message = '';
    const queryString = query || `SELECT InvoiceDate as 'date', Total as 'value', BillingCountry as 'breakdown_Country' FROM Invoice`;

    this.mySqlService.queryDB(queryString)
      .subscribe(
        (result) => {
          this.dbOutput = result;
        },
        (errMessage) => {
          console.log(errMessage);
          this.message = errMessage || `Error when connecting to database`;
        });
  }

}
