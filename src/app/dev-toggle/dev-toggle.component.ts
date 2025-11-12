import { Component } from '@angular/core';

@Component({
  selector: 'app-dev-toggle',
  template: `
    <div class="dev-toggle" [attr.data-enabled]="enabled">
      <label>
        <input type="checkbox" [checked]="enabled" (change)="toggle($event)" />
        Mock API
      </label>
    </div>
  `,
  styles: [
    `
    .dev-toggle {
      position: fixed;
      right: 12px;
      bottom: 12px;
      background: rgba(0,0,0,0.6);
      color: white;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 13px;
      z-index: 9999;
    }
    .dev-toggle label { cursor: pointer; display: flex; align-items: center; gap: 8px }
    `
  ],
  standalone: true
})
export class DevToggleComponent {
  enabled = false;
  constructor() {
    try {
      this.enabled = (typeof window !== 'undefined') && window.localStorage && window.localStorage.getItem('USE_MOCK_API') === 'true';
    } catch (_){ this.enabled = false; }
  }
  toggle(ev: Event) {
    this.enabled = !this.enabled;
    try {
      if (this.enabled) window.localStorage.setItem('USE_MOCK_API', 'true');
      else window.localStorage.removeItem('USE_MOCK_API');
      console.info('[DevToggle] USE_MOCK_API =', this.enabled);
    } catch (_) {}
  }
}
