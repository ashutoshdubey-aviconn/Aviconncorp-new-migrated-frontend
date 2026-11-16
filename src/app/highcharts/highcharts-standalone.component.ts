import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, OnDestroy, EventEmitter, Output } from '@angular/core';
// Use Highcharts ESM masters entrypoint to avoid CommonJS/AMD imports which trigger
// Angular build optimization warnings. The .src.js ESM masters files are provided
// by the highcharts package under `es-modules/masters`.
import Highcharts from 'highcharts/es-modules/masters/highcharts.src.js';

/**
 * Standalone Highcharts wrapper component.
 * - `options` : Highcharts chart options object.
 * - `modules` : optional array of Highcharts module functions to initialize (e.g. boost, no-data-to-display).
 * - `updateFlag` : toggled by the parent to force an update of the chart when options change.
 *
 * Usage example (standalone import):
 * <app-highcharts [options]="chartOptions" [modules]="[Boost, NoData]" [updateFlag]="chartUpdateFlag"></app-highcharts>
 *
 * This keeps Highcharts usage centralized and avoids relying on `highcharts-angular`.
 */
@Component({
  selector: 'app-highcharts',
  standalone: true,
  // The loading panel is shown while the container is still empty, i.e. until
  // the parent's data arrives and Highcharts draws into it. Pure CSS, so there
  // is no extra change-detection state to keep in sync.
  template: `<div #chartContainer class="hc-container"></div><div class="hc-loading" role="status"><span class="hc-spinner" aria-hidden="true"></span>Loading chart…</div>`,
  styles: [`
    :host { display: block; }
    .hc-container { width: 100%; height: 100%; }
    .hc-container:not(:empty) + .hc-loading { display: none; }
    .hc-loading {
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: #222222;
      color: #cccccc;
      font-size: 14px;
    }
    .hc-spinner {
      width: 28px;
      height: 28px;
      border: 3px solid rgba(255, 255, 255, 0.2);
      border-top-color: #ff7a01;
      border-radius: 50%;
      animation: hc-spin 0.8s linear infinite;
    }
    @keyframes hc-spin { to { transform: rotate(360deg); } }
  `],
})
export class HighchartsStandaloneComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef<HTMLDivElement>;
  @Input() options: Highcharts.Options | any = {};
  @Input() modules: Array<((hc: typeof Highcharts) => void) | null> | null = null;
  @Input() constructorType: string | null = null; // 'stockChart' | 'chart'
  // Backwards-compatible inputs used by legacy templates
  @Input() updateFlag = false;
  // Accept the Highcharts namespace from the template if provided (keeps parity with highcharts-angular)
  @Input() Highcharts: any = null;
  // Optional callback function similar to highcharts-angular's callbackFunction
  @Input() callbackFunction: ((chart: any) => void) | null = null;
  // Support two-way [(update)] binding by accepting `update` input and emitting `updateChange`
  @Input() update: any;
  @Output() updateChange = new EventEmitter<any>();
  // Accept legacy `oneToOne` binding used throughout older templates.
  // Note: Angular blocks bindings that look like event handlers (names starting
  // with "on"), so declaring this as an @Input ensures the binding is
  // recognized as a component input and allowed by the compiler/runtime.
  @Input('oneToOne') oneToOne: boolean | null = null;
  // New, safe alias that avoids starting with 'on' (which Angular treats as event-like).
  @Input('oneToOneInput') oneToOneInput: boolean | null = null;
  // Safe boolean input that avoids the 'on' prefix security check.
  @Input('isOneToOne') isOneToOne: boolean | null = null;

  private chart?: Highcharts.Chart;

  ngAfterViewInit(): void {
    this.createChart();
  }

  // Parents usually fill `options` after an API call. Creating the chart before
  // then makes Highcharts draw its default white chart, which flashes on screen
  // until the real (dark) options arrive, so wait until there is something to draw.
  private hasOptions(): boolean {
    return !!this.options && Object.keys(this.options).length > 0;
  }

  private createChart(): void {
    if (this.chart || !this.hasOptions()) {
      return;
    }
    const hc = this.Highcharts || Highcharts;
    this.initModules(hc);
    try {
      if (this.constructorType === 'stockChart' && (hc as any).stockChart) {
        this.chart = (hc as any).stockChart(this.chartContainer.nativeElement, this.options);
      } else {
        this.chart = (hc as any).chart(this.chartContainer.nativeElement, this.options);
      }
      // Call optional callbackFunction like highcharts-angular used to
      try {
        if (typeof this.callbackFunction === 'function') {
          this.callbackFunction(this.chart);
        }
      } catch (cbErr) {
        console.error('Highcharts: callbackFunction threw', cbErr);
      }
    } catch (e) {
      // Fail gracefully in case of bad options
      console.error('Highcharts: failed to create chart', e);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.chart) {
      // The view exists after the first change; create the chart once options arrive
      // (as a new object, or filled in place and signalled with updateFlag/update).
      if (Object.values(changes).some(c => !c.isFirstChange())) {
        this.createChart();
      }
      return;
    }

    if (this.chart && (changes['options'] || (changes['updateFlag'] && !changes['updateFlag'].isFirstChange()) || (changes['update'] && !changes['update'].isFirstChange()))) {
      // Use Highcharts API to update the existing chart
      try {
        this.chart.update(this.options || {}, true, true);
        // If parent used two-way binding [(update)], emit a notification so the
        // parent can reset or react to the completed update. We emit the same
        // value we received to avoid surprising changes.
        try { this.updateChange.emit(this.update); } catch {}
      } catch (e) {
         
        console.error('Highcharts: failed to update chart', e);
      }
    }
  }

  ngOnDestroy(): void {
    try {
      this.chart?.destroy();
    } catch {
      // ignore
    }
  }

  private initModules(hcArg?: any): void {
    // Accept an optional Highcharts instance to initialize modules on.
    // Priority: explicit arg -> provided `Highcharts` input -> imported Highcharts
    const hc = hcArg || this.Highcharts || Highcharts;
      if (!this.modules || this.modules.length === 0) {
        return;
      }

      // During Karma unit tests (and other test runners) Highcharts modules can
      // try to patch internals that our test stub doesn't fully emulate and
      // cause noisy TypeErrors like "reading 'push' of undefined". Skip
      // initializing those heavy modules when running under the test harness.
      // Karma exposes a global __karma__ object on window.
      try {
        if (typeof window !== 'undefined' && (window as any).__karma__) {
           
          console.warn('Highcharts: skipping module initialization in test environment');
          return;
        }

        this.modules.forEach(mod => {
          if (typeof mod === 'function') {
            mod(hc as any);
          }
        });
      } catch (e) {
         
        console.error('Highcharts: failed to initialize modules', e);
      }
  }
}
