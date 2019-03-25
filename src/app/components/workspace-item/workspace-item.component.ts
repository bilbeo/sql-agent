import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { WorkspaceService } from '../../providers/workspace.service';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-workspace-item',
  templateUrl: './workspace-item.component.html',
  styleUrls: ['./workspace-item.component.scss']
})
export class WorkspaceItemComponent implements OnInit {
  workspace$: Observable<any>;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private workspaceService: WorkspaceService) { }

  ngOnInit() {
    this.workspace$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => this.workspaceService.getWorkspaceDetails(params.get('id')))
    );
  }


  goBack() {
    this.router.navigate(['../']);
  }

}
