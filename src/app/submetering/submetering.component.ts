import { DataService } from './../services/data.service';
import { DataTableItem, DataTableDataSource } from '../super-admin/data-table-datasource';
import { changePassword } from './../models/changepassword';
import { DashboardDataService } from './../services/dashboard-data.service';
import { LoginComponent } from './../login/login.component';

import { UserService } from './../services/user.service';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, formatDate as _formatDate } from '@angular/common';
import { MatTableDataSource, MatTable, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HighchartsStandaloneComponent } from '../highcharts/highcharts-standalone.component';
import { SHARED_MAT_MODULES } from '../shared/material-imports';
import { MatPaginator } from '@angular/material/paginator';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src.js';
import { MatSort } from '@angular/material/sort';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { from } from 'rxjs';
import { formatDate, getLocaleDayNames } from '@angular/common';
import { SiteDetailsModel, LiveMeteringDataModel } from './../models/siteDataModel';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { DialogSwitchdashComponent } from '../dialog-switchdash/dialog-switchdash.component';
import { Router } from '@angular/router';
import { preserveWhitespacesDefault } from '@angular/compiler';
import { LightsWattDataComponent } from '../lights-watt-data/lights-watt-data.component';
import { FanswattdataComponent } from '../fanswattdata/fanswattdata.component';
import { ExcelsheetComponent } from '../excelsheet/excelsheet.component';
import { LoggerService } from '../services/logger.service';


declare var $: any;
export interface KeyValueIf {
  value: string;
  viewValue: string;
}


@Component({
  selector: 'app-submetering',
  templateUrl: './submetering.component.html',
  styleUrls: ['./submetering.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    // local Highcharts wrapper used across the app
    HighchartsStandaloneComponent,
    ...SHARED_MAT_MODULES,
  ],
})


export class SubmeteringComponent implements OnInit {

  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
  monthlyAvg: any;
  monthdate: any;
  applySelectFilter(event) {
  }
  intervals: KeyValueIf[] = [
    { value: '0', viewValue: 'Daily' },
    { value: '1', viewValue: 'Hourly' }
  ];

  selected_graph = '0';
  selected_task = '0';
  date = new UntypedFormControl(new Date());
  serializedDate = new UntypedFormControl((new Date()).toISOString().substring(0, 10));
  filterDate: string;
  picker1: Date;
  dashboardType: string;
  showIntervalOptions: boolean = false;
  showDailygraph: boolean = true;
  showHourlygraph: boolean = false;
  is_carbon_emission_visible: any = localStorage.getItem('carbon_emission_visible');
  data1;
  dailyAvg: any;
  liveData = new LiveMeteringDataModel();
  public pieChartOptions: any;
  graphTitle: string;
  updateFlag: boolean = false;
  whichGraph = 1;
  ishide = 1;
  previous: any;
  graphShown: Boolean = true;

  dataSource: MatTableDataSource<SiteAlarmData>; //mandeep
  tableData: any;

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<DataTableItem>;
  @ViewChild('chart') chart;

  // helper to normalize series data into Highcharts-friendly form
  private normalizeSeries(inputSeries: any): any[] {
    if (!inputSeries) return [];
    return inputSeries.map(s => {
      // if series already looks ok, return as-is
      if (Array.isArray(s.data) || Array.isArray(s)) {
        // ensure numeric y values when data is array of points
        if (Array.isArray(s.data)) {
          s.data = s.data.map(pt => {
            if (Array.isArray(pt)) {
              return [Number(pt[0]), Number(pt[1])];
            } else if (pt && typeof pt === 'object' && pt.x !== undefined) {
              return [Number(pt.x), Number(pt.y)];
            }
            return pt;
          });
        }
        return s;
      }

      // if s is an object with name and array of points
      if (s && typeof s === 'object' && s.data) {
        s.data = (s.data || []).map(pt => {
          if (Array.isArray(pt)) return [Number(pt[0]), Number(pt[1])];
          if (pt && pt.x !== undefined) return [Number(pt.x), Number(pt.y)];
          return pt;
        });
        return s;
      }

      return s;
    });
  }

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  isCollapsed: boolean = true;
  color = 'primary';
  mode = 'determinate';
  value = 50;
  oldpwd: string;
  token = localStorage.getItem('token');
  chngpwd;
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
  dates: object[];
  myData: object[];


