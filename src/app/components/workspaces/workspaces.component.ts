import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '../../interfaces/user';
import { UserService } from '../../providers/user.service';
import { WorkspaceService } from '../../providers/workspace.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from '../../providers/shared.service';
import { MatDialog } from '@angular/material';
import { DatasourceService } from '../../providers/datasource.service';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss']
})
export class WorkspacesComponent implements OnInit, OnDestroy {
  user: User;
  workspaces: any;
  loading: boolean;
  connectionSubs;

  constructor(
    private userService: UserService,
    private workspaceService: WorkspaceService,
    private router: Router,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    public dialog: MatDialog,
    private datasourceService: DatasourceService) { }

  ngOnInit() {
    this.getUser();
    this.connectionSubs = this.sharedService.connectionStatusChange.subscribe((isOnlineRes) => {
      setTimeout(() => {
        this.getUser();
      }, 500);
    });
  }

  getUser() {
    this.loading = true;
    this.userService.getUser()
      .subscribe(
        (userRes) => {
          this.user = userRes;
          this.getWorkspaces();
        },
        (err) => {
          this.loading = false;
          console.log(err);
        }
      );
  }

  getWorkspaces() {
    this.workspaceService.getDesktopWorkspaces()
      .subscribe(
        (res) => {
          this.loading = false;
          this.workspaces = res;
        },
        (err) => {
          this.loading = false;
          console.log(err);
        }
      );
  }

  showWorkspaceDetails(workspaceItem) {
    this.router.navigate(['./', workspaceItem.id], { relativeTo: this.route });
  }

  newWorkspace() {
    this.router.navigate(['home/create-workspace']);
  }

  removeWorkspace(workspace) {
    const dialog = this.openDialog('Delete Workspace', 'Are you sure you want to delete this workspace? All the details will be lost including KPIs', 'Cancel', 'Remove');
    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.workspaceService.deleteWorkspace(workspace.id)
          .subscribe(
            (res) => {
              this.removeLocalData(workspace);
              this.datasourceService.removeDatasource(workspace.dataSourceType)
                .subscribe(
                  (removeRes) => {
                    this.getWorkspaces();
                  },
                  (err) => {
                    this.loading = false;
                    console.log(err);
                  }
                );
            },
            (errMessage) => {
              this.loading = false;
              console.log(errMessage);
            }
          );
      }
    });
  }

  removeLocalData(workspace) {
    const allLocalWorkspaceData = this.sharedService.getFromStorage('workspaces');
    if (allLocalWorkspaceData[workspace.id]) {
      delete allLocalWorkspaceData[workspace.id];
      this.sharedService.setInStorage('workspaces', allLocalWorkspaceData);
    }
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
