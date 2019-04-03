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
  workspace;
  // hardcoded at the moment: Sat
  dbType = 'mysql';
  workspaceLocalData: any;
  workspaceId;
  datasource;
  selectedIndicator;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private workspaceService: WorkspaceService,
    private datasourceService: DatasourceService,
    private sharedService: SharedService) { }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap(params => {
        // (+) before `params.get()` turns the string into a number
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
    this.workspaceLocalData = this.sharedService.getFromStorage('workspaces') ?
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
    this.selectedIndicator = null;
    this.selectedIndicator = this.datasource.indicators[index];

  }

  editIndicator(){
    
  }

  onDatasourceUpdated(newDatasouceData) {
    this.selectedIndicator = null;
    this.datasource = newDatasouceData.datasource;
    // when a new indicatoris created we want ot to be the selected one
    this.selectedIndicator = newDatasouceData.indicator;
  }


  goBack() {
    this.router.navigate(['../']);
  }

}
