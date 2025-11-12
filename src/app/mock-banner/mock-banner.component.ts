import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
export class MockBannerComponent {
  visible = false;
  last = '';
  count = 0;

  constructor() {
    try {
      if (typeof window !== 'undefined' && (window as any).addEventListener) {
        (window as any).addEventListener('mockApi:served', (e: any) => {
          this.count++;
          this.last = e && e.detail && e.detail.name ? e.detail.name : '(fixture)';
          this.visible = true;
          // hide after 3s
          setTimeout(() => this.visible = false, 3000);
        });
      }
    } catch (_){ /* no-op */ }
  }
}
