import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DatasourceService } from '../../providers/datasource.service';
import { SharedService } from '../../providers/shared.service';
@Component({
  selector: 'app-edit-indicator',
  templateUrl: './edit-indicator.component.html',
  styleUrls: ['./edit-indicator.component.scss']
})
export class EditIndicatorComponent implements OnInit {
  @Input() datasource;
  @Input() indicatorData;
  @Input() workspace;
  @Output() datasourceChange = new EventEmitter();
  unitGroups;
  directionOptions;
  editIndicator;

  constructor(
    private datasourceService: DatasourceService,
    private sharedService: SharedService
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
      unit: this.unitGroups[0].items[0],
      atomicUpdate: '' + this.indicatorData.atomicUpdate,
    };

    // set the correct unit
    this.unitGroups.forEach((group) => {
      if (group.name === this.indicatorData.valueSpec) {
        this.editIndicator.unit = group.items.find((item) => {
          return item.value === this.indicatorData.formatSpec;
        });
      }
    });

    this.directionOptions = [
      'Increasing is Better',
      'Decreasing is Better',
      'None'
    ];
  }

  updateIndicator() {
    // do not overwrite the initial datasource input before saving
    const datasource = JSON.parse(JSON.stringify(this.datasource));

    const indicatorIndex = datasource.indicators.findIndex((indicator) => {
      return indicator.publicID === this.editIndicator.publicID;
    });

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

  removeIndicator() {
    const datasource = JSON.parse(JSON.stringify(this.datasource));

    const indicatorIndex = datasource.indicators.findIndex((indicator) => {
      return indicator._id === this.indicatorData._id;
    });
    // if we just splice, the metrics won't be deleted from datasource (that's what happens in web app)
    // datasource.indicators.splice(indicatorIndex, 1);

    datasource.indicators[indicatorIndex].toDelete = true;

    this.datasourceService.updateDatasource(datasource, this.datasource._id)
      .subscribe(
        (resDatasource) => {
          this.datasource = resDatasource;
          this.datasourceChange.emit({
            indicator: this.datasource.indicators[indicatorIndex],
            datasource: this.datasource
          });
          this.removeQueryFromLocalStore();
          // TODO: remove the query from local store
        },
        (err) => {
          console.log(err);
        }
      );
  }

  removeQueryFromLocalStore() {
    const localWorkspaceData = this.sharedService.getFromStorage('workspaces')[this.workspace.id];
    if (localWorkspaceData) {
      const indicatorIndex = localWorkspaceData.queries.findIndex((queryItem) => {
        return queryItem.indicatorId === this.indicatorData._id;
      });
      if (indicatorIndex >= 0) {
        localWorkspaceData.queries.splice(indicatorIndex, 1);
        this.sharedService.setInStorage(`workspaces.${localWorkspaceData.id}`, localWorkspaceData);
      }
    }
  }

  private formatKPIBeforeSave(kpiToUpdate) {
    for (const prop in kpiToUpdate) {
      if (kpiToUpdate.hasOwnProperty(prop)) {
        switch (prop) {
          case 'columnsToDisplay':
          case 'selectedBgColor':
          case 'selectedfontColor':
          case 'query':
            delete kpiToUpdate[prop];
            break;
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
            // TODO: confirm that this is the correct behaviour: changing the kpi formula,
            // when the aggregation is change (sum -> division: false, avg -> division: true)
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
    // send the formula (and all the other existing props) so the backend knows that the kpi is not 'new' but 'update'
    kpiToUpdate['formula'] = this.indicatorData.formula;
    kpiToUpdate['dependencies'] = this.indicatorData.dependencies;
    kpiToUpdate['_id'] = this.indicatorData._id;
    return kpiToUpdate;
  }
}
