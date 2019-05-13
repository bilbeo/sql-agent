import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '../../interfaces/user';
import { UserService } from '../../providers/user.service';
import { WorkspaceService } from '../../providers/workspace.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from '../../providers/shared.service';

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
    private sharedService: SharedService) { }

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

  ngOnDestroy() {
    this.connectionSubs.unsubscribe();
  }
}
