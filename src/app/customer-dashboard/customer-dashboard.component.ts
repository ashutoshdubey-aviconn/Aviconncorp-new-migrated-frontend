import { Router } from '@angular/router';
import { CustomerDetailsModel } from './../models/user';

import { UserService } from './../services/user.service';
import { DataService } from './../services/data.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SHARED_MAT_MODULES } from '../shared/material-imports';
import { HighchartsStandaloneComponent } from '../highcharts/highcharts-standalone.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { from } from 'rxjs';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src.js';
import { LoggerService } from '../services/logger.service';
@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css'],
  standalone: true,
  imports: [
    ...SHARED_MAT_MODULES,
    HighchartsStandaloneComponent,
  ]
})

export class CustomerDashboardComponent {
  dataSource: MatTableDataSource<UserData>; //mandeep
  tableData: any;
  data: any;
  myObj = JSON.parse(localStorage.getItem("account"));
  user_id = this.myObj["id"];
  user_type = this.myObj["UserType"];
  site_dash = false;
  customer_home = false;
  super_admin_home = false;
  customer_name = false;
  isShown: boolean = false;
  showAlarm;
  data1;
  lineChartOptions: any;
  siteId;
  dataSource1
  Custalarms;
  CustenergyConsumed;
  CustsavedEnergy;
  CustpercentageSaved;
  CustcarbonSaved;
  is_carbon_emission_visible = false;
  customerDetails = new CustomerDetailsModel();
  Highcharts = Highcharts;

  constructor(private dataService: DataService, private userService: UserService, private router: Router, private logger: LoggerService) {

  }


  ngAfterViewInit() {
  }

  ngOnInit() {
    this.getCustomerDetails();
    this.getCustomerSiteLists();
    this.getAlarmGraph();
    this.getCustAllSiteSnapshot();
    //here is implementation of breadceumb...
    if (this.user_type == '1') {
      this.super_admin_home = true
      this.customer_home = false
      this.customer_name = true
    }
    else if (this.user_type == '4' || this.user_type == '5') {
      this.super_admin_home = false
      this.customer_home = true
    }

  }


  displayedColumns = ['siteid', 'sitename', 'sitetype', 'siteaddr', 'sitemanager', 'contact'];
  displayedColumns1 = ['siteid', 'site_name', 'internet_down', 'light_faulty', 'high_consump', 'totalalarms'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
    this.dataSource1.filter = filterValue;
  }

  addbut() {
    window.alert("addbutton");
  }
  editbut() {
    window.alert("editbutton");
  }
  alarmTable() {
    this.showAlarm = true;
    this.getCustomerAlarms();
  }
  AlarmTableClose() {
    this.showAlarm = false;
  }
  home() {
    localStorage.removeItem('customer');
    location.reload();
  }


  getAlarmGraph() {
    if (this.user_type == "1") {
      this.data1 = { "id": JSON.parse(localStorage.getItem("id")), }
    } else {
      this.data1 = { "id": this.user_id }
    }
    this.userService.getCustAlarmGraphData(this.data1).subscribe(
      response => {

        // highcharts = Highcharts;
        this.lineChartOptions = {
          colorCount: '4',
          colors: ['#90ED7D', '#ff7a01', '#7cb5ec', '#058DC7'],
          chart: {
            type: "spline",
            backgroundColor: "#222222",

            overflow: 'scroll'
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
            categories: ['Alarms Type']
          },
          yAxis: {
            title: {
              style: { color: 'white', },
              text: "Value"
            },
            labels: {
              style: {
                color: 'white'
              }
            }
          },



          tooltip: {
            valueSuffix: ""
          },
          legend: {
            itemStyle: { color: 'white', },
          },
          series: response["Data"]
        }
        this.logger.log("graph data", this.lineChartOptions)
      });

  }
  getCustomerDetails() {
    if (this.user_type == "1") {
      this.data1 = { "id": JSON.parse(localStorage.getItem("id")) }
    } else {
      this.data1 = { "id": this.user_id }
    }

    this.logger.log("data in customer details:", this.data1)
    this.userService.getCustomerDetails(this.data1).subscribe(
      response => {
        let responseData = response['data'];
        let customerData = responseData['customer'];
        this.customerDetails.id = customerData['id'];
        this.customerDetails.username = customerData['username'];
        this.customerDetails.email = customerData['email'];
        this.customerDetails.contactNumber = customerData['Contact_number'];
        this.customerDetails.name = customerData['first_name'] + " " + customerData['last_name'];
        this.customerDetails.address = responseData['address'];
        this.customerDetails.totalProperties = responseData['total_sites'];
      },
      error => { }
    );
  }


