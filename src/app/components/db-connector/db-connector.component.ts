import { Component, OnInit, Input, Injector, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DbCredentials } from '../../interfaces/db-credentials';
import { SharedService } from '../../providers/shared.service';
import { WorkspaceService } from '../../providers/workspace.service';
import { DatabaseService } from '../../providers/database.service';
import { IntercomService } from '../../providers/intercom.service';

@Component({
  selector: 'app-db-connector',
  templateUrl: './db-connector.component.html',
  styleUrls: ['./db-connector.component.scss']
})
export class DbConnectorComponent implements OnInit {
  @Input() localWorkspaceData: any;
  @Input() workspace;
  @Input() updateCredentialsMode: boolean;
  @Output() localDataChange = new EventEmitter();
  @Output() closeCredentialsPage = new EventEmitter();
  selectedDb: any;
  dbForm: FormGroup;
  message: string;
  dbConnected: boolean;
  allDbs: Array<any>;
  connectInProgress: boolean;
  credentials;
  errMessage: string;
  autoPushOptions: Array<any>;
  autoPushHint: string;
  ipHint: string;
  userId;

  constructor(
    private fb: FormBuilder,
    private databaseService: DatabaseService,
    private sharedService: SharedService,
    private workspaceService: WorkspaceService,
    private intercomService: IntercomService) { }

  ngOnInit() {
    this.getDbTypes();
    this.userId = this.sharedService.getFromStorage('userId');
    this.autoPushHint = 'Allow Bilbeo SQL Agent to connect and query your database on a regular basis as per the selected frequency';
    this.ipHint = 'If your database is hosted locally, please type your local IP (e.g 127.0.0.1) or simply localhost';
  }

  initDbForm() {
    this.credentials = this.localWorkspaceData ? this.localWorkspaceData.credentials : {};
    this.dbForm = this.fb.group({
      type: ['', Validators.required],
      host: [this.credentials.host || '', Validators.required],
      dbName: [this.credentials.db || '', Validators.required],
      port: [this.credentials.port || '', Validators.required],
      user: [this.credentials.user || ''],
      dbPassword: [this.credentials.password || ''],
      autoPushing: [this.credentials.autoPushing || '24h']
    });

    this.autoPushOptions = [
      {
        label: 'No Automatic Push',
        value: 'none'
      },
      {
        label: 'Daily (every 24 hours)',
        value: '24h'
      },
      {
        label: 'Twice Daily (every 12 hours)',
        value: '12h'
      },
      {
        label: 'Four Times Daily (every 6 hours) ',
        value: '6h'
      }
    ];

    if (this.credentials.type) {
      this.selectedDb = this.allDbs.find((db) => {
        return db.key === this.credentials.type;
      });
      this.dbForm.controls['type'].setValue(this.selectedDb);
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
      type: this.selectedDb.key,
      autoPushing: this.dbForm.controls['autoPushing'].value ? this.dbForm.controls['autoPushing'].value : 'none'
    };
    this.connectInProgress = true;

    this.databaseService.testConnection(credentials, this.selectedDb.key, {})
      .subscribe(
        (res: string) => {
          this.connectInProgress = false;
          this.message = res;
          this.dbConnected = true;
          this.saveCredentials(credentials);
          this.intercomService.trackEvent('connected his database', {
            source: 'sql-agent',
            datbaseType: this.selectedDb.name
          });
          this.closePage();
        },
        (errMessage) => {
          this.connectInProgress = false;
          this.errMessage = errMessage || `Error when connecting to database`;
          this.intercomService.trackEvent('failed to connect database', {
            source: 'sql-agent',
            datbaseType: this.selectedDb.name,
            host: this.dbForm.controls['host'].value,
            status: this.errMessage
          });
        }
      );
  }

  saveCredentials(credentials) {
    // save the credentials in app local storage
    if (!this.sharedService.getFromStorage('workspaces')) {
      this.sharedService.setInStorage('workspaces', {});
    }
    const existingLocalData = this.sharedService.getFromStorage(`workspaces.${this.workspace.id}`);
    const workspaceData = {
      id: this.workspace.id,
      userId: this.userId,
      credentials: credentials,
      queries: (existingLocalData && existingLocalData.queries) ? existingLocalData.queries : []
    };
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

  closePage() {
    this.closeCredentialsPage.emit('close');
  }

  onDbSelection(event) {
    this.selectedDb = event.value;
    this.dbForm.controls['port'].setValue(event.value.port);
  }
}
