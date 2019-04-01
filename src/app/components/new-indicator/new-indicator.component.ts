import { Component, OnInit } from '@angular/core';
import { DatasourceService } from '../../providers/datasource.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-indicator',
  templateUrl: './new-indicator.component.html',
  styleUrls: ['./new-indicator.component.scss']
})
export class NewIndicatorComponent implements OnInit {
  indicatorForm: FormGroup;
  constructor(
    private datasourceService: DatasourceService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {

    this.indicatorForm = this.fb.group({
      name: ['', Validators.required],
      unit: [''],
      direction: [''],
      breakdownAggregation: [''],
      domain: [''],
      description: [''],
      timeAggregation: [''],
      keyIndicator: [false],
      updateMode: ['']
    });
  }

  addIndicator() {

  }

}
