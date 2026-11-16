import { userLogin } from './../models/userLogin';
import { Forgotpassword } from './../models/forgotpassword';
import { DialogOverComponent } from './../dialog-over/dialog-over.component';
import { DashboardDataService } from './../services/dashboard-data.service';
import { DataService } from './../services/data.service';

import { GlobalService } from './../services/global.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { resetpassword } from '../models/resetpassword';
import { MatRippleModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [UserService],
  standalone: true,
  // Import only what the login page uses so the landing bundle stays small.
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatRippleModule, MatProgressSpinnerModule, MatDialogModule, RouterModule]
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
    // Read values from the reactive form instead of relying on deprecated
    // two-way binding with `ngModel` alongside `formControlName`.
    const username = this.userLogin.get('username')?.value || '';
    const password = this.userLogin.get('password')?.value || '';

    if (!username || !password) {
      this.loginerror = "All fields are mandatory";
      this.dialog.open(DialogOverComponent, { data: this.loginerror });
      return;
    }

    this.loading = true;
    // Passwords are stored/transmitted base64-encoded in this app
    this.loginValue = { username, password: btoa(password) };
    this.userService.loginUser(this.loginValue).subscribe(
      response => {
        console.log("Login Response : ", response)
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
    console.log("forgot password: ", this.forgotModel);
    this.userService.forgetpassword(this.forgotModel).subscribe(
      data => {
        console.log('Server Response ! ', data)
        this.Result = data.result;
        this.msg = data.Error;
        console.log('Result : ', this.Result);
        if (this.Result == 1) {
          this.isCollapsed = true;
        }
        else {
          alert(this.msg);
        }
      },
      error => {
        console.log('Error! ', error)
      });
  }

  onResetpwd() {
    console.log("reset value: ", this.resetModel);
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
