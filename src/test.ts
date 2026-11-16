// This file is required by karma.conf.js and loads recursively all the .spec and framework files

// zone.js v0.14 exports moved; use the testing entry from the package root.
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
// Use the Highcharts ESM masters entry for tests too to keep builds ESM-first
import Highcharts from 'highcharts/es-modules/masters/highcharts.src.js';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
// Set sane defaults in localStorage used by many components
try {
  if (!localStorage.getItem('account')) {
    localStorage.setItem('account', JSON.stringify({ id: '1', UserType: '1' }));
  }
  if (!localStorage.getItem('siteId')) {
    localStorage.setItem('siteId', '1');
  }
  if (!localStorage.getItem('sitename')) {
    localStorage.setItem('sitename', 'Test Site');
  }
  if (!localStorage.getItem('token')) {
    localStorage.setItem('token', 'test-token');
  }
} catch (e) {
  // ignore when localStorage is not available in some environments
}

// Stub Highcharts chart/Chart to avoid test-time initialization crashes when components call
// Highcharts.chart/Chart without full options. Tests should not rely on real rendering.
try {
  const anyH = Highcharts as any;
  // Ensure common internals exist
  anyH.seriesTypes = anyH.seriesTypes || [];
  anyH.series = anyH.series || [];
  anyH.charts = anyH.charts || [];
  anyH.addEvent = anyH.addEvent || function () { };
  anyH.each = anyH.each || function (arr: any, fn: any) { if (arr && Array.isArray(arr)) arr.forEach(fn); };
  anyH.extend = anyH.extend || function (a: any, b: any) { Object.assign(a, b || {}); };
  // Minimal Series/base stubs so modules that extend Series (solid-gauge, etc.)
  // don't throw during Karma test-time. Real behavior isn't needed for unit tests.
  anyH.Series = anyH.Series || function Series() { };
  anyH.Series.prototype = anyH.Series.prototype || {};
  anyH.seriesTypes = anyH.seriesTypes || {};
  anyH.seriesType = anyH.seriesType || function (type: string, Base: any, options?: any, proto?: any) {
    // record a minimal series type so modules can reference it
    anyH.seriesTypes[type] = proto || {};
  };
  // Provide a minimal 'gauge' base so modules that extend the gauge series
  // (for example solid-gauge) can safely subclass during tests.
  if (!anyH.seriesTypes['gauge']) {
    anyH.seriesTypes['gauge'] = anyH.Series;
  }
  // Replace the real chart factory with a test-safe stub so components that call
  // Highcharts.chart/Chart during ngOnInit don't execute the full Highcharts
  // initialization (which expects complex internal state).
  anyH.chart = function () {
    return { series: [], legend: { allItems: [] }, redraw: () => { }, reflow: () => { }, chart: {} };
  };
  anyH.Chart = anyH.chart;
} catch (e) { }
// Provide common testing modules/providers globally to reduce missing-provider failures
beforeEach(() => {
  TestBed.configureTestingModule({
    declarations: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    imports: [BrowserAnimationsModule,
        ReactiveFormsModule,
  MatDialogModule,
  MatCardModule,
  MatSnackBarModule,
  MatTableModule,
  MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule],
    providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
});
