import { Component, OnInit, Input, Injector } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DbCredentials } from '../../interfaces/db-credentials';
import { DBMySqlService } from '../../providers/db-mysql.service';




@Component({
  selector: 'app-db-connector',
  templateUrl: './db-connector.component.html',
  styleUrls: ['./db-connector.component.scss']
})
export class DbConnectorComponent implements OnInit {
  @Input('dbType') dbType: string;
  selectedDb: any;
  dbForm: FormGroup
  message: string;
  dbOutput: any;
  dbConnected: boolean;
  queryString: string;

  constructor(
    private fb: FormBuilder,
    private mySqlService: DBMySqlService) {

      this.queryString = '';

    let allDbs = {
      'mySql': {
        name: 'MySQL',
        port: 3306
      }
    }
    this.selectedDb = this.dbType ? allDbs[this.dbType] : allDbs['mySql'];
  }

  ngOnInit() {

    this.dbForm = this.fb.group({
      host: ['', Validators.required],
      dbName: ['', Validators.required],
      port: [this.selectedDb.port, Validators.required],
      user: [''],
      dbPassword: [''],
    });
  }

  connectToDatabase() {
    this.message = '';
    if (!this.dbForm.valid) {
      return;
    }

    let credentials: DbCredentials = {
      host: this.dbForm.controls['host'].value,
      port: this.dbForm.controls['port'].value,
      db: this.dbForm.controls['dbName'].value,
      user: this.dbForm.controls['user'].value ? this.dbForm.controls['user'].value : null,
      password: this.dbForm.controls['user'].value ? this.dbForm.controls['dbPassword'].value : null

    }


    this.mySqlService.connect(credentials)
      .subscribe(
        (res: string) => {
          console.log(res);
          this.message = res;
          this.dbConnected = true;

        },
        (errMessage) => {
          console.log(errMessage);
          this.message = errMessage || `Error when connecting to database`;

        }
      )

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
