import {
  MatButtonModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatProgressSpinnerModule,
  // MatGridListModule,
  MatListModule,
  MatStepperModule,
  MatRadioModule,
  MatButtonToggleModule,
  MatSlideToggleModule,
  MatExpansionModule
} from '@angular/material';
import { NgModule } from '@angular/core';



@NgModule({
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    // MatGridListModule,
    MatListModule,
    MatStepperModule,
    MatRadioModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatExpansionModule


  ],
  exports: [
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    // MatGridListModule,
    MatListModule,
    MatStepperModule,
    MatRadioModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatExpansionModule
  ],
})
export class MaterialModule { }