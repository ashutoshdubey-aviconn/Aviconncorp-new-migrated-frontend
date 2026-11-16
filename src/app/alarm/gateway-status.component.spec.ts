import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { environment } from 'src/environments/environment';

import { GatewayStatusComponent } from './gateway-status.component';

describe('GatewayStatusComponent', () => {
  let fixture: ComponentFixture<GatewayStatusComponent>;
  let component: GatewayStatusComponent;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GatewayStatusComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(GatewayStatusComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    const req = http.expectOne(r => r.url === environment.alarmApiUrl + 'gateway-status/');
    expect(req.request.method).toBe('GET');
    req.flush({
      status: 200, count: 3, limit: 1000, offset: 0,
      results: [
        { id: 1, gateway_id: 'gw_a', latitude: null, longitude: null, status: true, site_id: 1, site_name: 'Alpha', customer_name: 'Acme' },
        { id: 2, gateway_id: 'gw_b', latitude: null, longitude: null, status: false, site_id: 2, site_name: 'Beta', customer_name: 'Acme' },
        { id: 3, gateway_id: 'gw_c', latitude: null, longitude: null, status: true, site_id: 3, site_name: 'Gamma', customer_name: 'Other' },
      ],
    });
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('counts online and offline gateways', () => {
    expect(component.online()).toBe(2);
    expect(component.offline()).toBe(1);
  });

  it('filters by status and by search text', () => {
    component.setStatus('offline');
    expect(component.dataSource.filteredData.map(g => g.gateway_id)).toEqual(['gw_b']);

    component.setStatus('all');
    component.setSearch('acme');
    expect(component.dataSource.filteredData.map(g => g.gateway_id)).toEqual(['gw_a', 'gw_b']);
  });
});
