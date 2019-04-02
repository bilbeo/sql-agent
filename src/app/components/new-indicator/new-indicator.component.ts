import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DatasourceService } from '../../providers/datasource.service';

@Component({
  selector: 'app-new-indicator',
  templateUrl: './new-indicator.component.html',
  styleUrls: ['./new-indicator.component.scss']
})
export class NewIndicatorComponent implements OnInit {
  @Input('datasource') datasource;
  @Output('datasourceChange') datasourceChange = new EventEmitter();
  unitGroups;
  directionOptions;
  newIndicator;

  constructor(
    private datasourceService: DatasourceService
  ) { }

  ngOnInit() {

    this.unitGroups = this.datasourceService.getUnitGroups();

    this.newIndicator = {
      publicID: null,
      name: null,
      information: {
        description: "",
        descriptionI18N: {},
        formula: "",
        formulaI18N: {},
        hint: "",
        hintI18N: {}
      },
      indicatorDomain: "",
      keyIndicator: false,
      snapshot: false, // snapshot = !timeAggregation
      timeAggregation: true,// back needs the snapshot property. TimeAggregation is easiest to explain so tht the property we use at front
      division: false,
      direction: "Increasing is Better",
      displayGranularity: "Day",
      aggregation: "sum",
      valueSpec: "Currency",
      formatSpec: "",
      unit: this.unitGroups[0].items[0],
      atomicUpdate: false,
    };

    this.directionOptions = [
      'Increasing is Better',
      'Decreasing is Better',
      'None'
    ];
  }

  addIndicator() {
    // do not overwrite the initial datasource input before saving
    const datasource = JSON.parse(JSON.stringify(this.datasource));
    datasource.indicators.push(this.formatKPIBeforeSave(this.newIndicator));
    this.datasourceService.updateDatasource(datasource, this.datasource._id)
      .subscribe(
        (resDatasource) => {
          this.datasource = resDatasource;
          let lastIndex = this.datasource.indicators.length-1
          this.datasourceChange.emit({
            indicator:this.datasource.indicators[lastIndex],
            datasource: this.datasource
          });
        },
        (err) => {
          console.log(err);

        }
      )
  }

  private formatKPIBeforeSave(kpiToUpdate) {
    for (var prop in kpiToUpdate) {
      switch (prop) {

        case 'columnsToDisplay':
        case 'selectedBgColor':
        case 'selectedfontColor': // all these are front properties only and shouldn't be send to backend
        case 'query': // remove remove binding
          delete kpiToUpdate[prop];
          break;

        // [BACKEND] we need to adapt some data to backend
        case 'timeAggregation':// convert time aggregation to snapshot
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
        case 'unit':
          kpiToUpdate.formatSpec = kpiToUpdate[prop].value;
          kpiToUpdate.valueSpec = kpiToUpdate[prop].group;
          delete kpiToUpdate[prop];
          break;
      }
    }
    return kpiToUpdate;
  }

}
