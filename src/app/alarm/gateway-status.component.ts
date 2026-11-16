import {
  AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, OnInit, ViewChild, computed, inject, signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AlarmApiService, GatewayStatus } from './alarm-api.service';

type StatusFilter = 'all' | 'online' | 'offline';

/** Super-admin list of gateways and whether each sent data in the last hour (gateway-status/). */
@Component({
  selector: 'app-gateway-status',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule, MatProgressSpinnerModule],
  templateUrl: './gateway-status.component.html',
  styleUrls: ['./gateway-status.component.css'],
})
export class GatewayStatusComponent implements OnInit, AfterViewInit {
  private readonly api = inject(AlarmApiService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  readonly columns = ['status', 'gateway_id', 'site_name', 'customer_name'];
  readonly dataSource = new MatTableDataSource<GatewayStatus>([]);

  readonly state = signal<'loading' | 'ready' | 'error'>('loading');
  readonly gateways = signal<GatewayStatus[]>([]);
  readonly statusFilter = signal<StatusFilter>('all');
  readonly search = signal('');
  readonly online = computed(() => this.gateways().filter(g => g.status).length);
  readonly offline = computed(() => this.gateways().length - this.online());

  constructor() {
    this.dataSource.filterPredicate = (g, raw) => {
      const { status, text } = JSON.parse(raw) as { status: StatusFilter; text: string };
      if (status === 'online' && !g.status) return false;
      if (status === 'offline' && g.status) return false;
      if (!text) return true;
      return [g.gateway_id, g.site_name, g.customer_name, String(g.site_id)]
        .some(v => (v ?? '').toLowerCase().includes(text));
    };
    // Offline first, so problems are at the top.
    this.dataSource.sortingDataAccessor = (g, col) =>
      col === 'status' ? (g.status ? 1 : 0) : ((g as any)[col] ?? '').toString().toLowerCase();
  }

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    if (this.paginator) this.dataSource.paginator = this.paginator;
    if (this.sort) this.dataSource.sort = this.sort;
  }

  load(): void {
    this.state.set('loading');
    // ~100 gateways today; fetch them in one page so filters and sorting cover all of them.
    this.api.gatewayStatus(1000, 0)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: page => {
          const rows = page?.results ?? [];
          this.gateways.set(rows);
          this.dataSource.data = rows;
          this.state.set('ready');
        },
        error: () => this.state.set('error'),
      });
  }

  setStatus(status: StatusFilter): void {
    this.statusFilter.set(status);
    this.applyFilter();
  }

  setSearch(value: string): void {
    this.search.set(value.trim().toLowerCase());
    this.applyFilter();
  }

  private applyFilter(): void {
    this.dataSource.filter = JSON.stringify({ status: this.statusFilter(), text: this.search() });
    this.paginator?.firstPage();
  }
}
