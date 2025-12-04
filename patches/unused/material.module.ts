import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatNativeDateModule

  ],
  exports : [
    MatDatepickerModule,
    MatNativeDateModule

  ]
})
export class MaterialModule {
  myDate = new Date();
 }

