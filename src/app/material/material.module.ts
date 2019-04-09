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
  MatExpansionModule,
  MatSnackBarModule
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
    MatExpansionModule,
    MatSnackBarModule


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
    MatExpansionModule,
    MatSnackBarModule
  ],
})
export class MaterialModule { }
