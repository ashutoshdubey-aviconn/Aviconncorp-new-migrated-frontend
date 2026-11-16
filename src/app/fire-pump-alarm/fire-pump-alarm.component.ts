import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { UserService } from '../services/user.service';
import { Observable, interval } from 'rxjs';
import { DataRowOutlet } from '@angular/cdk/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { AfterViewInit,  ViewChild, ViewChildren, QueryList } from '@angular/core';
import { DataTableItem, DataTableDataSource } from '../super-admin/data-table-datasource';
import { filter } from 'rxjs/operators';
import { DataService } from './../services/data.service';
import { SHARED_MAT_MODULES } from '../shared/material-imports';

export interface EmailData {
  serialno: any;
  siteName: string;
  emailfor: string;
  emailDatetime: string;
  
}


@Component({
  selector: 'app-fire-pump-alarm',
  templateUrl: './fire-pump-alarm.component.html',
  styleUrls: ['./fire-pump-alarm.component.css'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, ...SHARED_MAT_MODULES]
})


export class FirePumpAlarmComponent implements OnInit {

  emailDataSource: MatTableDataSource<EmailData>;
  alarmsColumns: string[] = ['serialno', 'sitename','devicename', 'emailFor', 'emaildatetime',]
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChild(MatTable, { static: true }) table: MatTable<DataTableItem>;
  
  // Stops the polling interval when the user leaves this page.
  private readonly destroyRef = inject(DestroyRef);

  constructor(private user: UserService,private dataService:DataService) { }
  myObj = JSON.parse(localStorage.getItem("account"));
  user_id = this.myObj["id"];
  user_type = this.myObj["UserType"];
  // Provide defaults so templates that index alarmData don't break before data arrives.
  alarmData: any[] = [{}, {}, {}, {}, {}];
  main:any;
  aisleName:any;
  auto:any;
  off:any;
  power_source: any;
  curentDate:any;
  manual_mode_time:any;
  auto_mode_time: any;
  off_mode_time: any;
  motor_status_time:any;
  motor:any;
  data:any;
  site:any;
  fire:any;
  r_volt:any;
  aisleName1:any;
  site_id:any;

  site_dash = false;
  customer_home = false;
  super_admin_home = false;
  customer_name = false;
  Admindata = false;
  showIntervalOptions: boolean = false;
  //s:any
  token
  


  ngOnInit() {
    this.getFireAlarmData(),
    this.getFireAlarmEmailHistory()
  }

   ngAfterViewInit() {
     interval(5000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
           () => { this.getFireAlarmData(); }
       );
   }

   customerPage(){
    this.dataService.changeMessage("customer");
   }
   home() {
    localStorage.removeItem('customer');
    location.reload();
}

  getFireAlarmEmailHistory(){
   let data = { "site_id": parseInt(localStorage.getItem("siteId"))}; 
   console.log("dataofsite",data)
   
    this.user.getEmailHistorySnapShotData(data).subscribe(
      response => {
        console.log("responseofemail: ",response)
        let emailData = []
        for (let i = 0; i <= response['data'].length-1; i++){
          let data = response['data'][i]
          let email_var:any;
          if(data['email_for'] == 1){
            email_var = 'Sent-for Manual Mode'
          }
          else if(data['email_for'] == 2){
            email_var = 'Sent-for Auto Mode'
          }
          else if(data['email_for'] == 3){
            email_var = 'PowerSource'
          }
          else if(data['email_for'] == 4){
            email_var = 'Sent-for OFF Mode'
          }
          else if(data['email_for'] == 5){
            email_var = 'Sent-for Motor On'
          }
          else{
            email_var = 'Not define'
          }

          emailData.push({
          "sitename": data["site"],
          "devicename":data['device_name'],
          "emailFor": email_var,
          "emaildatetime":data["datetime"],
          })
          
        }
        this.emailDataSource = new MatTableDataSource(emailData);
        this.emailDataSource.paginator = this.paginator.toArray()[0];
        this.emailDataSource.sort = this.sort.toArray()[0];
      })
    }
   
    
   
    getFireAlarmData(){
      let data = {"site_id" :  parseInt(localStorage.getItem("siteId"))}
      this.user.getFireAlarmSnapShotData(data).subscribe
          (
            response =>
              { 
                // Build a fresh list on every poll and replace the placeholders,
                // instead of appending (which hid the data behind the empty
                // defaults and grew the array every 5 seconds).
                const latest: any[] = [];
                for (let i = 0; i <= response['data'].length-1; i++){
                  let fire = response['data'][i]
                     var aisleName = fire['aislename']
                     var auto = fire['R_Voltage']
                     var main =fire['Y_Voltage']
                     var off = fire['B_Voltage']
                     if(auto > 200  && main < 100 && off > 200){
                      fire['R_Voltage'] = "ON"
                      fire['Y_Voltage'] = "OFF"
                      fire['B_Voltage'] = "OFF"
                     }
                     else if (auto < 100 && main > 200 && off > 200){
                      fire['R_Voltage'] = "OFF"
                      fire['Y_Voltage'] = "ON"
                      fire['B_Voltage'] = "OFF"
                     }
                     else{
                      fire['R_Voltage'] = "OFF"
                      fire['Y_Voltage'] = "OFF"
                      fire['B_Voltage'] = "ON"
                     }
                     if (fire["motor_status"] == 0){
                      fire["motor_status"] = "OFF"
                     }
                     else{
                      fire["motor_status"] = "ON"
                     }
                     latest.push({"aislename": fire['aislename'],
                     "R_Voltage": fire["R_Voltage"],
                     "Y_Voltage": fire["Y_Voltage"],
                     "B_Voltage": fire["B_Voltage"],
                     "motor_status" : fire["motor_status"],
                     "current_date": fire["current_date"]
                    })

                }
                // The template reads five fixed slots; pad so fewer pumps can't crash it.
                while (latest.length < 5) { latest.push({}); }
                this.alarmData = latest;
              })

  }
}
