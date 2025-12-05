
import { DataService } from './../services/data.service';
import { DataTableItem, DataTableDataSource } from '../super-admin/data-table-datasource';
// changePassword model removed from this component during migration
import { DashboardDataService } from './../services/dashboard-data.service';
import { LoginComponent } from './../login/login.component';
// import {LightsDataComponent} from './lights-data/lights-data.component';

import { UserService } from './../services/user.service';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// Material modules are provided via `SHARED_MAT_MODULES` to avoid duplication
import { HighchartsStandaloneComponent } from '../highcharts/highcharts-standalone.component';
import { SHARED_MAT_MODULES } from '../shared/material-imports';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src.js';
//import {MatPaginator} from '@angular/material';
import { MatSort } from '@angular/material/sort';
import { UntypedFormControl } from '@angular/forms';
import { UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { from } from 'rxjs';
// import {formatDate} from '@angular/common';
import { formatDate, getLocaleDayNames } from '@angular/common';
import { SiteDetailsModel, LiveMeteringDataModel } from './../models/siteDataModel';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { DialogSwitchdashComponent } from '../dialog-switchdash/dialog-switchdash.component';
import { Router } from '@angular/router';
import { preserveWhitespacesDefault } from '@angular/compiler';
import { LightsWattDataComponent } from '../lights-watt-data/lights-watt-data.component';
import { FanswattdataComponent } from '../fanswattdata/fanswattdata.component';
import { AvgDataComponent } from '../avg-data/avg-data.component';
import { ExcelsheetComponent } from '../excelsheet/excelsheet.component';
import { LoggerService } from '../services/logger.service';


declare var $: any;

export interface KeyValueIf {
  value: string;
  viewValue: string;
}


@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HighchartsStandaloneComponent, ...SHARED_MAT_MODULES]
})


export class WarehouseComponent implements OnInit {

  minDate = new Date(2000, 0, 1);
  maxDate = new Date();

  // highCharts = HighCharts;
  applySelectFilter(event) {
    //alert(event.value);
    //data = event.value;
  }
  intervals: KeyValueIf[] = [
    { value: '0', viewValue: 'Daily' },
    { value: '1', viewValue: 'Hourly' }
  ];

