import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '../../interfaces/user';
import { UserService } from '../../providers/user.service';
import { WorkspaceService } from '../../providers/workspace.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from '../../providers/shared.service';
import { MatDialog } from '@angular/material';
import { DatasourceService } from '../../providers/datasource.service';
import { AlertComponent } from '../alert/alert.component';
const shell = require('electron').shell;

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
      if (isOnlineRes) {
        setTimeout(() => {
          this.getUser();
        }, 500);
      }
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
          this.workspaces = res;
          this.checkForUselessLocalData();
          this.loading = false;
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

  launchWorkspace(workspace) {
    // make the url dynamic
    const baseUrl = this.user.webURL || 'https://www.bilbeo.net'
    shell.openExternal(`${baseUrl}/?workspaceId=${workspace.id}&path=app/#/eye-glance`);
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
              this.getWorkspaces();
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
      console.log("local data found for removed workspace, deleting it", allLocalWorkspaceData[workspace.id]);
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

  checkForUselessLocalData() {
    if (this.workspaces.length) {
      const userWorkspaces = [];
      const allLocalWorkspaceData = this.sharedService.getFromStorage('workspaces');
      for (const key in allLocalWorkspaceData) {
        if (allLocalWorkspaceData.hasOwnProperty(key)) {
          const item = allLocalWorkspaceData[key];
          // filter autoPush enabled workspaces of the subject user
          if (item.userId === this.user._id) {
            userWorkspaces.push(item);
          }
        }
      }
      // filter those items that are not found in received workspaces
      const redundant = userWorkspaces.filter((item) => {
        const found = this.workspaces.find((ws) => {
          return ws.id === item.id;
        });
        if (found) {
          return false;
        }
        return true;
      });
      if (redundant && redundant.length) {
        redundant.forEach((workspaceLocalData) => {
          console.log("redundunt local data found, deleting it", allLocalWorkspaceData[workspaceLocalData.id])
          delete allLocalWorkspaceData[workspaceLocalData.id];
        });
        this.sharedService.setInStorage('workspaces', allLocalWorkspaceData);
      }
    }
  }

  ngOnDestroy() {
    this.connectionSubs.unsubscribe();
  }
}
