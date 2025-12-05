import { GlobalService } from './../services/global.service';
import { DataService } from './../services/data.service';
import { Component, OnInit, Input, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SHARED_MAT_MODULES } from '../shared/material-imports';
import { CustomerDashboardComponent } from '../customer-dashboard/customer-dashboard.component';
import { WarehouseComponent } from '../warehouse/warehouse.component';
import { BaselineComponent } from '../baseline/baseline.component';
import { AdminComponent } from '../admin/admin.component';
import { SubmeteringComponent } from '../submetering/submetering.component';
import { SuperAdminComponent } from '../super-admin/super-admin.component';
import { WhMeteringComponent } from '../wh-metering/wh-metering.component';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { changePassword } from '../models/changepassword';
import { Forgotpassword } from './../models/forgotpassword';
import { UserService } from '../services/user.service';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src.js';
import { MatDialog } from '@angular/material/dialog';
import { DialogSwitchdashComponent } from '../dialog-switchdash/dialog-switchdash.component';
import { LoggerService } from '../services/logger.service';
import { ReactiveFormsModule } from '@angular/forms';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    CustomerDashboardComponent,
    WarehouseComponent,
    BaselineComponent,
    AdminComponent,
    SubmeteringComponent,
    SuperAdminComponent,
    WhMeteringComponent,

    ReactiveFormsModule, ...SHARED_MAT_MODULES]
})
export class DashboardComponent implements OnInit {
  isSupperAdmin = true;

  siteId: any;

  title = 'Common Dashboard';
  dashboardType: string;
  infoToken: { token: string; };   //shahid
  Result = 0;
  msg: string;
  isCollapsed: boolean = false;
  modalOpen: boolean = false;
  userActName = localStorage.getItem('account');
  chngpwd: { token: string; old_password: string; new_password: string; }; // shahid
  oldpwd: string;
  token = localStorage.getItem('token');
  changePasswordModel = new changePassword(this.token, '', '');
  resetForm: UntypedFormGroup;

  superAdmin: boolean = false;
  admin: boolean = false;
  customer: string;
  customerUser: boolean = false;
  cat: any;
  cunsData: any;
  saveData: any;
  myObj = JSON.parse(localStorage.getItem("account"));

  userType = this.myObj["UserType"];
  user_id = this.myObj["id"];
  UserName = this.myObj["username"];
  whouser: any;
  Highcharts = Highcharts;
  wh_metering: any;
  energy_saving: any;
  firealarm_equipments_system: any;
  firealarm_monitoring_system: any;
  submetering: any;
  warehouseName: string;
  sessionVerify: string; //for session verification    shahid
  baselineVisibility: boolean = true;

  // Variables for Breadcrumb
  ifCustDashboard: boolean = false;
  ifSiteDashboard: boolean = false;

  user_category: any;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  userService: any;

