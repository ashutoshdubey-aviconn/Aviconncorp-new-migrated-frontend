import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private enabled = !environment.production;

  // Central console reference to make console usage consistent and safe
  // (useful for stubbing in tests or replacing with a different sink).
  private readonly consoleRef: { log: (...a: any[]) => void; warn: (...a: any[]) => void; error: (...a: any[]) => void } =
    (typeof console !== 'undefined')
      ? (console as any)
      : { log: () => {}, warn: () => {}, error: () => {} };

  log(...args: unknown[]): void {
    if (this.enabled) this.consoleRef.log(...args);
  }

  warn(...args: unknown[]): void {
    if (this.enabled) this.consoleRef.warn(...args);
  }

  error(...args: unknown[]): void {
    // Always surface errors; wrap in try/catch to be defensive in odd environments
    try {
      this.consoleRef.error(...args);
    } catch (_e) {
      // swallow any console errors
    }
  }
}
