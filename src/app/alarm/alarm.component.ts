import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  AlarmApiService,
  AlarmTypeSummary,
  METER_DISCONNECT_ALARM_TYPE,
  MeterDisconnection,
  SiteAlarmDetail,
  SiteAlarmList,
  apiDate,
} from './alarm-api.service';

type LoadState = 'loading' | 'ready' | 'error';

interface TypeDetail {
  state: LoadState;
  rows: SiteAlarmDetail[];
  meterEvents: MeterDisconnection[];
}

/**
 * Site alarm panel: totals, one line per active alarm type, and the active
 * rows of a type when it is expanded. Backed by alarmList/ and alarmListDetail/.
 */
@Component({
  selector: 'app-alarm',
  templateUrl: './alarm.component.html',
  styleUrls: ['./alarm.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, MatProgressSpinnerModule],
})
export class AlarmComponent implements OnInit {
  private readonly api = inject(AlarmApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly siteId = input.required<number>();
  readonly siteName = input<string | null>(null);
  readonly closed = output<void>();

  readonly state = signal<LoadState>('loading');
  readonly summary = signal<SiteAlarmList | null>(null);
  readonly expanded = signal<number | null>(null);
  readonly details = signal<Record<number, TypeDetail>>({});

  readonly apiDate = apiDate;
  readonly meterAlarmType = METER_DISCONNECT_ALARM_TYPE;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.state.set('loading');
    this.expanded.set(null);
    this.details.set({});
    this.api
      .siteAlarmList(this.siteId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.summary.set(res);
          this.state.set('ready');
        },
        error: () => this.state.set('error'),
      });
  }

  toggle(type: AlarmTypeSummary): void {
    const id = type.alarm_type;
    if (this.expanded() === id) {
      this.expanded.set(null);
      return;
    }
    this.expanded.set(id);
    const cached = this.details()[id];
    if (!cached || cached.state === 'error') {
      this.loadDetail(id);
    }
  }

  retryDetail(type: AlarmTypeSummary): void {
    this.loadDetail(type.alarm_type);
  }

  private loadDetail(alarmType: number): void {
    this.patchDetail(alarmType, { state: 'loading', rows: [], meterEvents: [] });
    this.api
      .siteAlarmDetail(this.siteId(), alarmType)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: rows => this.patchDetail(alarmType, { state: 'ready', rows }),
        error: () => this.patchDetail(alarmType, { state: 'error' }),
      });

    if (alarmType === METER_DISCONNECT_ALARM_TYPE) {
      this.api
        .meterDisconnections({ site_id: this.siteId(), status: 'disconnected', limit: 50 })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: page => this.patchDetail(alarmType, { meterEvents: page?.results ?? [] }),
          error: () => this.patchDetail(alarmType, { meterEvents: [] }),
        });
    }
  }

  private patchDetail(alarmType: number, patch: Partial<TypeDetail>): void {
    this.details.update(all => {
      const current = all[alarmType] ?? { state: 'loading', rows: [], meterEvents: [] };
      return { ...all, [alarmType]: { ...current, ...patch } };
    });
  }

  /** Location label: aisle group, else power source. */
  location(row: SiteAlarmDetail): string {
    return row.aisle_group || row.power_source || '—';
  }

  /** Electrical readings that are present on the row, e.g. "R 231 · Y 229 · Fuel 40". */
  readings(row: SiteAlarmDetail): string {
    const parts: string[] = [];
    if (row.r_phase != null) parts.push(`R ${row.r_phase}`);
    if (row.y_phase != null) parts.push(`Y ${row.y_phase}`);
    if (row.b_phase != null) parts.push(`B ${row.b_phase}`);
    if (row.fuel_level != null) parts.push(`Fuel ${row.fuel_level}`);
    if (row.run_hours != null) parts.push(`Run ${row.run_hours} h`);
    return parts.join(' · ');
  }

  hasReadings(rows: SiteAlarmDetail[]): boolean {
    return rows.some(r => this.readings(r) !== '');
  }

  priorityClass(priority: string | null | undefined): string {
    return 'prio prio-' + (priority || 'unknown').toLowerCase();
  }
}