  constructor(private data: DataService, private breakpointObserver: BreakpointObserver,
    private router: Router, private tokenService: TokenService, private global: GlobalService,
    private user_service: UserService, public dialog: MatDialog, private logger: LoggerService, private fb: UntypedFormBuilder) {
    this.resetForm = this.fb.group({
      oldPass: ['', Validators.required],
      newPass: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.siteId = localStorage.getItem('siteId');

    window.addEventListener('storage', (event) => {
      if (event.storageArea == localStorage) {
        let token = localStorage.getItem("token")
        if (token == undefined) {
          this.router.navigate(["/login"]);
        }
      }
    }, false);

    let myObj = JSON.parse(localStorage.getItem("account"));

    this.verifySession();

    if (myObj['UserType'] == 1) {
      this.data.changeMessage("superadmin");
      // this.baselineVisibility=true;
    }

    else if (myObj['UserType'] == 4 || myObj['UserType'] == 5) {
      this.data.changeMessage("customer");
      // this.baselineVisibility=true;
    }
    else if (myObj['UserType'] == 2) {
      this.data.changeMessage("fireAlarm")
    }

    else {
      // Handle Site manager view here
    }


    this.data.currentMessage.subscribe(response => this.dashboardType = response);


    if (this.dashboardType == 'customer' &&
      (myObj['UserType'] == 1 ||
        myObj['UserType'] == 2 ||
        myObj['UserType'] == 3
      )
    ) {
      this.ifCustDashboard = true;
      this.baselineVisibility = true;
    }

    else if (this.dashboardType == 'wh_metering') {
      /**
      * If the dashboard type is WH Metering, WH Energy Saving or WH Asset Tracking
      */

      /**
      * If the user is admin or superadmin then set the customer dashboard also to true
      */
      if (myObj['UserType'] == 1 ||
        myObj['UserType'] == 2 ||
        myObj['UserType'] == 3
      ) {
        this.ifCustDashboard = true;
      }

      else if (myObj['UserType'] == 4 || myObj['UserType'] == 5) {
        // If user is customer then
        // customer dashboard shall be visible
        this.ifCustDashboard = true;
        this.baselineVisibility = true;
      }

      else {
        // If user is site manager,
        // then customer dashboard shall not be visible
        this.ifCustDashboard = false;
      }

      // Site Dashboard is visible to all Superadmin, Admins,
      // Aviconn User, Customer, Site Manager
      this.ifSiteDashboard = true;
    }

    else if (this.dashboardType == 'energy_saving') {
      if (myObj['UserType'] == 1 ||
        myObj['UserType'] == 2 ||
        myObj['UserType'] == 3
      ) {
        this.ifCustDashboard = true;
      }
      else {
        this.ifCustDashboard = false;
      }

      this.ifSiteDashboard = true;
    }

    this.logger.log("Dashboard Type :" + this.dashboardType);
    this.customer = localStorage.getItem('customer');
    this.logger.log("user login by", this.customer);
    // this account.username

    this.user_category = localStorage.getItem('user_category');
    this.logger.log("user login by user caterory ", this.user_category);

    this.whouser = localStorage.getItem('whouser');
    this.logger.log("User login by pta nhi", this.whouser)

    this.wh_metering = localStorage.getItem('wh_metering');
    this.logger.log("dashboard type is WH_M", this.wh_metering)

    this.energy_saving = localStorage.getItem('energy_saving');
    this.logger.log("Dashboard type is WH_S", this.energy_saving)

    this.firealarm_monitoring_system = localStorage.getItem('firealarm_monitoring_system');
    this.logger.log("Dashboard type is WH_monitoring", this.firealarm_monitoring_system)

    this.firealarm_equipments_system = localStorage.getItem('firealarm_equipments_system');
    this.logger.log("Dashboard type is WH_management", this.firealarm_equipments_system)

    this.warehouseName = localStorage.getItem('siteName');

    this.submetering = localStorage.getItem('submetering')
    this.logger.log("dashboard type is wh_submetering")

    //Here is handling for baseline and jump dashboard
    if ((this.wh_metering == true) && (this.energy_saving == true)) {
      this.baselineVisibility = true;
    }

    if (localStorage.getItem('token') && localStorage.getItem('account')) {
      this.global.me = JSON.parse(localStorage.getItem('account'));
      this.getToken();
    }

    else {
      this.router.navigate(['/login']);
    }
  }

  verifySession() {
    this.infoToken = { "token": localStorage.getItem("token") }
    this.user_service.validateToken(this.infoToken).subscribe
      (
        response => {
          this.sessionVerify = response['result']
          if (this.sessionVerify == 'true') {
            this.logger.log(this.sessionVerify + 'Session verified')
          }
          else {
            localStorage.clear();
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          }
        }
      )
  }

  dgFuelGraph() {
    this.data.changeMessage("loadData");
  }
  getToken() {
    this.tokenService.getToken().subscribe
      (
        response => {
          this.infoToken = response;
          this.logger.log('My-token', response);
        },

        error => {
          this.logger.error('error', error);
        }
      );
  }

  baseline() {
    this.logger.log("baseline html hit")
    this.data.changeMessage("baseline");
    localStorage.setItem('siteId', this.siteId);
    localStorage.setItem("baseline", 'true');
  }

  logOut() {
    this.logger.log('system is going to logout')
    localStorage.clear();
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
    this.logger.log('system is successfully logout')
  }

  home() {
    this.ifSiteDashboard = false;
    this.ifCustDashboard = false;
    localStorage.removeItem('customer');
    localStorage.removeItem('whouser');
    localStorage.removeItem('wh_metering');
    localStorage.removeItem('energy_savinging');


    location.reload();
  }



  customerPage() {
    this.ifSiteDashboard = false;
    localStorage.removeItem('whouser');
    localStorage.removeItem('wh_metering');
    localStorage.removeItem('energy_savinging');
    location.reload();
  }


  Super_Admin_Home() {
    this.ifSiteDashboard = false;
    this.ifCustDashboard = false;
    localStorage.removeItem('customer');
    localStorage.removeItem('whouser');
    localStorage.removeItem('wh_metering');
    localStorage.removeItem('energy_savinging');

    location.reload();

    this.logger.log("Super_Admin_Home Clicked at dashboard")
  }

  onChangepwd() {
    this.logger.log("New Password :", this.resetForm.value.newPass);
    this.chngpwd = {
      'token': this.token,
      'old_password': btoa(this.resetForm.value.oldPass),
      'new_password': btoa(this.resetForm.value.newPass)
    };

    this.user_service.changePassword(this.chngpwd).subscribe
      (
        response => {
          if (response['result'] == '1')
            this.data.success(response['msg']);
          else
            this.data.warn(response['msg']);
        },

        error => {
          this.logger.error("Server Error: ", error);
        }
      );
  }

}