  loading = true;
  barChartOptions: any;
  lineChartOptions: any;
  updatedbarChartOptions: any;
  Highcharts = Highcharts;
  pieChart = Highcharts;
  chartConstructor: string = 'chart';
  chartCallback: any = function () { };
  oneToOneFlag: boolean = true;
  //breadcrumbs keywords 
  myObj = JSON.parse(localStorage.getItem("account"));
  user_id = this.myObj["id"];
  user_type = this.myObj["UserType"];
  site_dash = false;
  super_admin_home = false;
  customer_home = false;
  customer_name = false;
  Admindata = false;
  saving_site_dash = false;
  percentageSaved;
  carbonValue;
  alarms;
  savedEnergy;
  energyConsumed;
  liveDate;
  showAlarm;
  sitename;
  customerOnly: boolean = true;
  MyntraLightsOnly: boolean = false
  MyntraFansOnly: boolean = false


  // This site id is just for demo purpose should be replaced by original
  // once the function is moved to customer dashboard
  siteId;

  constructor(private dashData: DashboardDataService, private UserService: UserService, private DataService: DataService, public dialog: MatDialog, private router: Router, private logger: LoggerService) {
  }

  ngOnInit() {
    this.siteId = localStorage.getItem('siteId');
    this.sitename = localStorage.getItem('sitename')
    this.logger.log('here site id in energy saving', this.siteId)

    //here is implementation of breadcrumb...
    if (this.user_type == '1') {
      this.super_admin_home = true
      this.customer_home = false
      this.customer_name = true  //false
      this.site_dash = false
      this.Admindata = true
      this.saving_site_dash = true
      this.showIntervalOptions = true


    }
    else if (this.user_type == '4' || this.user_type == '5') {
      this.customer_home = true
      this.customer_name = false
      this.site_dash = false
      this.Admindata = false
      this.saving_site_dash = true
      this.showIntervalOptions = false
      this.customerOnly = false
    }
    else {
      this.customer_home = true
      this.customer_name = false
      this.site_dash = false
      this.Admindata = false
      this.saving_site_dash = true
    }
    if (this.siteId == '29') {
      this.MyntraLightsOnly = true
    }
    if (this.siteId == '34') {
      this.MyntraFansOnly = true
    }
    //this.getPowerSourceDistData();
    this.submeteringMonthlyBarChart();
    this.getMonthlyTrend();
    this.getSubmeteringSnapshot();

  }

  displayedColumns1 = ['alarm_type', 'object_type', 'alarm_priority', 'created_date'];


  //Here is define function for getting site snapshot(energy-saved, saved% etc)
  getSubmeteringSnapshot() {
    let data = { "site_id": this.siteId, "user_type": this.user_type }
    this.UserService.getSubmeteringSnapshot(data).subscribe(
      response => {
        this.alarms = response['alarms'];
        this.energyConsumed = response['energy_consumed'];
        this.dailyAvg = response['dailyAvg'];
        this.liveDate = response['live_date'];
        this.previous = response['current_date'];
        this.monthlyAvg = response['monthlyAvg'];
        this.monthdate = response['firstmnthDate'];

      });
  }

  valuechange(newValue) {
    //mymodel = newValue;
    this.logger.log(newValue)
  }
  getCust() {
    this.dashData.getCustomerDetail().subscribe(
      response => {
      });
  }
  alarmTable() {
    this.getSiteAlarmsDetails();
    this.showAlarm = true;

  }
  AlarmTableClose() {
    this.showAlarm = false;
  }

  custTable() {
    this.UserService.superAdminCustomertable().subscribe(
      response => {
        let res = response[0];
        this.userInfo = res['c'];
        this.custTable = res['customer'];

      },
      error => {
      }

    );


  }
  changeGraphStacking() {
    this.whichGraph ^= 0x1;

    if (this.whichGraph == 0) {
      try {
        this.barChartOptions.plotOptions.column.stacking = ''; // for daily
      }
      catch {
        this.logger.log("error in daily")
      }
      try {
        this.updatedbarChartOptions.plotOptions.column.stacking = '';  // for hourly
      }
      catch {
        this.logger.log("err in hourly")
      }
      this.updateFlag = true;
      this.logger.log('Inside normal stacking false')
    }
    else {
      try {
        this.barChartOptions.plotOptions.column.stacking = 'normal'; // for daily
      } catch { this.logger.log("error in daily....") }
      try {
        this.updatedbarChartOptions.plotOptions.column.stacking = 'normal'; // for hourly
      } catch { this.logger.log("error in hourly ....") }
      this.updateFlag = true;
      this.logger.log('Inside normal stacking True')
    }
  }


