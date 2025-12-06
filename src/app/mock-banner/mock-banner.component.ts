import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggerService } from '../services/logger.service';

@Component({
  selector: 'app-mock-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visible" class="mock-banner">Mock data served: {{ last }} ({{ count }})</div>
  `,
  styles: [
    `
    .mock-banner {
      position: fixed;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      background: #ffca28;
      color: #000;
      padding: 6px 12px;
      border-radius: 4px;
      z-index: 12000;
      font-weight: 600;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    `
  ]
})
export class MockBannerComponent implements OnDestroy {
  visible = false;
  last = '';
  count = 0;
  private _listener?: (e: any) => void;

  constructor(private logger: LoggerService) {
    try {
      if (typeof window !== 'undefined' && (window as any).addEventListener) {
        this._listener = (e: any) => {
          this.count++;
          this.last = e && e.detail && e.detail.name ? e.detail.name : '(fixture)';
          this.visible = true;
          // hide after 3s
          setTimeout(() => this.visible = false, 3000);
          try { this.logger.log('mock-banner: event', this.last, this.count); } catch (_) { }
        };
        (window as any).addEventListener('mockApi:served', this._listener);
      }
    } catch (err){ this.logger.warn('mock-banner: failed to attach listener', err); }
  }

  ngOnDestroy(): void {
    try {
      if (this._listener && typeof window !== 'undefined' && (window as any).removeEventListener) {
        (window as any).removeEventListener('mockApi:served', this._listener);
      }
    } catch (_){ }
  }
}
