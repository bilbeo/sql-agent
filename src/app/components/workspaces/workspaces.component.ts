import { Component, OnInit } from '@angular/core';
import { User } from '../../interfaces/user';
import { UserService } from '../../providers/user.service';
import { WorkspaceService } from '../../providers/workspace.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss']
})
export class WorkspacesComponent implements OnInit {
  user: User;
  workspaces: any;
  loading: boolean;

  constructor(
    private userService: UserService,
    private workspaceService: WorkspaceService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.getUser();
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
      )
  }

  showWorkspaceDetails(workspaceItem) {
    this.router.navigate(['./', workspaceItem.id], { relativeTo: this.route });

  }


  newWorkspace() {
    this.router.navigate(['home/create-workspace']);

  }

}