  reenable() {
    this.ishide ^= 0x1;

    if (this.ishide == 1) {
      this.graphShown = true
      let chartData = this.chart.chart.legend.allItems
      for (let i = 0; i <= chartData.length - 1; i++) {
        this.logger.log("data : ", chartData[i])
        chartData[i].setVisible(true, false)
      }
      this.chart.chart.redraw()
      this.logger.log("reenable function true")
    }
    else {
      this.graphShown = false
      let chartData = this.chart.chart.legend.allItems
      for (let i = 0; i <= chartData.length - 1; i++) {
        this.logger.log("data : ", chartData[i])
        chartData[i].setVisible(false, false)
      }
      this.chart.chart.redraw()
    }



  }
  getSiteAlarmsDetails() {


    let data1 = { "site_id": this.siteId }
    this.UserService.getAlarmOnSitePage(data1).subscribe(
      response => {
        let data = [];
        for (let i = 0; i <= response['data'].length - 1; i++) {
          let res = response['data'][i]
          let alarm_type = res['alarm_type'];
          let object_type = res['object_type'];
          let object_name = res['object_name'];
          let alarm_priority = res['alarm_priority'];
          let created_date = res['created_date'];
          data.push({
            "alarm_type": alarm_type,
            "object_type": object_type,
            "object_name": object_name,
            "alarm_priority": alarm_priority,
            "created_date": created_date
          })
        }
        this.dataSource = new MatTableDataSource(data);
        this.logger.log(data);
        this.dataSource.paginator = this.paginator;  //mandeep
        this.dataSource.sort = this.sort;  //mandeep

      },
      error => { }
    );
  }


