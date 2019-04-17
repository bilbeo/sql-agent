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
  MatSnackBarModule,
  MatIconModule
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
    MatSnackBarModule,
    MatIconModule
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
    MatSnackBarModule,
    MatIconModule
  ],
})
export class MaterialModule { }