  getCustomerSiteLists() {
    if (this.user_type == "1") {
      this.data1 = { "id": JSON.parse(localStorage.getItem("id")) }
    } else {
      this.data1 = { "id": this.user_id }
    }
    this.logger.log("data in site details########:", this.data1)
    this.dataService.getWarehouseList(this.data1).subscribe(
      response => {
        let sites = [];
        for (let i = 0; i <= response['site'].length - 1; i++) { /*users.push(createNewUser(i));*/
          let data = response['site'][i];
          let is_pf_visible = data['is_pf_visible']
          let is_carbon_emission_visible = data['is_carbon_emission_visible']

          let is_load_graph_visible = data["is_loadGraph_visible"]
          let show_dg_mains_run_time = data['show_dg_mains_run_time']
          let dg_fuel_system_installed = data["dg_fuel_system_installed"]
          let customer_visible_dg_fuel_data = data["customer_visible_dg_fuel_data"]
          let is_hourly_data_visible = data["is_hourly_data_visible_customer"]
          let smContact;
          let smName;
          let TypeOfSite;
          let site_type = data['site_type']
          if (site_type == '1') {
            TypeOfSite = 'WH METERING'
          }
          else if (site_type == '2') {
            TypeOfSite = 'WH_ENERGY SAVING'
          }
          else if (site_type == '5') {
            TypeOfSite = 'WH_SUBMETERING'
          }
          else if (site_type == '3') {
            TypeOfSite = 'firealarm_monitoring_system'
          }
          else if (site_type == '4') {
            TypeOfSite = 'firealarm_equipments_system'
          }
          if (data['site_manager_contact']) {

            smContact = data['site_manager_contact']

          }
          else {
            smContact = "-";
          }
          if (data['site_manager']) {

            smName = data['site_manager']
          }
          else {
            smName = "No Site Manager allocated";
          }
          sites.push({
            "siteid": data['id'],
            "sitename": data['site_name'],
            'sitetype': TypeOfSite,
            "contact": smContact,
            "siteaddr": data['location'],
            "sitemanager": smName,
            "is_pf_visible": is_pf_visible,
            "is_carbon_emission_visible": is_carbon_emission_visible,
            "is_load_graph_visible": is_load_graph_visible,
            "show_dg_mains_run_time": show_dg_mains_run_time,
            "dg_fuel_system_installed": dg_fuel_system_installed,
            "customer_visible_dg_fuel_data": customer_visible_dg_fuel_data,
            "is_hourly_data_visible": is_hourly_data_visible
          });

        }
        this.dataSource = new MatTableDataSource(sites);
        this.logger.log(this.dataSource);
        this.logger.log('This is site data source' + ": " + this.dataSource);
        this.dataSource.paginator = this.paginator;  //mandeep
        this.dataSource.sort = this.sort;  //mandeep

      },
      error => { }
    );
  }

  //Here is define function for getting site snapshot(energy-saved, saved% etc)
  getCustAllSiteSnapshot() {
    if (this.user_type == "1") {
      this.data1 = { "id": JSON.parse(localStorage.getItem("id")), "user_type": this.user_type }
    } else {
      this.data1 = { "id": this.user_id, "user_type": this.user_type }
    }
    this.userService.getCustomerSnapshot(this.data1).subscribe(
      response => {
        this.logger.log('Here is data for customer snapshot ', response);
        this.Custalarms = response['alarms'];
        this.CustenergyConsumed = response['energy_consumed'];
        this.CustsavedEnergy = response['saved_energy'];
        this.CustpercentageSaved = response['percentage_saved']
        if ('carbon_saved' in response) {
          this.is_carbon_emission_visible = true;
          this.CustcarbonSaved = response['carbon_saved']
        }
      });
  }
  openSiteDashboard(row: any): void {
    let siteType = row.sitetype;
    let siteId = row.siteid;
    let siteName = row.sitename;
    let is_pf_visible = row.is_pf_visible;
    let is_carbon_emission_visible = row.is_carbon_emission_visible
    let is_load_graph_visible = row.is_load_graph_visible;
    let dg_fuel_system_installed = row.dg_fuel_system_installed
    this.logger.log("carbon_emission_visible : ", is_carbon_emission_visible)
    localStorage.setItem("pf_visible", is_pf_visible);
    localStorage.setItem("carbon_emission_visible", is_carbon_emission_visible);
    localStorage.setItem("is_load_graph_visible", is_load_graph_visible);
    localStorage.setItem('current_customer', this.user_id)
    localStorage.setItem("show_dg_mains_run_time", row.show_dg_mains_run_time)
    localStorage.setItem("dg_fuel_system_installed", dg_fuel_system_installed)
    localStorage.setItem("customer_visible_dg_fuel_data", row.customer_visible_dg_fuel_data)
    localStorage.setItem("is_hourly_data_visible", row.is_hourly_data_visible)
    this.logger.log("site type going to set is : ", siteType)
    this.logger.log("dg/mains runtime value", row.show_dg_mains_run_time)

    if (siteType == "WH METERING") {
      this.dataService.changeMessage("wh_metering");
      localStorage.setItem('siteId', siteId);
      localStorage.setItem("sitename", siteName);
      localStorage.setItem("wh_metering", 'true');

    }
    else if (siteType == "WH_ENERGY SAVING") {
      this.dataService.changeMessage("energy_saving");
      localStorage.setItem('siteId', siteId);
      localStorage.setItem("sitename", siteName);
      localStorage.setItem("energy_saving", 'true');
    }
    else if (siteType == "WH_SUBMETERING") {
      this.dataService.changeMessage("submetering");
      localStorage.setItem('siteId', siteId);
      localStorage.setItem("sitename", siteName);
      localStorage.setItem("submetering", 'true');

    }
    else if (siteType == "firealarm_monitoring_system") {
      this.dataService.changeMessage("firealarm_monitoring_system");
      localStorage.setItem('siteId', siteId);
      localStorage.setItem("sitename", siteName);
      localStorage.setItem("firealarm_monitoring_system", 'true');
    }
    else if (siteType == "firealarm_equipments_system") {
      this.dataService.changeMessage("firealarm_equipments_system");
      localStorage.setItem('siteId', siteId);
      localStorage.setItem("sitename", siteName);
      localStorage.setItem("firealarm_equipments_system", 'true');
    }
    else {
      // Asset Tracking
    }
  }

