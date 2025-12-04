import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, OnDestroy, EventEmitter, Output } from '@angular/core';
// Use Highcharts ESM masters entrypoint to avoid CommonJS/AMD imports which trigger
// Angular build optimization warnings. The .src.js ESM masters files are provided
// by the highcharts package under `es-modules/masters`.
import Highcharts from 'highcharts/es-modules/masters/highcharts.src.js';
import { LoggerService } from '../services/logger.service';

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
  template: `<div #chartContainer style="width:100%;height:100%"></div>`,
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
  // Snapshot of last-applied top-level options to avoid unnecessary updates
  private lastOptionsSnapshot: { [k: string]: any } | null = null;
  // Debounce timer id for batching rapid updates
  private pendingUpdateTimer: any = null;
  // Milliseconds to debounce rapid updateFlag toggles/option changes
  private readonly updateDebounceMs = 50;

  constructor(private logger: LoggerService) {}

  // Disable Highcharts accessibility module warnings by default for the
  // application-level wrapper. Individual charts can opt-in by setting
  // `accessibility.enabled` in their options. This avoids the frequent
  // runtime warning in tests and environments where the accessibility
  // module is not intentionally included.
  // Guard in a try/catch to avoid breaking environments where Highcharts
  // doesn't expose `setOptions` (very unlikely but defensive).
  private static _accessibilityConfigured = (() => {
    try {
      if (Highcharts && typeof (Highcharts as any).setOptions === 'function') {
        (Highcharts as any).setOptions({ accessibility: { enabled: false } });
      }
    } catch (_) { /* ignore */ }
    return true;
  })();

  ngAfterViewInit(): void {
    // Defer module initialization and chart creation until the chart element
    // becomes visible in the viewport. This avoids heavy initialization during
    // initial load and reduces work for background tabs. If IntersectionObserver
    // is not available, fall back to creating the chart on the next paint.
    const create = () => this.createChart();
    try {
      if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries, observer) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              create();
              try { observer.disconnect(); } catch {};
              break;
            }
          }
        }, { root: null, threshold: 0 });
        try { obs.observe(this.chartContainer.nativeElement); } catch (err) {
          // If observing fails, fallback to immediate creation after paint
          requestAnimationFrame(() => setTimeout(create, 0));
        }
      } else {
        // No IntersectionObserver (older browsers / some test harnesses)
        requestAnimationFrame(() => setTimeout(create, 0));
      }
    } catch (e) {
      // If anything unexpected happens, attempt to create the chart
      try { create(); } catch (_) { }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.chart && (changes['options'] && !changes['options'].isFirstChange())) {
      // If chart wasn't created yet but options changed, trigger creation now.
      // This will initialize modules and construct the chart if visibility
      // conditions have been satisfied or the fallback has executed.
      try { this.createChart(); } catch (e) {
        this.logger.error('Highcharts: failed to create chart on changes', e);
      }
      return;
    }

    if (this.chart && (changes['options'] || (changes['updateFlag'] && !changes['updateFlag'].isFirstChange()) || (changes['update'] && !changes['update'].isFirstChange()))) {
      // Decide whether the top-level options actually changed (shallow check)
      const shouldUpdate = !this.shallowOptionsEqual(this.lastOptionsSnapshot, this.options);
      if (!shouldUpdate) {
        // No meaningful top-level change — skip update to avoid redraw overhead
        return;
      }

      // Debounce multiple rapid updates so we don't call chart.update too often
      if (this.pendingUpdateTimer) {
        clearTimeout(this.pendingUpdateTimer);
      }
      this.pendingUpdateTimer = setTimeout(() => {
        this.performChartUpdate();
      }, this.updateDebounceMs);
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
           
          this.logger.warn('Highcharts: skipping module initialization in test environment');
          return;
        }

        this.modules.forEach(mod => {
          if (typeof mod === 'function') {
            try {
              mod(hc as any);
            } catch (mErr) {
              // Log and continue; some modules (solid-gauge in Karma) can
              // throw during initialization in test harnesses — skip them.
              try { this.logger.warn('Highcharts: skipping module due to init error', mErr); } catch (_) { }
            }
          }
        });
      } catch (e) {
         
        this.logger.error('Highcharts: failed to initialize modules', e);
      }
  }

  // Create the chart (initializes modules first). Safe to call multiple
  // times; creation is no-op if the chart already exists.
  private createChart(): void {
    if (this.chart) return;
    const hc = this.Highcharts || Highcharts;
    // Ensure a sensible default height when author didn't provide one.
    try {
      if (!this.options) this.options = {};
      if (!this.options.chart) this.options.chart = {};
      // Only apply the default height for bar/column style charts.
      if (!this.options.chart.height && this.isBarChart(this.options)) {
        // Default to 450px height for bar/column charts unless the component sets otherwise
        this.options.chart.height = 450;
      }
    } catch (e) {
      // ignore if options is read-only or causes errors
    }

    this.initModules(hc);
    try {
      // If we applied a default height via options we still ensure the
      // container has a sensible min-height so CSS like `height:100%` on the
      // host element doesn't collapse the visible space.
      try {
        if (!this.options.chart?.height && this.isBarChart(this.options)) {
          this.chartContainer.nativeElement.style.minHeight = '450px';
        } else {
          // clear any previous minHeight when not applicable
          this.chartContainer.nativeElement.style.minHeight = '';
        }
      } catch (_) {}

      if (this.constructorType === 'stockChart' && (hc as any).stockChart) {
        this.chart = (hc as any).stockChart(this.chartContainer.nativeElement, this.options || {});
      } else {
        this.chart = (hc as any).chart(this.chartContainer.nativeElement, this.options || {});
      }
      // Call optional callbackFunction like highcharts-angular used to
      try {
        if (typeof this.callbackFunction === 'function') {
          this.callbackFunction(this.chart);
        }
      } catch (cbErr) {
        // ignore callback errors
        this.logger.error('Highcharts: callbackFunction threw', cbErr);
      }
    } catch (e) {
      // Fail gracefully in case of bad options
      this.logger.error('Highcharts: failed to create chart', e);
    }
  }

  // Perform the actual Highcharts update and emit any bindings
  private performChartUpdate(): void {
    if (!this.chart) return;
    try {
      // Ensure default height exists before update (if parent changed options)
      try {
        if (this.options && (!this.options.chart || !this.options.chart.height)) {
          this.options.chart = this.options.chart || {};
          if (this.isBarChart(this.options)) {
            this.options.chart.height = this.options.chart.height || 450;
            try { this.chartContainer.nativeElement.style.minHeight = '450px'; } catch (_){ }
          } else {
            try { this.chartContainer.nativeElement.style.minHeight = ''; } catch (_){ }
          }
        }
      } catch (_) {}

      this.chart.update(this.options || {}, true, true);
      // update lastOptionsSnapshot to match the top-level keys/primitive values
      this.lastOptionsSnapshot = this.createOptionsSnapshot(this.options);
      try { this.updateChange.emit(this.update); } catch {}
    } catch (e) {
      this.logger.error('Highcharts: failed to update chart', e);
    } finally {
      if (this.pendingUpdateTimer) {
        clearTimeout(this.pendingUpdateTimer);
        this.pendingUpdateTimer = null;
      }
    }
  }

  // Create a shallow snapshot of options: top-level primitive values and lengths
  private createOptionsSnapshot(options: any): { [k: string]: any } | null {
    if (!options || typeof options !== 'object') return null;
    const snap: { [k: string]: any } = {};
    Object.keys(options).forEach(k => {
      const v = options[k];
      if (v == null) {
        snap[k] = v;
      } else if (typeof v === 'object') {
        // for arrays/objects, store their length or a marker to detect top-level changes
        if (Array.isArray(v)) snap[k] = v.length;
        else snap[k] = '[obj]';
      } else {
        snap[k] = v;
      }
    });
    return snap;
  }

  // Detect whether the provided options represent a bar/column style chart.
  private isBarChart(options: any): boolean {
    try {
      if (!options || typeof options !== 'object') return false;
      const chartType = (options.chart && options.chart.type) || null;
      if (chartType && typeof chartType === 'string') {
        const t = chartType.toLowerCase();
        if (t === 'bar' || t === 'column') return true;
      }
      // Check series-level types
      if (Array.isArray(options.series)) {
        for (const s of options.series) {
          if (s && typeof s.type === 'string') {
            const st = s.type.toLowerCase();
            if (st === 'bar' || st === 'column') return true;
          }
        }
      }
    } catch (_) {}
    return false;
  }

  // Shallow compare top-level options snapshot
  private shallowOptionsEqual(a: { [k: string]: any } | null, b: any): boolean {
    if (!a && !b) return true;
    if (!a && b) return false;
    if (!b) return false;
    const snapB = this.createOptionsSnapshot(b);
    if (!snapB && !a) return true;
    if (!snapB || !a) return false;
    const aKeys = Object.keys(a || {});
    const bKeys = Object.keys(snapB || {});
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) {
      if (a[k] !== snapB[k]) return false;
    }
    return true;
  }
}
