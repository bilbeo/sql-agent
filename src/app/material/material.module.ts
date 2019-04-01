import {
  MatButtonModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatProgressSpinnerModule,
  // MatGridListModule,
  MatListModule,
  MatStepperModule
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
    MatStepperModule


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
    MatStepperModule
  ],
})
export class MaterialModule { }