  openSiteDashOnAlarmClick(row: any): void {
    this.logger.log('%%%%%%%%%%%%%%%%%%%%', row)
    let siteType = row.sitetype;
    let siteId = row.siteid;
    let siteName = row.sitename;
    this.logger.log("site type going to set is : ", siteType)
    if (siteType == "WH_Metering") {
      this.dataService.changeMessage("wh_metering");
      localStorage.setItem('siteId', siteId);
      localStorage.setItem("sitename", siteName);
      localStorage.setItem("wh_metering", 'true');
    }
    else if (siteType == "WH_Energy_Saving") {
      this.dataService.changeMessage("energy_saving");
      localStorage.setItem('siteId', siteId);
      localStorage.setItem("sitename", siteName);
      localStorage.setItem("energy_saving", 'true');

    }
    else {
      // Asset Tracking
    }
  }


  getCustomerAlarms() {
    if (this.user_type == "1") {
      this.data1 = { "id": JSON.parse(localStorage.getItem("id")) }
    } else {
      this.data1 = { "id": this.user_id }
    }
    this.userService.getAlarmsOnCustomerPage(this.data1).subscribe(
      response => {
        this.logger.log("response data of alarms $$$$$$$$: ", response["data"])
        let data = [];
        for (let i = 0; i <= response['data'].length - 1; i++) {
          let res = response['data'][i]
          let site_id = res['site_id'];
          let site_name = res['site_name'];
          let total_alarm_count = res['total_alarm_count'];
          let alarms = res["alarms"]
          let site_type = res['site_type']
          this.logger.log("alarms ##### ", alarms)
          let internet_down = alarms["Internet_Gone"];
          if (internet_down == undefined) {
            internet_down = '0'
          } else {
            internet_down = alarms["Internet_Gone"];
          }
          let light_damaged = alarms["Light_Damaged"];
          if (light_damaged == undefined) {
            light_damaged = '0';
          }
          else {
            light_damaged = alarms["Light_Damaged"];
          }

          let high_consumption = alarms["High_Consumption"]
          if (high_consumption == undefined) {
            high_consumption = '0'
          }
          else {
            high_consumption = alarms["High_Consumption"]
          }



          data.push({
            "siteid": site_id,
            "sitename": site_name,
            "internet_down": internet_down,
            "light_faulty": light_damaged,
            "high_consump": high_consumption,
            "totalalarms": total_alarm_count,
            "sitetype": site_type,
          })
        }
        this.dataSource1 = new MatTableDataSource(data);
        this.logger.log(data);
        this.logger.log('This is alarm data source' + ": " + data);
        this.dataSource1.paginator = this.paginator;
        this.dataSource1.sort = this.sort;

      },
      error => { }
    );

  }
}
/** Constants used to fill up our data base. */

export interface UserData {
  siteid: string;
  sitename: string;
  sitetype: string;
  contact: string;
  avgsaving: string;
  min: string;
  max: string;
}