import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { WorkspaceService } from '../../providers/workspace.service';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SharedService } from '../../providers/shared.service';
import { DatasourceService } from '../../providers/datasource.service';

@Component({
  selector: 'app-workspace-item',
  templateUrl: './workspace-item.component.html',
  styleUrls: ['./workspace-item.component.scss']
})
export class WorkspaceItemComponent implements OnInit {
  workspace
  // hardcoded at the moment: Sat
  dbType = 'mysql';
  workspaceLocalData: any;
  selectedId;
  datasource;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private workspaceService: WorkspaceService,
    private datasourceService: DatasourceService,
    private sharedService: SharedService) { }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap(params => {
        // (+) before `params.get()` turns the string into a number
        this.selectedId = params.get('id');
        this.getDetailsFromLocalStore();
        return this.workspaceService.getWorkspaceDetails(this.selectedId);
      })
    )
      .subscribe((res) => {
        this.workspace = res;
        this.getDatasource(this.workspace.dataSource)
      },
        (err) => {
          console.log(err);
        });
  }

  getDetailsFromLocalStore() {
    this.workspaceLocalData = this.sharedService.getFromStorage('workspaces') ?
      this.sharedService.getFromStorage('workspaces')[this.selectedId] : null;
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
      )
  }


  goBack() {
    this.router.navigate(['../']);
  }

}
