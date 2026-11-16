import { DataService } from './../services/data.service';

import { DataTableItem } from './data-table-datasource';
import { changePassword } from './../models/changepassword';
import { DashboardDataService } from './../services/dashboard-data.service';
import { LoginComponent } from './../login/login.component';

import { UserService } from './../services/user.service';
import { AfterViewInit, Component, OnInit, ViewChild, ViewChildren, QueryList, inject } from '@angular/core';
import { AlarmApiService, apiDate } from '../alarm/alarm-api.service';
import { GatewayStatusComponent } from '../alarm/gateway-status.component';

// import { MatPaginator, MatSort, MatTableDataSource, MatTable } from '@angular/material';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src.js';
import { SHARED_MAT_MODULES } from '../shared/material-imports';

import { UntypedFormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

//--------------------new---------------------------------
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
//----------------------------------------------------------


export interface UserData {
  custId: string;
  custUserName: string;
  totalWH: string;
  liveWH: string;
  WHavgsaving: string;
  maxsaving: string;
  minsaving: string;

}

export interface AlarmData {
  custName: string;
  siteName: string;
  alarmName: string;
  issue: string;
  /** Aisle group, power source or gateway the alarm was raised on. */
  location: string;
  occurrences: number;
  /** First seen (ISO). */
  alarmDate: string;
  lastSeen: string;
  alarmPriority: string;
}

/** Fallback when the API sends only the numeric Alarm_priority. */
const PRIORITY_LABELS: Record<number, string> = { 0: 'Low', 1: 'Medium', 2: 'High' };

@Component({
    selector: 'app-super-admin',
    templateUrl: './super-admin.component.html',
    styleUrls: ['./super-admin.component.css'],
    standalone: true,
    imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    GatewayStatusComponent,
    ...SHARED_MAT_MODULES
]
})

export class SuperAdminComponent {
  dataSource: MatTableDataSource<UserData>;
  customerDisplayedColumns: string[] = ['custId', 'custUserName', 'totalWH', 'liveWH', 'WHavgsaving', 'maxsaving', 'minsaving'];
  alarmDataSource: MatTableDataSource<AlarmData>;
  alarmsColumns: string[] = ['custName', 'siteName', 'alarmName', 'location', 'occurrences', 'alarmDate', 'lastSeen', 'alarmPriority'];
  alarmsLoaded = false;
  private readonly alarmApi = inject(AlarmApiService);

  applyAlarmFilter(value: string) {
    if (this.alarmDataSource) {
      this.alarmDataSource.filter = value.trim().toLowerCase();
    }
  }
  // @ViewChild(MatPaginator) paginator: MatPaginator;
  // @ViewChild(MatSort) sort: MatSort;
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChild(MatTable, { static: true }) table: MatTable<DataTableItem>;
  // snapshot variable defined here
  alarms: any;
  energySaved: any;
  energyConsumed: any;
  percentageSaved: any;


  applySelectFilter(event) {
  }
  selected = '0';
  selected_task = '0';
  date = new UntypedFormControl(new Date());
  serializedDate = new UntypedFormControl((new Date()).toISOString());

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  isCollapsed: boolean = true;
  color = 'primary';
  mode = 'determinate';
  value = 50;
  oldpwd: string;
  token = localStorage.getItem('token');
  chngpwd;
  isShown: boolean = false;
  userInfo: object[];
  customerInfo: object[];
  totalLoad: any;
  r_volt: any;
  y_volt: any;
  b_volt: any;
  r_current: any;
  y_current: any;
  b_current: any;
  supply_source: any;
  isCustomer: boolean = false;
  isShownDiv: boolean = false;
  constructor(private dashData: DashboardDataService, private router: Router, private UserService: UserService, private dataService: DataService) {
  }

  ngOnInit() {
    let userObj = JSON.parse(localStorage.getItem("account"));
    let userId = userObj['id']
    let data = { "user_id": userId }
    // calling snapshot api
    this.UserService.getSuperAdminSnapShot(data).subscribe(
      response => {
        console.log("super admin snapshot response : ", response)
        this.date = response["current_date"]
        this.alarms = response["alarms"]
        this.energyConsumed = response["total_unit_consumed"]
        this.energySaved = response["total_energy_saved"]
        this.percentageSaved = response["total_saved_percentage"]
      },
      error => {
        // If backend is unreachable, populate with lightweight fallback so UI renders
        console.error('SuperAdmin snapshot API failed', error);
  try { this.serializedDate.setValue(new Date().toISOString().substring(0,10)); } catch (e) {}
        this.alarms = [];
        this.energyConsumed = 0;
        this.energySaved = 0;
        this.percentageSaved = 0;
      }
    )
    // Active issues of every live site, grouped by customer (alarmTypeApi/)
    this.alarmApi.allAlarmsByCustomer().subscribe({
      next: groups => {
        const rows: AlarmData[] = groups.flatMap(g => g.alarm_list
          .filter(a => a && typeof a === 'object')
          .map(a => ({
            custName: g.customer_name,
            siteName: a.site_id__site_name,
            alarmName: a.alarm,
            issue: a.issue ?? '',
            location: a.aisle_group_name || a.power_source || a.home_gateway_id || '',
            occurrences: a.occurrences ?? 0,
            alarmDate: apiDate(a.created_time) ?? '',
            lastSeen: apiDate(a.last_seen) ?? '',
            alarmPriority: a.priority || PRIORITY_LABELS[a.Alarm_priority] || 'High',
          })));
        this.alarmDataSource = new MatTableDataSource(rows);
        this.alarmDataSource.paginator = this.paginator.toArray()[0];
        this.alarmDataSource.sort = this.sort.toArray()[0];
        this.alarmsLoaded = true;
      },
      error: error => {
        console.error('SuperAdmin alarm table API failed', error);
        // show an empty table instead of leaving UI broken
        this.alarmDataSource = new MatTableDataSource([]);
        this.alarmsLoaded = true;
      }
    });

    // calling all customer api
    this.UserService.getAllCustomersOnSuperAdmin(data).subscribe(
      response => {
        let customerData = []
        for (let i = 0; i <= response['data'].length - 1; i++) {
          let cust = response['data'][i]
          customerData.push({
            "custId": cust['customer_id'],
            "custUserName": cust["customer_name"],
            "totalWH": cust["total_WH"],
            "liveWH": cust["live_Wh"],
            "WHavgsaving": cust["avg_saving"],
            "maxsaving": cust["max_saving"],
            "minsaving": cust["min_saving"]
          })
        }
        this.dataSource = new MatTableDataSource(customerData);
        this.dataSource.paginator = this.paginator.toArray()[1];
        this.dataSource.sort = this.sort.toArray()[1];
      },
      error => {
        console.error('SuperAdmin customers API failed', error);
        // Provide a minimal fallback customer so the table renders for dev
        const fallback = [{ custId: '0', custUserName: 'No backend', totalWH: '0', liveWH: '0', WHavgsaving: '0', maxsaving: '0', minsaving: '0' }];
        this.dataSource = new MatTableDataSource(fallback);
      }
    )
  }

  openCustDashboard(row: any): void {
    console.log("dskdnqkwkd: ", row)
    let custId = row.custId
    this.dataService.changeMessage("customer");
    localStorage.setItem('id', custId);
  }
}