  graphTypes: KeyValueIf[] = [
    { value: '0', viewValue: 'Energy Consumption' },
    { value: '1', viewValue: 'Energy Saved' }
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

  is_hourly_data_visible: any = localStorage.getItem("is_hourly_data_visible")
  loading = true;
  barChartOptions: any;
  lineChartOptions: any;
  updatedbarChartOptions: any;
  Highcharts = Highcharts;
  pieChart = Highcharts;
  // normalize incoming series data to Highcharts-friendly arrays
  private normalizeSeries(inputSeries: any): any[] {
    if (!inputSeries) return [];
    return inputSeries.map(s => {
      if (s && Array.isArray(s.data)) {
        s.data = s.data.map(pt => {
          if (Array.isArray(pt)) return [Number(pt[0]), Number(pt[1])];
          if (pt && pt.x !== undefined) return [Number(pt.x), Number(pt.y)];
          return pt;
        });
        return s;
      }
      if (s && s.data) {
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
  avgDataValue: boolean = false
  MyntraLightsOnly: boolean = false
  MyntraFansOnly: boolean = false
  siteId;
  constructor(private dashData: DashboardDataService, private UserService: UserService, private DataService: DataService, public dialog: MatDialog, private router: Router, private logger: LoggerService) {
  }

  ngOnInit() {
    if (this.is_carbon_emission_visible == "true") {
      this.is_carbon_emission_visible = true;
    } else {
      this.is_carbon_emission_visible = false
    }

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
      this.customerOnly = false
      this.avgDataValue = true
      if (this.is_hourly_data_visible == 'true') {
        this.showIntervalOptions = true
      }
      else {
        this.showIntervalOptions = false;
      }
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
    this.getConsumptionData();
    this.getMonthlyTrend();
    this.getSiteSnapshot();

  }

  displayedColumns1 = ['alarm_type', 'object_type', 'alarm_priority', 'created_date'];


  //Here is define function for getting site snapshot(energy-saved, saved% etc)
  getSiteSnapshot() {
    let data = { "site_id": this.siteId, "user_type": this.user_type }
    this.UserService.getSiteSnapshot(data).subscribe(
      response => {
        this.alarms = response['alarms'];
        this.energyConsumed = response['energy_consumed'];
        this.savedEnergy = response['saved_energy'];
        this.percentageSaved = response['percentage_saved']
        this.carbonValue = response['carbon_emission_saved']
        this.liveDate = response['live_date'];
        this.previous = response['previous_date']

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
    //this.loading = true;
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
      this.graphShown = true;
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
    // change-password handler intentionally left empty after removing local form
  }

  home() {
    localStorage.removeItem('customer');
    location.reload();
  }

  customerPage() {
    this.DataService.changeMessage("customer");
  }

  //Here is implementation of bar graph daily and hourly data

  getConsumptionData() {

    let todayDate = new Date();
    let tillDate = formatDate(new Date(), 'yyyy/MM/dd', 'en');
    let fromDate = formatDate(new Date().setDate(todayDate.getDate() - 30), 'yyyy/MM/dd', 'en');
    let data1 = { 'site_id': this.siteId, 'from_date': fromDate, 'till_date': tillDate, "user_type": this.user_type };
    this.UserService.energySavingMonthlyData(data1).subscribe(
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
        setTimeout(() => {
          this.updateFlag = true;
          try { if (this.chart && this.chart.chart) this.chart.chart.reflow(); } catch (e) { }
        }, 0);
        this.updateFlag = true;
      });
  }


  columnGraphFilterChanged(event?: any) {

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
        this.UserService.energySavingMonthlyData(data).subscribe(
          response => {
            categories = response['Dates'];
            series = response['Data'];
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
        // Graph Filter is for hourly data
        this.showDailygraph = false;
        this.showHourlygraph = true;
        let data = { 'site_id': this.siteId, 'date': hourlySelectedDate };
        this.logger.log('This is mine selected Date in hourly data', hourlySelectedDate);
        // this.barChartOptions.plotOptions.column.stacking='percent';

        this.UserService.energySavingHourlyData(data).subscribe(
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
              series: response["Data"],
            }
            // this.chart.chart.redraw()
            this.logger.log("hour : ", this.updatedbarChartOptions);
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
    if (this.is_carbon_emission_visible == true) {
      this.UserService.energySavingMonthlyTrend(data1).subscribe(
        response => {
          let seriesData = [];
          let energyConsumed: any;
          energyConsumed = { "name": "energyConsumed", 'type': "spline", 'y': response['energyConsumed'] }
          let enegySaved = { "name": "energySaved", 'type': 'spline', 'y': response['energySaved'] }
          let percentageSaved = { "name": "percentageSaved", 'type': 'spline', 'y': response['percentageSaved'] }
          let carbonSaved = { "name": "carbonSaved", 'type': 'spline', 'y': response['carbon_saved'] }



          let data2 = [{ "data": [energyConsumed, enegySaved, percentageSaved, carbonSaved] }]

          seriesData.push(data2);


          // highcharts = Highcharts;
          this.lineChartOptions = {
            colorCount: '4',
            colors: ['#90ED7D', '#ff7a01', '#7cb5ec', '#058DC7'],
            chart: {
              type: "spline",
              backgroundColor: "#222222",

              overflow: 'scroll'
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
                text: 'Percentage Saved',
                style: {
                  color: '#7cb5ec'
                }
              },
              labels: {
                format: '{value} %',
                style: {
                  color: '#7cb5ec'
                }

              },
              opposite: true

            }],

            tooltip: {
              formatter: function () {
                let date = new Date().toLocaleDateString("en-US", { month: 'short' }) + '-' + new Date().getFullYear().toString();
                if (date == this.x) {
                  var d = new Date(); // today!
                  d.setDate(d.getDate() - 1);
                  return '<b>' + 'till' + ' ' + d.getDate().toString() + '-' + new Date().toLocaleDateString("en-US", { month: 'short' }) + '-' + new Date().getFullYear().toString() + '</b><br/>' +
                    this.series.name + ': ' + this.y + '<br/>'
                }
                return '<b>' + this.x + '</b><br/>' +
                  this.series.name + ': ' + this.y + '<br/>'

              }
            },
            legend: {
              itemStyle: { color: 'white', },
            },
            series: [

              {
                name: 'Energy Consumed',
                data: response['energyConsumed'],


              },
              {
                name: 'Energy Saved',
                data: response["energySaved"],


              },
              {
                name: 'Carbon Emission Saved',
                data: response["carbon_saved"],


              },
              {
                yAxis: 1,
                name: 'Percentage Saved',
                data: response["percentageSaved"],

              }
            ]
          }
          this.logger.log("graph data", this.lineChartOptions)
        });
    }
    else {
      this.logger.log("else##################################")
      this.UserService.energySavingMonthlyTrend(data1).subscribe(
        response => {
          let seriesData = [];
          let energyConsumed: any;
          energyConsumed = { "name": "energyConsumed", 'type': "spline", 'y': response['energyConsumed'] }
          let enegySaved = { "name": "energySaved", 'type': 'spline', 'y': response['energySaved'] }
          let percentageSaved = { "name": "percentageSaved", 'type': 'spline', 'y': response['percentageSaved'] }

          let data2 = [{ "data": [energyConsumed, enegySaved, percentageSaved] }]
          seriesData.push(data2);

          // highcharts = Highcharts;
          this.lineChartOptions = {
            colorCount: '4',
            colors: ['#90ED7D', '#ff7a01', '#7cb5ec', '#058DC7'],
            chart: {
              type: "spline",
              backgroundColor: "#222222",

              overflow: 'scroll'
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
                text: 'Percentage Saved',
                style: {
                  color: '#7cb5ec'
                }
              },
              labels: {
                format: '{value} %',
                style: {
                  color: '#7cb5ec'
                }

              },
              opposite: true

            }],



            tooltip: {
              formatter: function () {
                let date = new Date().toLocaleDateString("en-US", { month: 'short' }) + '-' + new Date().getFullYear().toString();
                if (date == this.x) {
                  var d = new Date(); // today!
                  d.setDate(d.getDate() - 1);
                  return '<b>' + 'till' + ' ' + d.getDate().toString() + '-' + new Date().toLocaleDateString("en-US", { month: 'short' }) + '-' + new Date().getFullYear().toString() + '</b><br/>' +
                    this.series.name + ': ' + this.y + '<br/>'
                }
                return '<b>' + this.x + '</b><br/>' +
                  this.series.name + ': ' + this.y + '<br/>'

              }
            },
            legend: {
              itemStyle: { color: 'white', },
            },
            series: [

              {
                name: 'Energy Consumed',
                data: response['energyConsumed'],


              },
              {
                name: 'Energy Saved',
                data: response["energySaved"],


              },
              {
                yAxis: 1,
                name: 'Percentage Saved',
                data: response["percentageSaved"],

              }
            ]
          }
          this.logger.log("graph data", this.lineChartOptions)
        });

    }


  }


  openSiteDashboard() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "40%";
    this.dialog.open(DialogSwitchdashComponent, dialogConfig);

  }
  lightsData() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "70%";
    this.dialog.open(LightsWattDataComponent, dialogConfig);

  }
  fansData() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "70%";
    this.dialog.open(FanswattdataComponent, dialogConfig);

  }
  avgData() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "40%";
    this.dialog.open(AvgDataComponent, dialogConfig);

  }
  exportExcelData() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "20%";
    this.dialog.open(ExcelsheetComponent, dialogConfig);

  }

  baseline() {
    this.logger.log("baseline html hit")
    this.DataService.changeMessage("baseline");
    localStorage.setItem('siteId', this.siteId);
    localStorage.setItem("baseline", 'true');
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