  getcustomerSnapshot() {
    let data = { "site_id": this.siteId }
    this.UserService.siteSnapshot(data).subscribe(
      response => {
        this.logger.log(response);

      }
    )
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  getRecord(row) {
  }
  onClickChngpwd() {
    // change-password UI removed from this component per request
  }
  customerdetail(obj) {
    this.logger.log(obj);
  }
  onChangePwd() {
    // change-password functionality removed from this component; no-op
    return;
  }

  home() {
    localStorage.removeItem('customer');
    location.reload();
  }

  customerPage() {
    this.DataService.changeMessage("customer");
  }

  //Here is implementation of bar graph daily and hourly data

  submeteringMonthlyBarChart() {

    let todayDate = new Date();
    let tillDate = formatDate(new Date(), 'yyyy/MM/dd', 'en');
    let fromDate = formatDate(new Date().setDate(todayDate.getDate() - 30), 'yyyy/MM/dd', 'en');
    let data1 = { 'site_id': this.siteId, 'from_date': fromDate, 'till_date': tillDate, "user_type": this.user_type };
    this.UserService.submeteringMonthlyBarChart(data1).subscribe(
      response => {
        this.logger.log("ressnw  : ", response)
        // $(function () {
        this.barChartOptions = {
          colorCount: '12',
          colors: ['#90ED7D', '#ff7a01', '#7cb5ec', '#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
          credits: {
            enabled: false,
          },

          chart: {
            backgroundColor: '#222222',
            type: 'column',
            zoomType: 'x',
            setVisible: 'false',
          },

          title: {
            text: this.graphTitle,
            style: {
              color: 'white',
            },
          },

          xAxis: {
            labels: {
              style: {
                color: 'white',
              },
            },
            categories: response['Dates']
          },


          yAxis: {
            allowDecimals: false,
            min: 0,
            // max:6000,
            title: {
              style: { color: 'white', },
              text: 'Number of units (kWh)'
            },
            labels: {
              style: {
                color: 'white'
              }
            },

            stackLabels: {
              enabled: true,
              rotation: 270,
              y: -28,
              style: {
                color: 'white',
                fontSize: '11px',
                verticalAlign: "top",
              }
            }

          },

          tooltip: {
            formatter: function () {
              return '<b>' + this.x + '</b><br/>' +
                this.series.name + ': ' + this.y + '<br/>' +
                'Total: ' + this.point.stackTotal;
            }
          },

          plotOptions: {
            column: {
              stacking: 'normal',
              maxPointWidth: 50
              //colors: ['orange', 'white', 'blue']
            },



          },

          legend: {
            itemStyle: { color: 'white', },
            maxHeight: 80,
            y: 10,
            navigation: {
              activeColor: 'white',
              animation: true,
              arrowSize: 12,
              inactiveColor: '#333',
              style: {
                fontWeight: '2px',
                color: 'white'

              }
            }


          },
          series: this.normalizeSeries(response["Data"]),

        }
        // ensure chart updates after options are set and force reflow
        setTimeout(() => {
          this.updateFlag = true;
          try { if (this.chart && this.chart.chart) this.chart.chart.reflow(); } catch (e) { }
        }, 0);
        this.updateFlag = true;

      });

  }


  columnGraphFilterChanged() {

    let mode = this.selected_task;
    let tillDate = formatDate(this.date.value, 'yyyy/MM/dd', 'en');
    let graphType = this.selected_graph;
    let todayDate = new Date();
    let fromDate;
    let categories = [];
    let series = [];

    let selectedYear = this.date.value.getFullYear();
    let selectedMonth = this.date.value.getMonth();
    let selectedMonthYear = formatDate(this.date.value, 'yyyy/MM', 'en');
    let currentMonthYear = formatDate(new Date(), 'yyyy/MM', 'en');
    let hourlySelectedDate = formatDate(this.date.value, 'yyyy/MM/dd', 'en');
    if (selectedMonthYear == currentMonthYear) {
      // if the daily filter is for current month only
      // then show the last 30 days data
      fromDate = formatDate(new Date().setDate(todayDate.getDate() - 30), 'yyyy/MM/dd', 'en');
    }
    else {
      // if the current month is not same as the selected month
      // then show the data for that complete month
      fromDate = selectedMonthYear + "/01";
      fromDate = formatDate(fromDate, 'yyyy/MM/dd', 'en');
      let day = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      tillDate = selectedMonthYear + "/" + day;
    }



    /**
     *  Call the API on the basis of Graph Type
     */
    if (graphType == '0') {
      // Energy Consumption Graph
      if (mode == '0') {
        // Graph Filter is for daily data
        this.showHourlygraph = false;
        this.showDailygraph = true;
        // Call the API with specific data
        let data = { 'site_id': this.siteId, 'from_date': fromDate, 'till_date': tillDate, "user_type": this.user_type };
        this.UserService.submeteringMonthlyBarChart(data).subscribe(
          response => {
            categories = response['Dates'];
            series = response['Data'];
            this.updateFlag = true;
            this.barChartOptions.xAxis.categories = categories;
            this.barChartOptions.series = series;
            // this.updateFlag = true;
          },
          error => { }
        );
      }
      else {
        // Graph Filter is for hourly data
        this.showDailygraph = false;
        this.showHourlygraph = true;
        let data = { 'site_id': this.siteId, 'date': hourlySelectedDate };
        this.logger.log('This is mine selected Date in hourly data', hourlySelectedDate);
        // this.barChartOptions.plotOptions.column.stacking='percent';

        this.UserService.submeteringHourlyData(data).subscribe(
          response => {
            this.updatedbarChartOptions = {
              colorCount: '12',
              colors: ['#90ED7D', '#ff7a01', '#7cb5ec', '#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
              credits: {
                enabled: false,
              },

              chart: {
                backgroundColor: '#222222',
                type: 'column',
                zoomType: 'x',
                setVisible: 'false',
              },

              title: {
                text: this.graphTitle,
                style: {
                  color: 'white',
                },
              },

              xAxis: {
                labels: {
                  style: {
                    color: 'white',
                  },
                },
                categories: response['Hours']
              },


              yAxis: {
                allowDecimals: false,
                min: 0,
                title: {
                  style: { color: 'white', },
                  text: 'Number of units (kWh)'
                },
                labels: {
                  style: {
                    color: 'white'
                  }
                },
                stackLabels: {
                  enabled: true,
                  rotation: 270,
                  y: -28,
                  style: {
                    color: 'white',
                    fontSize: '11px',
                    verticalAlign: "top",
                  }
                }

              },

              tooltip: {
                formatter: function () {
                  return '<b>' + this.x + '</b><br/>' +
                    this.series.name + ': ' + this.y + '<br/>' +
                    'Total: ' + this.point.stackTotal;
                }
              },

              plotOptions: {
                // series:{
                //   pointWidth:15
                // },
                column: {
                  stacking: 'normal',
                  maxPointWidth: 50
                  //colors: ['orange', 'white', 'blue']
                },



              },

              legend: {
                itemStyle: { color: 'white', },
                maxHeight: 80,
                y: 10,

                // x:15,
                navigation: {
                  activeColor: 'white',
                  animation: true,
                  arrowSize: 12,
                  inactiveColor: '#333',
                  style: {
                    fontWeight: '2px',
                    color: 'white'

                  }
                }


              },
              series: this.normalizeSeries(response["Data"]),
            }
            this.logger.log("hour : ", this.updatedbarChartOptions);
            setTimeout(() => {
              this.updateFlag = true;
              try { if (this.chart && this.chart.chart) this.chart.chart.reflow(); } catch (e) { }
            }, 0);
          },
          error => { }
        );
      }
    }
    else {
      // Graph for energy saving data ....
      if (mode == '0') {
        // Graph Filter is for daily data
        this.showDailygraph = true;
        this.showHourlygraph = false;
        // Call the API with specific data
        let data = { 'site_id': this.siteId, 'from_date': fromDate, 'till_date': tillDate, "user_type": this.user_type };
        //this.barChartOptions.plotOptions.column.stacking='percent'; //mandeep for percentage show
        this.UserService.energySavingMonthlyData(data).subscribe(
          response => {

            categories = response['Dates'];
            series = response['SavingData'];

            this.barChartOptions.xAxis.categories = categories;
            this.barChartOptions.series = this.normalizeSeries(series);
            setTimeout(() => {
              this.updateFlag = true;
              try { if (this.chart && this.chart.chart) this.chart.chart.reflow(); } catch (e) { }
            }, 0);
          },
          error => { }
        );
      }
      else {
        this.showDailygraph = false;
        this.showHourlygraph = true;
        // Graph Filter is for hourly data
        let data = { 'site_id': this.siteId, 'date': hourlySelectedDate };
        this.logger.log('This is mine selected Date in hourly data for energy saving data', hourlySelectedDate);
        this.UserService.energySavingHourlyData(data).subscribe(
          response => {
            this.logger.log("respsmdksk: ", response)
            categories = response['Hours'];
            series = response['SavingData'];
            this.updateFlag = true;
            this.updatedbarChartOptions.xAxis.categories = categories;
            this.updatedbarChartOptions.series = this.normalizeSeries(series);
            setTimeout(() => {
              this.updateFlag = true;
              try { if (this.chart && this.chart.chart) this.chart.chart.reflow(); } catch (e) { }
            }, 0);
          },
          error => { }
        );
      }
    }
  }







  //Call function for monthly trend Graph.....
  getMonthlyTrend() {
    let data1 = { 'site_id': this.siteId, "user_type": this.user_type };
    this.UserService.subMeteringMonthlyTrend(data1).subscribe(
      response => {
        this.lineChartOptions = {
          colorCount: '4',
          colors: ['#90ED7D', '#ff7a01', '#7cb5ec', '#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
          chart: {
            backgroundColor: '#222222',
            type: 'column',
            zoomType: 'x',
            setVisible: 'false',
          },
          title: {
            style: {
              color: 'white',
            },
            text: 'Snapshot Monthly Trend'
          },
          credits: {
            enabled: false
          },
          xAxis: {
            labels: {
              style: {
                color: 'white',
              },
            },
            categories: response['months']
          },
          yAxis: [{ // Primary yAxis
            labels: {
              // format: '{value} units',
              style: {
                color: '#ff7a01'
              }
            },
            title: {
              text: 'Units (KWH)',
              style: {
                color: '#ff7a01'
              }
            },
            opposite: false

          }, { // Secondary yAxis
            gridLineWidth: 0,
            title: {
              text: 'Monthly Avg',
              style: {
                color: '#90ED7D'
              }
            },
            labels: {
              // format: '{value} ',
              style: {
                color: '#90ED7D'
              }

            },
            opposite: true

          }],
          plotOptions: {
            column: {
              stacking: 'normal',
              maxPointWidth: 50
              //colors: ['orange', 'white', 'blue']
            },
          },
          tooltip: {
            formatter: function () {
              return '<b>' + this.x + '</b><br/>' +
                this.series.name + ': ' + this.y + '<br/>' +
                'Total: ' + this.point.stackTotal;
            }
          },
          legend: {
            itemStyle: { color: 'white', },
          },

          series: this.normalizeSeries(response['unit_consumed_data']),
        }
        // trigger update so highcharts-angular picks up new options
        setTimeout(() => {
          this.updateFlag = true;
          try { if (this.chart && this.chart.chart) this.chart.chart.reflow(); } catch (e) { }
        }, 0);
      });




  }


  exportExcelData() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "20%";
    this.dialog.open(ExcelsheetComponent, dialogConfig);

  }

}

export interface SiteAlarmData {
  siteid: string;
  site_name: string;
  sitetype: string;
  contact: string;
  avgsaving: string;
  min: string;
  max: string;
}


