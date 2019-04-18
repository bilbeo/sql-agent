import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DatasourceService } from '../../providers/datasource.service';

@Component({
  selector: 'app-new-indicator',
  templateUrl: './new-indicator.component.html',
  styleUrls: ['./new-indicator.component.scss']
})
export class NewIndicatorComponent implements OnInit {
  @Input() datasource;
  @Output() datasourceChange = new EventEmitter();
  unitGroups;
  directionOptions;
  newIndicator;
  hints: any;

  constructor(
    private datasourceService: DatasourceService
  ) { }

  ngOnInit() {

    this.unitGroups = this.datasourceService.getUnitGroups();
    this.hints = {
      direction: 'Is it better when the value for this KPI increases or decreases? \n We recommend to upload KPIs with a direction, but some metrics have no direction (i.e: Inventory metrics).',
      keyIndicator: 'Mark your most important indicators as "Key indicator" to filter the most critical KPIs in the application.',
      snapshot: '"On" for most indicators.\n "Off" to disable the aggregation of time. \n i.e. For indicators of stocks, you will probably want to disable the time aggregation to always see the actual level of stock you have in your warehouse.',
      timeAggregation: '"Yes" for most indicators.\n "No" to disable the aggregation of time. \n i.e. For indicators of stocks, you will probably want to disable the time aggregation to always see the actual level of stock you have in your warehouse.',
      division: 'Examples of "single metrics": Users, Sales, Leads.Examples of "ratios": Conversion rate (computed by dividing the number of sales by the number of leads), Efficiency (computed by dividing the hours worked by the presence hours)',
      domain: 'Useful when you have a lot of KPIs, you may want to filter them by their domain (i.e: Sales, finance, logistics...).',
      aggregation: 'How to aggregate this KPI through breakdowns?i.e. Number of sales of 3 companies should be aggregated by "Sum" to get the total of sales of the 3 companies. However, conversion rate of 5 agents should be aggregated by "Average" to get the average conversion rate of the 5 agents.',
      atomicUpdateTrue: 'Selecting this option update the KPI with new data and overwrite previous data for same dates. You might want to do this for events data or if you don\'t save the data in your database.',
      atomicUpdateFalse: 'Selecting this option replaces previous data with the new data. You might want to do this if you previously uploaded incomplete or incorect data'
    }

    this.newIndicator = {
      publicID: null,
      name: null,
      information: {
        description: '',
        descriptionI18N: {},
        formula: '',
        formulaI18N: {},
        hint: '',
        hintI18N: {}
      },
      indicatorDomain: '',
      keyIndicator: false,
      snapshot: false,
      // snapshot = !timeAggregation
      timeAggregation: true,
      // back needs the snapshot property. TimeAggregation is easiest to explain so tht the property we use at front
      division: false,
      direction: 'Increasing is Better',
      displayGranularity: 'Day',
      aggregation: 'sum',
      valueSpec: 'Currency',
      formatSpec: '',
      unit: this.unitGroups[0].items[0],
      atomicUpdate: 'false',
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
          const lastIndex = this.datasource.indicators.length - 1;
          this.datasourceChange.emit({
            indicator: this.datasource.indicators[lastIndex],
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
