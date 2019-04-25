import { Component, OnInit, Input, Injector, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DbCredentials } from '../../interfaces/db-credentials';
import { SharedService } from '../../providers/shared.service';
import { WorkspaceService } from '../../providers/workspace.service';
import { DatabaseService } from '../../providers/database.service';

@Component({
  selector: 'app-db-connector',
  templateUrl: './db-connector.component.html',
  styleUrls: ['./db-connector.component.scss']
})
export class DbConnectorComponent implements OnInit {
  @Input() localWorkspaceData: any;
  @Input() workspace;
  @Output() localDataChange = new EventEmitter();
  selectedDb: any;
  dbForm: FormGroup;
  message: string;
  dbConnected: boolean;
  allDbs: Array<any>;
  connectInProgress: boolean;;
  editMode: boolean;
  credentials;
  errMessage: string;

  constructor(
    private fb: FormBuilder,
    private databaseService: DatabaseService,
    private sharedService: SharedService,
    private workspaceService: WorkspaceService) { }

  ngOnInit() {
    this.getDbTypes();
  }

  initDbForm() {
    this.credentials = this.localWorkspaceData ? this.localWorkspaceData.credentials : {};
    this.dbForm = this.fb.group({
      host: [this.credentials.host || '', Validators.required],
      dbName: [this.credentials.db || '', Validators.required],
      port: [this.credentials.port || this.selectedDb.port, Validators.required],
      user: [this.credentials.user || ''],
      dbPassword: [this.credentials.password || ''],
    });
    if (this.credentials.type) {
      this.selectedDb = this.allDbs.find((db) => {
        return db.key === this.credentials.type;
      });
    }
  }

  getDbTypes() {
    this.workspaceService.getDatabaseTypes()
      .subscribe(
        (res) => {
          this.allDbs = [];
          // create array of db types
          for (const key in res) {
            if (res.hasOwnProperty(key)) {
              this.allDbs.push(res[key]);
            }
          }
          // order based on porperty 'order'
          this.allDbs.sort((a, b) => {
            if (a.order < b.order) {
              return -1;
            } else if (a.order > b.order) {
              return 1;
            } else {
              return 0;
            }
          });
          this.selectedDb = this.allDbs[0];
          this.initDbForm();
        },
        (err) => {
          console.log(err);
        }
      );
  }

  connectToDatabase() {
    this.message = '';
    this.errMessage = '';
    if (!this.dbForm.valid) {
      return;
    }

    const credentials: DbCredentials = {
      host: this.dbForm.controls['host'].value,
      port: this.dbForm.controls['port'].value,
      db: this.dbForm.controls['dbName'].value,
      user: this.dbForm.controls['user'].value ? this.dbForm.controls['user'].value : null,
      password: this.dbForm.controls['user'].value ? this.dbForm.controls['dbPassword'].value : null,
      type: this.selectedDb.key
    };
    this.connectInProgress = true;

    this.databaseService.testConnection(credentials, this.selectedDb.key, {})
      .subscribe(
        (res: string) => {
          this.connectInProgress = false;
          this.message = res;
          this.dbConnected = true;
          this.saveCredentials(credentials);

          this.editMode = false;
          setTimeout(() => {
            this.message = '';
          }, 3000);
        },
        (errMessage) => {
          this.connectInProgress = false;
          this.errMessage = errMessage || `Error when connecting to database`;
        }
      );
  }

  saveCredentials(credentials) {
    // save the credentials in app local storage if the user has not unchecked save checkbox
    const workspaceData = {
      id: this.workspace.id,
      credentials: credentials,
      queries: []
    };

    if (!this.sharedService.getFromStorage('workspaces')) {
      this.sharedService.setInStorage('workspaces', {});
    }
    this.sharedService.setInStorage(`workspaces.${this.workspace.id}`, workspaceData);
    this.credentials = credentials;
    this.localWorkspaceData = {
      credentials: credentials
    };
    this.localDataChange.emit('Local data has changed');
  }

  removeCredentials() {
    if (this.sharedService.getFromStorage(`workspaces.${this.workspace.id}`)) {
      this.sharedService.removeFromStorage(`workspaces.${this.workspace.id}`);
    }
  }

  editCredentials() {
    this.editMode = true;
  }

  onDbSelection(event) {
    this.dbForm.controls['port'].setValue(event.value.port);
  }
}
