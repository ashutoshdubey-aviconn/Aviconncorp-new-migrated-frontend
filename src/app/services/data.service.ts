
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})

export class DataService {
  baseUrl: string = environment.apiUrl;
 
  public isLoading: boolean = false;
  public isModalLoading: boolean = false;
  private messageSource = new BehaviorSubject<string>("superAdmin");
  currentMessage = this.messageSource.asObservable();

  constructor(private http: HttpClient,public snackBar: MatSnackBar, private logger: LoggerService) { }
  
  showLoader(isModal: boolean = false) {
    if (isModal) {
      this.isModalLoading = true;
    } else {
      this.isLoading = true;
    }
  }

  hideLoader(isModal: boolean = false) {
    if (isModal) {
      this.isModalLoading = false;
    } else {
      this.isLoading = false;
    }
  }
  private getAuthHeaders(){
    const token = localStorage.getItem('token');
    const httpHeaders = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token});
    return {headers:httpHeaders};
  }
  data(data:any){
    return this.http.post(this.baseUrl + 'data/', data)
  }

  errorHandler(error: HttpErrorResponse){
    return throwError(() => error.message || "Server Error");
  }


  removeToken(usertoken: any):Observable<any> {
    return this.http.delete(this.baseUrl + 'movie/' + usertoken + '/' , this.getAuthHeaders());

  }
  
  changeMessage(message: string){
    this.logger.log("New message source received :"+message);
    this.messageSource.next(message);
  }
  
  getGraphData(data:any){
    return this.http.post(this.baseUrl + 'getSiteDailyConsumptionData/',data, this.getAuthHeaders());
  }

  getSiteHourlyConsumptionData(data:any){
    return this.http.post(this.baseUrl + 'getSiteHourlyConsumptionData/', data,this.getAuthHeaders());
  }
  
  getWarehouseList(data:any)
  {
    return this.http.post(this.baseUrl + 'getCustomerSites/',data,  this.getAuthHeaders())
      .pipe(catchError(err => this.errorHandler(err)));
  }

  getSiteInfo(data: any) {
    return this.http.post(this.baseUrl + 'site-details/', data,this.getAuthHeaders());
  }

  getPowerSrcDistData(data: any) {
    return this.http.post(this.baseUrl + 'getPowerSrcDistData/', data,this.getAuthHeaders());
  }

  getDailyPowerSrcDistData(data: any){
    return this.http.post(this.baseUrl + 'getDailyPowerSrcDistData/', data,this.getAuthHeaders());
  }

  getDailyPowerSrcDistDataTime(data: any){
    return this.http.post(this.baseUrl + 'getDailyPowerSrcDistDataTime/', data,this.getAuthHeaders());
  }

  getHourlyPowerSrcDistDataTime(data: any){
    return this.http.post(this.baseUrl + 'getHourlyPowerSrcDistDataTime/', data,this.getAuthHeaders());
  }

  getHourlyPowerSrcDistData(data:any){
    return this.http.post(this.baseUrl + 'getHourlyPowerSrcDistData/', data,this.getAuthHeaders());
  }
  fetchBaselineData(data:any){
    return this.http.post(this.baseUrl + 'fetchBaseline/', data,this.getAuthHeaders())
  }
  saveBaselineData(data:any){
    return this.http.post(this.baseUrl + 'saveBaseline/', data,this.getAuthHeaders())
  }
  switchSiteDashboardApi(data:any){
    return this.http.post(this.baseUrl+"switchSiteDashboard/",data,this.getAuthHeaders());
  }
