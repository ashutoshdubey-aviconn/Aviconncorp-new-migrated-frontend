// Archived original implementation to `patches/unused/material.module.ts`.
// This file remains as a minimal shim to avoid breaking imports while the
// original is safely recoverable.
import { NgModule } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

@NgModule({
  imports: [MatDatepickerModule, MatNativeDateModule],
  exports: [MatDatepickerModule, MatNativeDateModule]
})
export class MaterialModule {}

