import { Component, OnInit, Input, Output, EventEmitter, ViewChild, SimpleChanges, OnChanges, SimpleChange } from '@angular/core';
import { DatasourceService } from '../../providers/datasource.service';
import { SharedService } from '../../providers/shared.service';
import { AlertComponent } from '../alert/alert.component';
import { MatDialog } from '@angular/material';
import { MatStepper } from '@angular/material/stepper';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-manage-indicator',
  templateUrl: './manage-indicator.component.html',
  styleUrls: ['./manage-indicator.component.scss']
})
export class ManageIndicatorComponent implements OnInit, OnChanges {
  @Input() datasource;
  @Input() localWorkspaceData;
  @Input() workspace;
  @Input() indicatorData;
  @Input() editMode;
  @Output() datasourceChange = new EventEmitter();
  @ViewChild('stepper') stepper: MatStepper;
  indicatorForm: FormGroup;
  unitGroups;
  directionOptions;
  newIndicator;
  hints: any;
  queryIndicator;

  constructor(
    private datasourceService: DatasourceService,
    private sharedService: SharedService,
    public dialog: MatDialog,
    public formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.unitGroups = this.datasourceService.getUnitGroups();
    this.hints = this.datasourceService.getIndicatorHints();
    if (!this.indicatorData) {
      this.indicatorData = {};
    }
    this.initIndicatorProperties();
    this.directionOptions = [
      'Increasing is Better',
      'Decreasing is Better',
      'None'
    ];
  }

  ngOnChanges(changes: SimpleChanges) {
    const indicatorData: SimpleChange = changes.indicatorData;
    if (indicatorData && indicatorData.previousValue && (indicatorData.previousValue.name !== indicatorData.currentValue.name)) {
      this.initIndicatorProperties();
      if (this.editMode) {
        // move to the query step
        this.stepper.selectedIndex = 2;
        this.queryIndicator = this.indicatorData;
      } else {
        this.queryIndicator = null;
        this.stepper.selectedIndex = 0;
      }
    }
  }

  initIndicatorProperties() {
    this.newIndicator = null;
    this.newIndicator = {
      publicID: this.indicatorData.publicID || null,
      name: this.indicatorData.name || null,
      information: {
        description: '',
        descriptionI18N: {},
        formula: '',
        formulaI18N: {},
        hint: '',
        hintI18N: {}
      },
      indicatorDomain: this.indicatorData.indicatorDomain || '',
      keyIndicator: this.indicatorData.keyIndicator || false,
      snapshot: this.indicatorData.snapshot || false,
      // snapshot = !timeAggregation
      timeAggregation: !this.indicatorData.snapshot || true,
      // back needs the snapshot property. TimeAggregation is easiest to explain so tht the property we use at front
      division: this.indicatorData.division || false,
      direction: this.indicatorData.direction || 'Increasing is Better',
      displayGranularity: this.indicatorData.displayGranularity || 'Day',
      aggregation: this.indicatorData.aggregation || 'sum',
      valueSpec: this.indicatorData.valueSpec || 'Currency',
      formatSpec: this.indicatorData.formatSpec || '',
      unit: this.unitGroups[0].items[0],
      atomicUpdate: this.indicatorData.atomicUpdate ? '' + this.indicatorData.atomicUpdate : 'false',
    };
    this.indicatorForm = this.formBuilder.group({
      name: [this.newIndicator.name, Validators.required]
    });
    // edit case
    if (this.indicatorData && this.indicatorData.valueSpec) {
      // set the correct unit
      this.unitGroups.forEach((group) => {
        if (group.name === this.indicatorData.valueSpec) {
          this.newIndicator.unit = group.items.find((item) => {
            return item.value === this.indicatorData.formatSpec;
          });
        }
      });
    }
  }

  addIndicator() {
    if (!this.indicatorForm.valid) {
      return;
    }
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
          this.queryIndicator = JSON.parse(JSON.stringify(this.datasource.indicators[lastIndex]));
          this.stepper.next();
          this.indicatorData = JSON.parse(JSON.stringify(this.datasource.indicators[lastIndex]));
          this.editMode = true;
          this.initIndicatorProperties();
        },
        (err) => {
          console.log(err);
        }
      );
  }

  updateIndicator() {
    if (!this.indicatorForm.valid) {
      return;
    }
    // do not overwrite the initial datasource input before saving
    const datasource = JSON.parse(JSON.stringify(this.datasource));
    const indicatorIndex = datasource.indicators.findIndex((indicator) => {
      return indicator.publicID === this.newIndicator.publicID;
    });
    datasource.indicators[indicatorIndex] = this.formatKPIBeforeSave(this.newIndicator);
    this.datasourceService.updateDatasource(datasource, this.datasource._id)
      .subscribe(
        (resDatasource) => {
          this.datasource = resDatasource;
          this.datasourceChange.emit({
            indicator: this.datasource.indicators[indicatorIndex],
            datasource: this.datasource
          });
          this.queryIndicator = this.datasource.indicators[indicatorIndex];
          this.stepper.next();
        },
        (err) => {
          console.log(err);
        }
      );
  }

  removeIndicator() {
    const confirmDialog = this.openDialog('Remove Indicator', 'Are you sure you want to delete the indicator? All the saved data will be removed', 'Cancel', 'Remove');
    confirmDialog.afterClosed().subscribe((result) => {
      if (result) {
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
            },
            (err) => {
              console.log(err);
            }
          );
      }
    });
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

  openDialog(title, message, cancelText, confirmText) {
    const dialogRef = this.dialog.open(AlertComponent, {
      width: '600px',
      data: { title: title, message: message, cancelButtonText: cancelText, confirmButtonText: confirmText }
    });
    return dialogRef;
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
            const nameValue = this.indicatorForm.get('name').value;
            kpiToUpdate.name = nameValue;
            kpiToUpdate.nameI18N = { 'en_GB': nameValue };
            kpiToUpdate.publicID = nameValue.toLowerCase();
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
    if (this.editMode) {
      // send the formula (and all the other existing props) so the backend knows that the kpi is not 'new' but 'update'
      kpiToUpdate['formula'] = this.indicatorData.formula;
      kpiToUpdate['dependencies'] = this.indicatorData.dependencies;
      kpiToUpdate['_id'] = this.indicatorData._id;
    }
    return kpiToUpdate;
  }

}
