import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

/** Priority labels the backend returns. */
export type AlarmPriority = 'High' | 'Medium' | 'Low' | string;

// ---- /api/alarmList/ -------------------------------------------------------

/** One line per active alarm type on a site. */
export interface AlarmTypeSummary {
  name: string;
  /** Sum of occurrences of this type. */
  count: number;
  priority: AlarmPriority;
  alarm_type: number;
}

export interface SiteAlarmList {
  status: number;
  /** Sum of occurrences across all active alarms. */
  total_alarm: number;
  high_priority: number;
  medium_priority: number;
  active_alarms: number;
  data: AlarmTypeSummary[];
}

// ---- /api/alarmListDetail/ -------------------------------------------------

/** One active alarm row of a given type, newest first. */
export interface SiteAlarmDetail {
  get_alarm_type_display: string;
  get_alarm_priority_display: AlarmPriority;
  power_source: string | null;
  r_phase: number | null;
  y_phase: number | null;
  b_phase: number | null;
  fuel_level: number | null;
  run_hours: number | null;
  /** First seen (ISO, server local time). */
  created: string;
  is_active: boolean;
  aisle_group: string | null;
  issue: string | null;
  occurrences: number;
  last_seen: string | null;
}

// ---- /api/alarmTypeApi/ (Super_Admin only) ---------------------------------

export interface SuperAdminAlarm {
  alarm: string;
  Alarm_priority: number;
  site_id__site_name: string;
  /** First seen. */
  created_time: string;
  priority: AlarmPriority;
  site_id: number;
  customer_id: number;
  customer_name: string;
  source: string | null;
  aisle_group_id: number | null;
  aisle_group_name: string | null;
  leg_id: string | null;
  power_source: string | null;
  home_gateway_id: string | null;
  issue: string | null;
  alarm_type: number;
  last_seen: string | null;
  occurrences: number;
}

export interface CustomerAlarmGroup {
  customer_id: number;
  customer_name: string;
  alarm_list: SuperAdminAlarm[];
}

// ---- /api/alarmapi/ --------------------------------------------------------

export interface AlarmCount {
  Alarm_priority: number;
  site_id__site_name: string;
  alarm_count: number;
}

// ---- /api/snapshot/ --------------------------------------------------------

export interface SuperAdminSnapshot {
  current_date: string;
  /** Same count as the alarm list. */
  alarms: number;
  total_unit_consumed: number;
  total_energy_saved: number;
  total_saved_percentage: string;
}

// ---- /api/consumptionAlarms/ -----------------------------------------------

export interface ConsumptionAlarm {
  id: number;
  alarm_type: string;
  priority: AlarmPriority;
  aisle_group: string;
  created_time: string;
}

// ---- /api/gateway-status/ --------------------------------------------------

export interface GatewayStatus {
  id: number;
  gateway_id: string;
  latitude: number | null;
  longitude: number | null;
  /** true = data received in the last hour. */
  status: boolean;
  site_id: number;
  site_name: string;
  customer_name: string;
}

export interface Page<T> {
  status: number;
  count: number;
  limit: number;
  offset: number;
  results: T[];
}

// ---- /api/meter-disconnections/ --------------------------------------------

