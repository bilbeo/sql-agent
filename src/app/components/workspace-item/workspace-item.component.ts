import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { WorkspaceService } from '../../providers/workspace.service';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SharedService } from '../../providers/shared.service';

@Component({
  selector: 'app-workspace-item',
  templateUrl: './workspace-item.component.html',
  styleUrls: ['./workspace-item.component.scss']
})
export class WorkspaceItemComponent implements OnInit {
  workspace$: Observable<any>;
  // hardcoded at the moment: Sat
  dbType = 'mysql';
  workspaceLocalData: any;
  selectedId
  constructor(private route: ActivatedRoute,
    private router: Router,
    private workspaceService: WorkspaceService,
    private sharedService: SharedService) { }

  ngOnInit() {
    this.workspace$ = this.route.paramMap.pipe(
      switchMap(params => {
        // (+) before `params.get()` turns the string into a number
        this.selectedId = params.get('id');
        this.getDetailsFromLocalStore();
        return this.workspaceService.getWorkspaceDetails(this.selectedId);
      })
    );
  }

  getDetailsFromLocalStore() {
    this.workspaceLocalData = this.sharedService.getFromStorage('workspaces') ?
      this.sharedService.getFromStorage('workspaces')[this.selectedId] : null;
  }


  goBack() {
    this.router.navigate(['../']);
  }

}
