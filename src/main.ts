import { enableProdMode, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';
import { environment } from './environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NetworkErrorInterceptor } from './app/interceptors/network-error.interceptor';
import { MockApiInterceptor } from './app/interceptors/mock-api.interceptor';


if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    // Provide commonly required platform providers that were previously
    // pulled in via the (now removed) AppModule. Keep this minimal so the
    // app can boot while the rest of the migration continues.
    provideZoneChangeDetection(),importProvidersFrom(BrowserAnimationsModule),
    // Provide router configuration (was previously wired by the removed AppModule)
    importProvidersFrom(AppRoutingModule),
    provideHttpClient(withInterceptorsFromDi()),
    // Register network error interceptor to surface offline / DNS failures
    { provide: HTTP_INTERCEPTORS, useClass: NetworkErrorInterceptor, multi: true }
    // Mock API interceptor (no-op unless you enable mock mode via query param or localStorage)
    ,{ provide: HTTP_INTERCEPTORS, useClass: MockApiInterceptor, multi: true }
  ]
}).catch(err => console.error(err));