export interface MeterDisconnection {
  id: number;
  logged_site_id: number;
  meter_id: number;
  meter_number: number;
  meter_name: string;
  status: 'connected' | 'disconnected' | string;
  port_id: string;
  detection_window_start: string;
  detection_window_end: string;
  last_seen_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface MeterDisconnectionQuery {
  site_id?: number;
  meter_number?: number;
  meter_id?: number;
  status?: 'connected' | 'disconnected';
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

/** Alarm type id the backend raises for meter disconnects. */
export const METER_DISCONNECT_ALARM_TYPE = 14;

/** Dates are sent as YYYY/MM/DD. */
export function toApiDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())}`;
}

/**
 * Typed client for the alarm endpoints. The device-side endpoints
 * (meter-disconnections/ingest/ and temp/dispatch/mail/) are called by
 * gateways, not the dashboard, so they are not exposed here.
 */
@Injectable({ providedIn: 'root' })
export class AlarmApiService {
  private readonly http = inject(HttpClient);
  /** Alarm endpoints live on their own server (see environment.alarmApiUrl). */
  private readonly baseUrl = environment.alarmApiUrl;

  private authOptions() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: 'Token ' + token,
      }),
    };
  }

  /** Site alarm page: totals and one line per active alarm type. */
  siteAlarmList(siteId: number): Observable<SiteAlarmList> {
    return this.http.post<SiteAlarmList>(this.baseUrl + 'alarmList/', { siteId }, this.authOptions());
  }

  /** Active rows of one alarm type on a site, newest first. */
  siteAlarmDetail(siteId: number, alarmType: number): Observable<SiteAlarmDetail[]> {
    return this.http
      .post<{ data: SiteAlarmDetail[] }>(this.baseUrl + 'alarmListDetail/', { siteId, alarm_type: alarmType }, this.authOptions())
      .pipe(map(r => r?.data ?? []));
  }

  /** Super admin: active issues of every live site (last 30 days), grouped by customer. */
  allAlarmsByCustomer(): Observable<CustomerAlarmGroup[]> {
    return this.http
      .post<{ data: CustomerAlarmGroup[] }>(this.baseUrl + 'alarmTypeApi/', {}, this.authOptions())
      .pipe(map(r => (r?.data ?? []).filter(g => g && typeof g === 'object' && Array.isArray(g.alarm_list))));
  }

  /** Super admin: active issue counts, one list per customer. */
  alarmCounts(): Observable<AlarmCount[][]> {
    return this.http
      .post<{ data: AlarmCount[][] }>(this.baseUrl + 'alarmapi/', {}, this.authOptions())
      .pipe(map(r => (r?.data ?? []).filter(Array.isArray)));
  }

  /** Super admin snapshot tiles. Dates default to the current month on the server. */
  superAdminSnapshot(userId: number, start?: Date, end?: Date): Observable<SuperAdminSnapshot> {
    const body: Record<string, unknown> = { user_id: userId };
    if (start) body['start_date'] = toApiDate(start);
    if (end) body['end_date'] = toApiDate(end);
    return this.http.post<SuperAdminSnapshot>(this.baseUrl + 'snapshot/', body, this.authOptions());
  }

  /** Active High / Low Consumption alarms of a site. */
  consumptionAlarms(siteId: number, start?: Date, end?: Date): Observable<ConsumptionAlarm[]> {
    const body: Record<string, unknown> = { site_id: siteId };
    if (start) body['start_date'] = toApiDate(start);
    if (end) body['end_date'] = toApiDate(end);
    return this.http
      .post<{ data: ConsumptionAlarm[] }>(this.baseUrl + 'consumptionAlarms/', body, this.authOptions())
      .pipe(map(r => r?.data ?? []));
  }

  /** Gateway online list (online = data in the last hour). Public endpoint. */
  gatewayStatus(limit = 100, offset = 0): Observable<Page<GatewayStatus>> {
    const params = new HttpParams().set('limit', limit).set('offset', offset);
    return this.http.get<Page<GatewayStatus>>(this.baseUrl + 'gateway-status/', { params });
  }

  /** Meter disconnect / reconnect events (input of alarm 14). */
  meterDisconnections(query: MeterDisconnectionQuery): Observable<Page<MeterDisconnection>> {
    let params = new HttpParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    }
    return this.http.get<Page<MeterDisconnection>>(this.baseUrl + 'meter-disconnections/', { ...this.authOptions(), params });
  }
}

/**
 * The API mixes "YYYY-MM-DD HH:mm:ss" and ISO timestamps. Normalise to ISO so
 * the DatePipe parses both the same way in every browser.
 */
export function apiDate(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.includes('T') ? value : value.replace(' ', 'T');
}
