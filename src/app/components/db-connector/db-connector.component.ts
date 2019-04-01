import { Component, OnInit, Input, Injector } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DbCredentials } from '../../interfaces/db-credentials';
import { DBMySqlService } from '../../providers/db-mysql.service';
import { SharedService } from '../../providers/shared.service';




@Component({
  selector: 'app-db-connector',
  templateUrl: './db-connector.component.html',
  styleUrls: ['./db-connector.component.scss']
})
export class DbConnectorComponent implements OnInit {
  @Input('localData') localData: any;
  @Input('workspace') workspace;

  selectedDb: any;
  dbForm: FormGroup
  message: string;
  dbConnected: boolean;
  allDbs: Array<any>;
  saveLocal = true;

  constructor(
    private fb: FormBuilder,
    private mySqlService: DBMySqlService,
    private sharedService: SharedService) {

    //TODO:  maybe get the list from backend?
    this.allDbs = [
      {
        name: 'MySQL',
        port: 3306,
        key: 'mysql'
      },
      {
        name: 'MongoDB',
        port: 27017,
        key: 'mongo'
      },

    ];
    // hardcoded
    this.selectedDb = this.allDbs[0];

  
  }

  ngOnInit() {
    let credentials = this.localData? this.localData.credentials : {};
    this.dbForm = this.fb.group({
      host: [credentials.host || '', Validators.required],
      dbName: [credentials.db || '', Validators.required],
      port: [credentials.port || this.selectedDb.port, Validators.required],
      user: [credentials.user || ''],
      dbPassword: [credentials.password || ''],
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
          if (this.saveLocal) {
            this.saveCredentials(credentials);
          }

        },
        (errMessage) => {
          console.log(errMessage);
          this.message = errMessage || `Error when connecting to database`;

        }
      )
  }

  saveCredentials(credentials) {
    // save the credentials in app ocal storage if the user has not unchecked save checkbox
    const workspaceData = {
      id: this.workspace.id,
      credentials: credentials,
      queries: []
    }

    if (!this.sharedService.getFromStorage('workspaces')) {
      this.sharedService.setInStorage('workspaces', {});
    }
    this.sharedService.setInStorage(`workspaces.${this.workspace.id}`, workspaceData);
  }

  onDbSelection(event) {
    this.dbForm.controls['port'].setValue(event.value.port);

  }

}
