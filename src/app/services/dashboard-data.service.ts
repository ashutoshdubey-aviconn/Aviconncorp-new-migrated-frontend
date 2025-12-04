import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { LoggerService } from './logger.service';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {

  private data;
  baseUrl: string = environment.apiUrl;
  private getAuthHeaders(){
    const token = localStorage.getItem('token');
    const httpHeaders = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token});
    return {headers:httpHeaders};
  }

  setData(data){
    this.data = data;
    this.logger.log("3rd service class : ", data);
  }

  getData(){
    let temp = this.data;
    //this.clearData();
    return temp;
  }

  clearData(){
    this.data = undefined;
  }

  constructor(private http: HttpClient, private logger: LoggerService) {
    
   }
  getSiteCurrentLoadInfo(data): Observable<any> {
    return this.http.post(this.baseUrl + 'getSiteCurrLoadInfo/', data,this.getAuthHeaders());
  }
  getCustomerDetail():Observable<any> {
    return this.http.get(this.baseUrl + 'customers',this.getAuthHeaders());
  }
}
