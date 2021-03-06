import { Component, OnInit } from '@angular/core';
import { WorkspaceService } from '../../providers/workspace.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DatasourceService } from '../../providers/datasource.service';
import { User } from '../../interfaces/user';
import { UserService } from '../../providers/user.service';
import { IntercomService } from '../../providers/intercom.service';
import * as moment from 'moment';

@Component({
  selector: 'app-create-workspace',
  templateUrl: './create-workspace.component.html',
  styleUrls: ['./create-workspace.component.scss']
})
export class CreateWorkspaceComponent implements OnInit {
  user: User;
  workspaceData: any;
  errorMessage;

  constructor(
    private userService: UserService,
    private workspaceService: WorkspaceService,
    private datasourceService: DatasourceService,
    private intercomService: IntercomService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.userService.getUser()
      .subscribe(
        (userRes) => {
          this.user = userRes;
        },
        (err) => { });

    this.workspaceData = {
      workspaceName: '',
      custom: '',
      dataSourceName: ''
    };
  }

  createWorkspace() {
    this.errorMessage = '';
    if (!this.workspaceData.workspaceName) {
      return;
    }
    // using the same naming convention for all the datasources (connector-date-time(utc))
    this.workspaceData.dataSourceName = `DesktopAgent-${moment().utc().format("DD-MM-YY-HH:mm:ss")}`;
    this.createDatasource()
      .subscribe(
        (dsRes) => {
          const data = {
            APIKey: this.user.APIKey,
            dataSourceName: this.workspaceData.dataSourceName,
            datasourceId: dsRes['id'],
            workspaceName: this.workspaceData.workspaceName,
            custom: '',
            isPushDb: true
          };

          this.workspaceService.createDesktopWorkspace(data)
            .subscribe(
              (result) => {
                this.intercomService.trackEvent('created new workspace', {
                  source: 'sql-agent',
                  workspaceName: this.workspaceData.workspaceName
                });
                this.router.navigate(['../', result['id']], { relativeTo: this.route });
              },
              (errMessage) => {
                this.errorMessage = errMessage;
              }
            );
        },
        (err) => {
          console.log(err);
          if (err.error && err.error.name === 'MongoError') {
            this.errorMessage = 'The name of workspace is already in use';
          } else {
            this.errorMessage = 'Something went wrong creating your workspace';
          }
        }
      );
  }

  createDatasource() {
    return this.datasourceService.createDatasource(this.workspaceData.dataSourceName);
  }

  backToWorkpspaces() {
    this.router.navigate(['../']);
  }

}
