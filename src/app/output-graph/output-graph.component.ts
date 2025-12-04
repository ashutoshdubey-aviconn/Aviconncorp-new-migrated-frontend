// Archived original implementation to `patches/unused/output-graph.component.ts`.
// Provide a minimal standalone stub so builds/tests keep working while
// the original file is recoverable.
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighchartsStandaloneComponent } from '../highcharts/highcharts-standalone.component';
import { SHARED_MAT_MODULES } from '../shared/material-imports';

@Component({
  selector: 'app-output-graph',
  template: `<div></div>`,
  standalone: true,
  imports: [CommonModule, HighchartsStandaloneComponent, ...SHARED_MAT_MODULES]
})
export class OutputGraphComponent {
  // stubbed — original logic archived in patches/unused.
}
