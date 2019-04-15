import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { WorkspaceService } from '../../providers/workspace.service';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SharedService } from '../../providers/shared.service';
import { DatasourceService } from '../../providers/datasource.service';
import { Datasource } from '../../interfaces/datasource';
import { Workspace } from '../../interfaces/workspace';
import { Server } from 'tls';

@Component({
  selector: 'app-workspace-item',
  templateUrl: './workspace-item.component.html',
  styleUrls: ['./workspace-item.component.scss']
})
export class WorkspaceItemComponent implements OnInit {
  workspace: Workspace;
  localWorkspaceData: any;
  workspaceId: string;
  datasource: Datasource;
  selectedIndicator: any;
  showAddIndicator: boolean;
  showEditIndicator: boolean;
  isEditMode: boolean;
  newWorkspaceName: string;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private workspaceService: WorkspaceService,
    private datasourceService: DatasourceService,
    private sharedService: SharedService) { }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.workspaceId = params.get('id');
        this.getDetailsFromLocalStore();
        return this.workspaceService.getWorkspaceDetails(this.workspaceId);
      })
    )
      .subscribe((res) => {
        this.workspace = res;
        this.getDatasource(this.workspace.dataSource);
      },
        (err) => {
          console.log(err);
        });
  }

  getDetailsFromLocalStore() {
    this.localWorkspaceData = this.sharedService.getFromStorage('workspaces') ?
      this.sharedService.getFromStorage('workspaces')[this.workspaceId] : null;
  }

  getDatasource(name) {
    this.datasourceService.getDatasourceByName(name)
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
    this.showAddIndicator = false;
    this.showEditIndicator = false;
    this.selectedIndicator = null;
    this.selectedIndicator = this.datasource.indicators[index];

  }

  newIndicator() {
    this.selectedIndicator = null;
    this.showAddIndicator = true;
    this.showEditIndicator = false;
  }

  editIndicator() {
    this.showAddIndicator = false;
    this.showEditIndicator = true;
  }

  onDatasourceUpdated(newDatasouceData) {
    this.selectedIndicator = null;
    this.datasource = newDatasouceData.datasource;
    // when an indicator is created/updated, we want it to be the selected one
    this.selectedIndicator = newDatasouceData.indicator;
    this.showAddIndicator = false;
    this.showEditIndicator = false;
  }

  toggleWorkspaceEdit(showEdit: boolean) {
    this.isEditMode = showEdit;
    this.newWorkspaceName = this.workspace.name;
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

  removeWorkspace() {
    this.workspaceService.deleteWorkspace(this.workspace.id)
      .subscribe(
        (res) => {
          this.removeLocalData();
          this.goBack();
          // TODO: should we also remove the datasource?
        },
        (err) => {
          console.log(err);
        }
      );
  }

  removeLocalData() {
    const allLocalWorkspaceData = this.sharedService.getFromStorage('workspaces');
    if (allLocalWorkspaceData[this.workspace.id]) {
      delete allLocalWorkspaceData[this.workspace.id];
      this.sharedService.setInStorage('workspaces', allLocalWorkspaceData);
    }
  }

  goBack() {
    this.router.navigate(['../']);
  }

}
