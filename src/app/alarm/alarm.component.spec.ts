import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';

import { AlarmComponent } from './alarm.component';
import { SiteAlarmList } from './alarm-api.service';

const api = environment.alarmApiUrl;

const SUMMARY: SiteAlarmList = {
  status: 200,
  total_alarm: 9,
  high_priority: 9,
  medium_priority: 0,
  active_alarms: 2,
  data: [
    { name: 'Meter Reading Issue', count: 6, priority: 'High', alarm_type: 10 },
    { name: 'Meter Disconnected', count: 3, priority: 'High', alarm_type: 14 },
  ],
};

describe('AlarmComponent', () => {
  let fixture: ComponentFixture<AlarmComponent>;
  let http: HttpTestingController;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlarmComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AlarmComponent);
    fixture.componentRef.setInput('siteId', 114);
    http = TestBed.inject(HttpTestingController);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  function flushSummary(body: SiteAlarmList = SUMMARY) {
    const req = http.expectOne(api + 'alarmList/');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ siteId: 114 });
    req.flush(body);
    fixture.detectChanges();
  }

  it('shows totals and one line per alarm type', () => {
    expect(el.textContent).toContain('Loading alarms');
    flushSummary();

    const values = Array.from(el.querySelectorAll('.stat .value')).map(v => v.textContent?.trim());
    expect(values).toEqual(['2', '9', '9', '0']);
    const names = Array.from(el.querySelectorAll('.type .name')).map(n => n.textContent?.trim());
    expect(names).toEqual(['Meter Reading Issue', 'Meter Disconnected']);
  });

  it('loads the active rows of a type when it is expanded', () => {
    flushSummary();
    (el.querySelector('.type-row') as HTMLButtonElement).click();
    fixture.detectChanges();

    const req = http.expectOne(api + 'alarmListDetail/');
    expect(req.request.body).toEqual({ siteId: 114, alarm_type: 10 });
    req.flush({
      status: 200,
      data: [{
        get_alarm_type_display: 'Meter Reading Issue', get_alarm_priority_display: 'High',
        power_source: null, r_phase: null, y_phase: null, b_phase: null, fuel_level: null, run_hours: null,
        created: '2026-11-02T12:20:23.984023', is_active: true, aisle_group: 'F1-Part1-EL',
        issue: 'lower meter reading reported.', occurrences: 3, last_seen: '2026-11-02T13:10:23.982042',
      }],
    });
    fixture.detectChanges();

    const cells = Array.from(el.querySelectorAll('.detail tbody td')).map(c => c.textContent?.trim());
    expect(cells[0]).toBe('F1-Part1-EL');
    expect(cells[1]).toBe('lower meter reading reported.');
    expect(cells[2]).toBe('3');
  });

  it('also lists disconnected meters for the meter-disconnect alarm', () => {
    flushSummary();
    (el.querySelectorAll('.type-row')[1] as HTMLButtonElement).click();
    fixture.detectChanges();

    http.expectOne(api + 'alarmListDetail/').flush({ status: 200, data: [] });
    const meters = http.expectOne(r => r.url === api + 'meter-disconnections/');
    expect(meters.request.params.get('site_id')).toBe('114');
    expect(meters.request.params.get('status')).toBe('disconnected');
    meters.flush({ status: 200, count: 0, limit: 50, offset: 0, results: [] });
  });

  it('shows an empty state when the site has no active alarms', () => {
    flushSummary({ ...SUMMARY, total_alarm: 0, high_priority: 0, active_alarms: 0, data: [] });
    expect(el.textContent).toContain('No active alarms on this site.');
  });

  it('shows an error with retry when the request fails', () => {
    http.expectOne(api + 'alarmList/').flush('down', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect(el.textContent).toContain("Couldn't load alarms.");

    (el.querySelector('.state.error .link-btn') as HTMLButtonElement).click();
    fixture.detectChanges();
    flushSummary();
    expect(el.querySelectorAll('.type').length).toBe(2);
  });
});
