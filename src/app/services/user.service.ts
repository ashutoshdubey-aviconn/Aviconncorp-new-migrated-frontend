import { changePassword } from './../models/changepassword';
import { Forgotpassword } from './../models/forgotpassword';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { catchError } from 'rxjs/operators';
import { DataRowOutlet } from '@angular/cdk/table';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  baseUrl: string = environment.apiUrl;
  

  constructor(private http: HttpClient) { }


loginUser(userData: any): Observable<any> {
    return this.http.post(this.baseUrl + 'login/', userData, this.getAuthHeaders())
      .pipe(catchError(err => this.errorHandler(err)));

  }
  errorHandler(error: HttpErrorResponse){
    return throwError(() => error.message || "Server Error");
  }


  removeToken(usertoken: any):Observable<any> {
    return this.http.delete(this.baseUrl + 'movie/' + usertoken + '/' , this.getAuthHeaders());

  }

  private getAuthHeaders(){
    const token = localStorage.getItem('token');
    const httpHeaders = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token});
    return {headers:httpHeaders};
  }

  superAdminCustomertable(){
    return this.http.get(this.baseUrl + 'customer/', this.getAuthHeaders());
  }

  forgetpassword(data: any) {
    return this.http.post<any>(this.baseUrl + 'forgot/', data);
  }

  resetPassword(data: any) {
    return this.http.post<any>(this.baseUrl + 'reset/', data);
  }

  changePassword(data:any){
    return this.http.post(this.baseUrl + 'change-pwd/' , data,this.getAuthHeaders());
  }

  getCustomerDetails(data:any){
    return this.http.post(this.baseUrl + 'customer-details', data,this.getAuthHeaders());
  }

 validateToken(data: any){
    return this.http.post(this.baseUrl + 'validateToken/', data);
  }
//here is api for baselinedata
siteSnapshot(data:any){
  return this.http.post(this.baseUrl + 'snapshot/', data,this.getAuthHeaders());
}
 energySavingMonthlyTrend(data:any){
   return this.http.post(this.baseUrl + 'savingMonthlyTrend/', data,this.getAuthHeaders());
 }
 subMeteringMonthlyTrend(data:any){
  return this.http.post(this.baseUrl + 'subMeteringMonthlyTrend/', data,this.getAuthHeaders());
 }

 energySavingPie(data:any){
   return this.http.post(this.baseUrl + 'savingPieChartData/',  data,this.getAuthHeaders());
 }

 energySavingMonthlyData(data:any){
   return this.http.post(this.baseUrl + 'savingMonthly/', data,this.getAuthHeaders());
 }
 submeteringMonthlyBarChart(data:any){
  return this.http.post(this.baseUrl + 'submeteringMonthlyBarChart/', data,this.getAuthHeaders());

 }
 energySavingHourlyData(data:any){
   return this.http.post(this.baseUrl + 'hourlySavingData/', data,this.getAuthHeaders());
 }
 submeteringHourlyData(data:any){
  return this.http.post(this.baseUrl + 'submeteringHourlyData/', data,this.getAuthHeaders());
}
siteLoad(data:any){
  return this.http.post(this.baseUrl + 'siteLoad/', data);
}
getBaselineHistory(data:any){
  return this.http.post(this.baseUrl+ 'baselineHistory/',data,this.getAuthHeaders());
}
getSiteSnapshot(data:any){
  return this.http.post(this.baseUrl+ 'siteSnapShotEnergySavingApi/',data,this.getAuthHeaders())
}
getSubmeteringSnapshot(data:any){
  return this.http.post(this.baseUrl+ 'submeteringSnapshot/',data,this.getAuthHeaders())

}
getCustomerSnapshot(data:any){
  return this.http.post(this.baseUrl+ 'customerSnapShotEnergySavingApi/',data,this.getAuthHeaders())
}
// for fire alarm
getFireAlarmSnapShotData(data:any){
  return this.http.post(this.baseUrl + 'fireAlarm/',data,this.getAuthHeaders())
}
getEmailHistorySnapShotData(data:any){
  return this.http.post(this.baseUrl + 'emailhistory/',data,this.getAuthHeaders())
}




getAllCustomers(){
  return this.http.get(this.baseUrl + "customer/",this.getAuthHeaders())
}


getAlarmsOnCustomerPage(data:any){
  return this.http.post(this.baseUrl +"alarmListOnCustomerPage/",data)
}
getCustAlarmGraphData(data:any){
  return this.http.post(this.baseUrl+'getCustAlarmGraph/',data,this.getAuthHeaders())
}

// super admin services start here for homepage

getSuperAdminSnapShot(data){
  return this.http.post(this.baseUrl + 'snapshot/', data,this.getAuthHeaders())
}

getSuperAdminAlarmPriorityTable(data){
  return this.http.post(this.baseUrl + 'alarmTypeApi/', data,this.getAuthHeaders())
}

getAllCustomersOnSuperAdmin(data){
  return this.http.post(this.baseUrl + 'customerDetails/', data,this.getAuthHeaders())
}

// super admin service end here for homepage

}