//Here is implementation of sucess and error msgs

  config: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top'
  }


  success(msg) {
    this.config['panelClass'] = ['notification', 'success'];
    this.snackBar.open(msg, '',this.config);
  }

  warn(msg) {
    this.config['panelClass'] = ['notification', 'warn'];
    this.snackBar.open(msg, '', this.config);
  }
  switchSiteDashboard(data:any){
  return this.http.post(this.baseUrl+"switchSiteDashboard/",data,this.getAuthHeaders());
  }

  saveInventoryData(data:any){
    return this.http.post(this.baseUrl+"saveInventoryData/", data,this.getAuthHeaders())
  }
  editInventoryData(data:any){
    return this.http.post(this.baseUrl+'editInventoryData/', data,this.getAuthHeaders())
  }

  deleteInventoryData(data:any){
    return this.http.post(this.baseUrl+'deleteInventoryData/', data,this.getAuthHeaders())
  }

  fireDevicefetchdata(data:any){
    return this.http.post(this.baseUrl+'fireDevicefetchdata/',data,this.getAuthHeaders())
  }
  fetchfireDeviceTypeData(data:any){
    return this.http.post(this.baseUrl+'fireDeviceTypefetch/',data,this.getAuthHeaders())
  }
  fireDeviceTypeAdd(data:any){
    return this.http.post(this.baseUrl+'fireDeviceTypeAdd/',data,this.getAuthHeaders())
  }
  fireDeviceSnapshotApi(data:any){
    return this.http.post(this.baseUrl+'snapShotApi/',data,this.getAuthHeaders())
  }
  lightsData(data:any){
    return this.http.post(this.baseUrl+'lightsDataApi/',data,this.getAuthHeaders())
  }
  fansData(data:any){
    return this.http.post(this.baseUrl + 'FansDataApi/',data,this.getAuthHeaders())
  }
  expiredDeviceslist(data:any){
    return this.http.post(this.baseUrl + 'expireddevicesList/',data,this.getAuthHeaders())  
  }
  avgDataValue(data:any){
    return this.http.post(this.baseUrl + 'avgData/',data,this.getAuthHeaders())
  }
  excelDataValue(data:any){
    return this.http.post(this.baseUrl + 'DownloadExcel/',data,{observe:"response",responseType:"blob"})
  }

  load_live_graph(data:any){
    return this.http.post(this.baseUrl+"liveDataLoadGraph/", data, this.getAuthHeaders())
  }


  load_graph_every_sec(data:any){
    return this.http.post(this.baseUrl+"liveDataEverySecond/", data, this.getAuthHeaders())
  }

  //new load every sec api
  new_load_data_sec(data: any){
    return this.http.post(this.baseUrl+"liveLoadData/test", data, this.getAuthHeaders())
  }

  hourly_load_graph(data:any){
    return this.http.post(this.baseUrl+"loadDataPowerSource/test", data, this.getAuthHeaders())
  }

  daily_load_graph(data:any){
    return this.http.post(this.baseUrl+"dailyLoadGraph/", data, this.getAuthHeaders())
  }

  mains_dg_daily_load_graph(data:any){
    return this.http.post(this.baseUrl+"loadDataMainsDgDaily/", data, this.getAuthHeaders())
  }

  download_excel_load_data(data:any){
    const token = localStorage.getItem('token');
    const httpHeaders = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token});
    return this.http.post(this.baseUrl+"downloadExcelLoadData/", data, {observe:"response",responseType:"blob", headers:httpHeaders})
  }

  fetch_power_factor_fluctuation_data(data:any){
    return this.http.post(this.baseUrl+"fluctuatedPowerFactorData/", data, this.getAuthHeaders())
  }

  monthly_min_max_load_data(data:any){
    return this.http.post(this.baseUrl + 'monthlyMinMaxLoadData/', data, this.getAuthHeaders())
  }

  exportPFFluctuationData(data:any){
    const token = localStorage.getItem('token');
    const httpHeaders = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token});
    return this.http.post(this.baseUrl+"downloadExcelPFData/", data, {observe:"response",responseType:"blob", headers:httpHeaders})
  }

  exportMonthlyMinMaxData(data:any){
    const token = localStorage.getItem('token');
    const httpHeaders = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token});
    return this.http.post(this.baseUrl+"downloadExcelMonthlyMinMaxData/", data, {observe:"response",responseType:"blob", headers:httpHeaders})
  }

  dgFuelConsumptionData(data:any){
    return this.http.post(this.baseUrl+"dgFuelConsumptionData/", data, this.getAuthHeaders())
  }

  fetchDGFuelDataCustomeRange(data:any){
    return this.http.post(this.baseUrl + "fetchDGFuelDataCustomeRange/", data, this.getAuthHeaders());
  }
  dgFuelConsumptionMonthlyTrend(data:any){
    return this.http.post(this.baseUrl + "dgFuelMonthlyTrend/", data, this.getAuthHeaders());

  }

  dgFuelExcelExport(data:any){
    const token = localStorage.getItem('token');
    const httpHeaders = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token});
    return this.http.post(this.baseUrl+ "dgFuelDataExcelExport/", data, {observe:"response",responseType:"blob", headers:httpHeaders})
  }
}
