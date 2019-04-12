import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DatasourceService } from '../../providers/datasource.service';
@Component({
  selector: 'app-edit-indicator',
  templateUrl: './edit-indicator.component.html',
  styleUrls: ['./edit-indicator.component.scss']
})
export class EditIndicatorComponent implements OnInit {
  @Input() datasource;
  @Input() indicatorData;
  @Output() datasourceChange = new EventEmitter();
  unitGroups;
  directionOptions;
  editIndicator;

  constructor(
    private datasourceService: DatasourceService
  ) { }

  ngOnInit() {

    this.unitGroups = this.datasourceService.getUnitGroups();
    this.editIndicator = {
      publicID: this.indicatorData.publicID,
      name: this.indicatorData.name,
      information: {
        description: '',
        descriptionI18N: {},
        formula: '',
        formulaI18N: {},
        hint: '',
        hintI18N: {}
      },
      indicatorDomain: this.indicatorData.indicatorDomain,
      keyIndicator: this.indicatorData.keyIndicator,
      snapshot: this.indicatorData.snapshot,
      timeAggregation: !this.indicatorData.snapshot,
      division: this.indicatorData.division,
      direction: this.indicatorData.direction,
      displayGranularity: this.indicatorData.displayGranularity,
      aggregation: this.indicatorData.aggregation,
      valueSpec: this.indicatorData.valueSpec,
      formatSpec: this.indicatorData.formatSpec,
      unit: this.unitGroups[0].items[0],   // TODO: set the correct unit
      atomicUpdate: ''+ this.indicatorData.atomicUpdate,
    };

    this.directionOptions = [
      'Increasing is Better',
      'Decreasing is Better',
      'None'
    ];
  }

  updateIndicator() {
    // do not overwrite the initial datasource input before saving
    const datasource = JSON.parse(JSON.stringify(this.datasource));
    
    const indicatorIndex = datasource.indicators.findIndex((indicator)=>{
      return indicator.publicID === this.editIndicator.publicID;
    })
    datasource.indicators[indicatorIndex] = this.formatKPIBeforeSave(this.editIndicator);
    this.datasourceService.updateDatasource(datasource, this.datasource._id)
      .subscribe(
        (resDatasource) => {
          this.datasource = resDatasource;
          this.datasourceChange.emit({
            indicator: this.datasource.indicators[indicatorIndex],
            datasource: this.datasource
          });
        },
        (err) => {
          console.log(err);
        }
      );
  }

  private formatKPIBeforeSave(kpiToUpdate) {
    for (const prop in kpiToUpdate) {
      if (kpiToUpdate.hasOwnProperty(prop)) {
        switch (prop) {
          case 'columnsToDisplay':
          case 'selectedBgColor':
          case 'selectedfontColor': // all these are front properties only and shouldn't be send to backend
          case 'query': // remove remove binding
            delete kpiToUpdate[prop];
            break;
          // [BACKEND] we need to adapt some data to backend
          case 'timeAggregation':
            // convert time aggregation to snapshot
            kpiToUpdate.snapshot = !kpiToUpdate[prop];
            break;
          case 'name':
            kpiToUpdate.nameI18N = { 'en_GB': kpiToUpdate[prop] };
            kpiToUpdate.publicID = kpiToUpdate[prop].toLowerCase();
            break;
          case 'information':
            kpiToUpdate.information.descriptionI18N = { 'en_GB': kpiToUpdate[prop].description };
            kpiToUpdate.information.formulaI18N = { 'en_GB': kpiToUpdate[prop].formula };
            kpiToUpdate.information.hintI18N = { 'en_GB': kpiToUpdate[prop].hint };
            break;
          case 'aggregation': // set division
            kpiToUpdate.division = (kpiToUpdate[prop] === 'avg') ? true : false;
            break;
          case 'atomicUpdate':
            kpiToUpdate.atomicUpdate = (kpiToUpdate[prop] === 'false') ? false : true;
            break;
          case 'unit':
            kpiToUpdate.formatSpec = kpiToUpdate['unit'].value;
            kpiToUpdate.valueSpec = kpiToUpdate['unit'].group;
            delete kpiToUpdate['unit'];
            break;
        }
      }
    }
    return kpiToUpdate;
  }
}
