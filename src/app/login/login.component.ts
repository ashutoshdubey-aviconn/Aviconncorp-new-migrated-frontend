import { userLogin } from './../models/userLogin';
import { Error } from './../models/error';

import { Forgotpassword } from './../models/forgotpassword';
import { DialogOverComponent } from './../dialog-over/dialog-over.component';
import { DashboardDataService } from './../services/dashboard-data.service';
import { DataService } from './../services/data.service';

import { GlobalService } from './../services/global.service';
import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators, NgForm } from '@angular/forms';
import { UserService } from '../services/user.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { User } from '../models/user';
import { resetpassword } from '../models/resetpassword';
import { SHARED_MAT_MODULES } from '../shared/material-imports';
import { LoggerService } from '../services/logger.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [UserService],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule, RouterModule, ...SHARED_MAT_MODULES]
})

export class LoginComponent implements OnInit {
  userLogin: UntypedFormGroup;
  loading: boolean;
  adminDashboard: string;
  dashbaordData;
  loginerror: string;
  loginErrorString: string;
  Result = 0;
  msg: string;
  UserType: string;
  isCollapsed: boolean = false;
  loginValue;
  userLoginModel = new userLogin('', '', '');
  forgotModel = new Forgotpassword('', '', '');
  resetModel = new resetpassword('', '', '');
  firstName: any;
  lastName: any;
  options: any;
  subject: any;

  constructor(private fb: UntypedFormBuilder, private router: Router, private userService: UserService, public dialog: MatDialog,
    private global: GlobalService, private data: DataService, private dashData: DashboardDataService,
    private logger: LoggerService
  ) {
    this.userLogin = this.fb.group({
      username: ['', Validators.required],
      password: [btoa(''), Validators.required]
    });
  }

  ngOnInit() {
    this.loading = false;
    if (localStorage.getItem('token') && localStorage.getItem('account')) {
      this.global.me = JSON.parse(localStorage.getItem('account'));
      this.router.navigate(['/dashboard']);

      let myObj = JSON.parse(localStorage.getItem("account"));

      if (myObj['UserType'] == 1) {
        this.data.changeMessage("superadmin");
        localStorage.setItem('user_category', 'superadmin');
      }
      else if (myObj['UserType'] == 4 || myObj['UserType'] == 5) {
        this.data.changeMessage("customer");
        localStorage.setItem('user_category', 'customer');

      }
      else if (myObj['UserType'] == 2) {
        this.data.changeMessage("customer");
        localStorage.setItem('user_category', 'fireAlarm');
      }
    }
  }

  onLogin() {
    const { username, password } = this.userLogin.value;
    this.logger.log('sending value: ', username, btoa(password || ''));
    if (!username || !password) {
      this.loginerror = "All fields are mandatory";
      const dialogRef = this.dialog.open(DialogOverComponent, {
        data: this.loginerror,
      });
      dialogRef.afterClosed().subscribe(result => {
      });
      return;
    }

    this.loading = true;
    this.loginValue = { username, password: btoa(password) };
    this.userService.loginUser(this.loginValue).subscribe(
      response => {
        this.logger.log("Login Response : ", response)
        this.loading = false;
        localStorage.setItem('token', response['token']);
        localStorage.setItem('Saved Engergy', response['Saved Engergy']);
        this.global.me = response['user'];
        this.router.navigate(['/dashboard']);
        this.userLoginModel.UserType = response['UserType'];

        let myObj = JSON.parse(localStorage.getItem("account"));

        if (myObj['UserType'] == 1) {
          this.data.changeMessage("superadmin");
          localStorage.setItem('user_category', 'superadmin');

        }
        else if (myObj['UserType'] == 4 || myObj['UserType'] == 5) {
          this.data.changeMessage("customer");
          localStorage.setItem('user_category', 'customer');
        }
        else if (myObj['UserType'] == 2) {
          this.data.changeMessage("customer");
          localStorage.setItem('user_category', 'fireAlarm');
        }
      },
      error => {
        this.loading = false;
        this.loginerror = "Login Error, please check your credentials";
        const dialogRef = this.dialog.open(DialogOverComponent, {
          data: this.loginerror,
        });
        dialogRef.afterClosed().subscribe(result => {
        });
      }
    );
  }

  onForgottpwd() {
    this.logger.log("forgot password: ", this.forgotModel);
    this.userService.forgetpassword(this.forgotModel).subscribe(
      data => {
        this.logger.log('Server Response ! ', data)
        this.Result = data.result;
        this.msg = data.Error;
        this.logger.log('Result : ', this.Result);
        if (this.Result == 1) {
          this.isCollapsed = true;
        }
        else {
          alert(this.msg);
        }
      },
      error => {
        this.logger.error('Error! ', error)
      });
  }

  onResetpwd() {
    this.logger.log("reset value: ", this.resetModel);
    this.isCollapsed = false;
    this.userService.resetPassword(this.resetModel).subscribe(
      data => {
        this.Result = data.result;
        if (this.Result == 1) {
          this.msg = data.success;
          location.reload();
        }
      }, error => {
        this.msg = error.error;
      });

  }
}
