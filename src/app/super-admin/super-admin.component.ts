import { DataService } from './../services/data.service';

import { DataTableItem } from './data-table-datasource';
import { DashboardDataService } from './../services/dashboard-data.service';

import { UserService } from './../services/user.service';
import { Component, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { MatPaginator, MatSort, MatTableDataSource, MatTable } from '@angular/material';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src.js';
import { SHARED_MAT_MODULES } from '../shared/material-imports';

import { UntypedFormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { LoggerService } from '../services/logger.service';

//--------------------new---------------------------------
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
// Material modules are provided via `SHARED_MAT_MODULES` - avoid duplicate explicit imports
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
  alarmDate: string;
  alarmPriority: string;
}

@Component({
    selector: 'app-super-admin',
    templateUrl: './super-admin.component.html',
    styleUrls: ['./super-admin.component.css'],
    standalone: true,
    imports: [
      CommonModule,
      ...SHARED_MAT_MODULES
    ]
})

export class SuperAdminComponent implements OnInit {
  dataSource: MatTableDataSource<UserData>;
  customerDisplayedColumns: string[] = ['custId', 'custUserName', 'totalWH', 'liveWH', 'WHavgsaving', 'maxsaving', 'minsaving'];
  alarmDataSource: MatTableDataSource<AlarmData>;
  alarmsColumns: string[] = ['custName', 'siteName', 'alarmName', 'alarmDate', 'alarmPriority']
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
  constructor(private dashData: DashboardDataService, private router: Router, private UserService: UserService, private dataService: DataService, private logger: LoggerService) {
  }

  ngOnInit() {
    let userObj = JSON.parse(localStorage.getItem("account"));
    let userId = userObj['id']
    let data = { "user_id": userId }
    // calling snapshot api
    this.UserService.getSuperAdminSnapShot(data).subscribe(
      response => {
        this.logger.log("super admin snapshot response : ", response)
        this.date = response["current_date"]
        this.alarms = response["alarms"]
        this.energyConsumed = response["total_unit_consumed"]
        this.energySaved = response["total_energy_saved"]
        this.percentageSaved = response["total_saved_percentage"]
      },
      error => {
        // If backend is unreachable, populate with lightweight fallback so UI renders
        this.logger.error('SuperAdmin snapshot API failed', error);
  try { this.serializedDate.setValue(new Date().toISOString().substring(0,10)); } catch (e) {}
        this.alarms = [];
        this.energyConsumed = 0;
        this.energySaved = 0;
        this.percentageSaved = 0;
      }
    )
    // calling alarm priority table api
    this.UserService.getSuperAdminAlarmPriorityTable(data).subscribe(
      response => {
        this.logger.log("response : ", response)
        let alarmPriorityData = []
        for (let i = 0; i <= response['data'].length - 1; i++) {
          let alarm_data = response['data'][i]
          let site_data = alarm_data['alarm_list']
          for (let j = 0; j <= site_data.length - 1; j++) {
            let alarm_priority;
            if (site_data[j]['Alarm_priority'] == 0) {
              alarm_priority = 'Low'
            }
            else if (site_data[j]['Alarm_priority'] == 1) {
              alarm_priority = 'Medium'
            }
            else {
              alarm_priority = 'High'
            }
            alarmPriorityData.push({
              "custName": alarm_data['customer_name'],
              "siteName": site_data[j]['site_id__site_name'],
              "alarmName": site_data[j]['alarm'],
              "alarmDate": site_data[j]['created_time'],
              "alarmPriority": alarm_priority
            })
          }

        }
        this.alarmDataSource = new MatTableDataSource(alarmPriorityData);
        this.alarmDataSource.paginator = this.paginator.toArray()[0];
        this.alarmDataSource.sort = this.sort.toArray()[0];
      },
      error => {
        this.logger.error('SuperAdmin alarm table API failed', error);
        // show an empty table instead of leaving UI broken
        this.alarmDataSource = new MatTableDataSource([]);
      }
    )

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
        this.logger.error('SuperAdmin customers API failed', error);
        // Provide a minimal fallback customer so the table renders for dev
        const fallback = [{ custId: '0', custUserName: 'No backend', totalWH: '0', liveWH: '0', WHavgsaving: '0', maxsaving: '0', minsaving: '0' }];
        this.dataSource = new MatTableDataSource(fallback);
      }
    )
  }

  openCustDashboard(row: any): void {
    this.logger.log("dskdnqkwkd: ", row)
    let custId = row.custId
    this.dataService.changeMessage("customer");
    localStorage.setItem('id', custId);
  }
}
