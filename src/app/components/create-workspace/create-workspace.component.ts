import { Component, OnInit } from '@angular/core';
import { WorkspaceService } from '../../providers/workspace.service';
import { Router } from '@angular/router';
import { DatasourceService } from '../../providers/datasource.service';
import { User } from '../../interfaces/user';
import { UserService } from '../../providers/user.service';

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
    private router: Router
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
      dataSourceName: '',
      isPushDb: true,
    }

  }

  createWorkspace() {
    this.errorMessage = '';
    if (!this.workspaceData.dataSourceName || !this.workspaceData.workspaceName) {
      return;
    }

    this.createDatasource()
      .subscribe(
        (res) => {
          console.log(res);
          let data = {
            APIKey: this.user.APIKey,
            dataSourceName: this.workspaceData.dataSourceName,
            workspaceName: this.workspaceData.workspaceName,
            custom: '',
            isPushDb: true
          }

          this.workspaceService.createDesktopWorkspace(data)
            .subscribe(
              (result) => {
                console.log(result);

                this.router.navigate(['../']);
              },
              (errMessage) => {
                this.errorMessage = errMessage;
              }
            );
        },
        (err) => {
          console.log(err);
          if (err.error && err.error.name === 'MongoError') {
            this.errorMessage = 'Datasource name already in use';
          } else {
            this.errorMessage = 'Something went wrong when creating datasource'
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