import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceService } from '../../providers/workspace.service';
import { switchMap } from 'rxjs/operators';
import { SharedService } from '../../providers/shared.service';
import { DatasourceService } from '../../providers/datasource.service';
import { Datasource } from '../../interfaces/datasource';
import { Workspace } from '../../interfaces/workspace';
import { MatDialog } from '@angular/material';
import { AlertComponent } from '../alert/alert.component';
import { UserService } from '../../providers/user.service';
const shell = require('electron').shell;

@Component({
  selector: 'app-workspace-item',
  templateUrl: './workspace-item.component.html',
  styleUrls: ['./workspace-item.component.scss']
})
export class WorkspaceItemComponent implements OnInit, OnDestroy {
  workspace: Workspace;
  localWorkspaceData: any;
  workspaceId: string;
  datasource: Datasource;
  selectedIndicator: any;
  isEditMode: boolean;
  newWorkspaceName: string;
  updateCredentialsMode: boolean;
  credentials;
  indicatorEditMode: boolean;
  connectionSubs;
  user;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private workspaceService: WorkspaceService,
    private datasourceService: DatasourceService,
    private sharedService: SharedService,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.getUser();
    this.getWorkspaceById();
    this.selectedIndicator = {};
    this.connectionSubs = this.sharedService.connectionStatusChange.subscribe((isOnlineRes) => {
      setTimeout(() => {
        this.getWorkspaceById();
      }, 500);
    });
  }

  getUser() {
    this.userService.getUser()
      .subscribe(
        (userRes) => {
          this.user = userRes;
        },
        (err) => {
          console.log(err);
        }
      );
  }

  getWorkspaceById() {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.workspaceId = params.get('id');
        this.getDetailsFromLocalStore();
        return this.workspaceService.getWorkspaceDetails(this.workspaceId);
      })
    )
      .subscribe((res) => {
        this.workspace = res;
        if (this.workspace['dataSources'] && this.workspace['dataSources'][0]) {
          this.getDatasource(this.workspace['dataSources'][0]);
        }
      },
        (err) => {
          console.log(err);
        });
  }

  getDetailsFromLocalStore() {
    this.localWorkspaceData = this.sharedService.getFromStorage('workspaces') ?
      this.sharedService.getFromStorage('workspaces')[this.workspaceId] : null;
    this.credentials = this.localWorkspaceData ? this.localWorkspaceData.credentials : {};
  }

  getDatasource(ds) {
    this.datasourceService.getDatasourceByName(ds.type)
      .subscribe(
        (dataRes) => {
          this.datasource = dataRes;
        },
        (err) => {
          console.log(err);
        }
      );
  }

  selectIndicator(index) {
    this.selectedIndicator = null;
    this.selectedIndicator = this.datasource.indicators[index];
    this.indicatorEditMode = true;
  }

  newIndicator() {
    this.selectedIndicator = {};
    this.indicatorEditMode = false;
  }

  onDatasourceUpdated(newDatasouceData) {
    this.selectedIndicator = null;
    this.datasource = newDatasouceData.datasource;
    if (newDatasouceData.kpiRemoved) {
      // if an indicator is removed, we want to start creating new indicator
      this.newIndicator();
    } else {
      // when an indicator is created/updated, we want it to be the selected one
      this.selectedIndicator = newDatasouceData.indicator;
    }
  }

  toggleWorkspaceEdit(showEdit: boolean) {
    this.isEditMode = showEdit;
    this.newWorkspaceName = this.workspace.name;
  }

  launchWorkspace() {
    // make the url dynamic
    const baseUrl = this.user.webURL || 'https://www.bilbeo.net'
    shell.openExternal(`${baseUrl}/?workspaceId=${this.workspace.id}&path=app/#/eye-glance`);
  }

  editWorkspaceName() {
    if (this.newWorkspaceName) {
      this.workspaceService.updateWorkspaceName(this.workspace.id, this.newWorkspaceName)
        .subscribe(
          (res) => {
            if (res['status'] === 'success') {
              this.workspace['name'] = this.newWorkspaceName;
              this.toggleWorkspaceEdit(false);
            }
          },
          (err) => {
            console.log(err);
          }
        );
    }
  }

  editCredentials() {
    this.updateCredentialsMode = true;
  }

  hideCredentialsForm() {
    this.updateCredentialsMode = false;
    this.getDetailsFromLocalStore();
  }

  removeWorkspace() {
    const dialog = this.openDialog('Delete Workspace', 'Are you sure you want to delete this workspace? All the details will be lost including KPIs', 'Cancel', 'Remove');
    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.workspaceService.deleteWorkspace(this.workspace.id)
          .subscribe(
            (res) => {
              this.removeLocalData();
              this.goBack();
            },
            (errMessage) => {
              console.log(errMessage);
            }
          );
      }
    });
  }

  removeLocalData() {
    const allLocalWorkspaceData = this.sharedService.getFromStorage('workspaces');
    if (allLocalWorkspaceData[this.workspace.id]) {
      delete allLocalWorkspaceData[this.workspace.id];
      this.sharedService.setInStorage('workspaces', allLocalWorkspaceData);
    }
  }

  updateLocalData(event) {
    this.getDetailsFromLocalStore();
  }

  goBack() {
    this.router.navigate(['../']);
  }

  openDialog(title, message, cancelText, confirmText) {
    const dialogRef = this.dialog.open(AlertComponent, {
      width: '600px',
      data: { title: title, message: message, cancelButtonText: cancelText, confirmButtonText: confirmText }
    });
    return dialogRef;
  }

  ngOnDestroy() {
    this.connectionSubs.unsubscribe();
  }
}
