import { from } from 'rxjs';
import { DataService } from './../services/data.service';
import { Album } from './../models/user';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormArray, UntypedFormControl } from '@angular/forms';
import { UserService } from './../services/user.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { HighchartsStandaloneComponent } from '../highcharts/highcharts-standalone.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSlideToggleChange, MatSlideToggle } from '@angular/material/slide-toggle';
import { MovieService } from '../services/movie.service';
// Prefer the ESM masters entrypoint to avoid CommonJS optimization warnings
import Highcharts from 'highcharts/es-modules/masters/highcharts.src.js';
// Load the Solid Gauge module from the ESM masters path when needed
// solid gauge will be loaded at runtime in the constructor to avoid
// patching Highcharts during test bootstrap.
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatTableModule, MatPaginatorModule, MatSortModule, MatSlideToggleModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatDialogModule]
})
export class AdminComponent implements OnInit {
  show:Boolean = false;
  dataSource: MatTableDataSource<any>;
  checked:Boolean
  userData : UntypedFormGroup;
  date = new UntypedFormControl(new Date());
    serializedDate = new UntypedFormControl((new Date()).toISOString().substring(0, 10));
  displayedColumns = ['id', 'userId', 'title']
  // displayedColumns = ["custId","custUserName","custEmail"]
  form:UntypedFormGroup;
  data:UntypedFormGroup;
  showModal:Boolean=false;
  lineChartOptions:any;
  gaugeOptions:any;
  Highcharts = Highcharts;
  siteId;
  // SolidGaugeChart=SolidGaugeChart;
  constructor(private UserService:UserService,private dataService:DataService, private fb:UntypedFormBuilder, private album:MovieService) { 
    this.userData = this.fb.group({
      countryName: ['', Validators.required],
      stateName: [(''), Validators.required],
      cityName: [(''), Validators.required]
    });
    // Load Solid Gauge module at runtime and register with Highcharts.
    (async () => {
      try {
        const mod = await import('highcharts/es-modules/masters/modules/solid-gauge.src.js');
        const unwrap = (m: any) => (m && (m.default || m)) || m;
        const SolidGauge = unwrap(mod);
        if (typeof SolidGauge === 'function') {
          SolidGauge((Highcharts as any));
        }
      } catch (e) {
        // ignore failures in test or restricted environments
         
        console.warn('Failed to load Highcharts solid-gauge module', e);
      }
    })();
    
  }
  gaugeType = "full"
  gaugeValue = 39;
  gaugeLabel = "speed";
  gaugeAppendText = "km/h"
  gaugeThickness =20;
  gaugeColor = "#ffff";
  gaugeThresholds = {
    '0': {color:'green'},
    '40': {color:'orange'},
    '75':{color:'red'}
  };
  d ={"id":1}
  ngOnInit() {
    // this.getCustomers()
    this.form = this.fb.group({
      albums: this.fb.array([])
    });
    this.data = this.fb.group({
      firstName : ['', Validators.required],
      lastName : ["", Validators.required],
      options : ['', Validators.required],
      subject : ["", Validators.required]
    });
    //movie service
    this.album.getAllAsFormArray(this.d).subscribe(albums => {
      this.form.setControl('albums', albums);
    });
    this.dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA)
  }
  // displayedColumns = ['custUserName','custEmail',];
  Country:any = ["india", "usa", "russia"];
  State:any = ["haryana", "punjab"]
  City:any = ["faridabad","amritsar"]
  option=["option1", "option2", "option3"]

 

  get albums(): UntypedFormArray {
    return this.form.get('albums') as UntypedFormArray;
  }
  submit(){
    let data = {"data": this.form.value}
    this.dataService.data(data).subscribe(
      response=>{
        let result = response["result"]
        console.log("submit data result: ", result)
      }
    )
    console.log("data is:- ",this.form.value)
  }
  // On user change I clear the title of that album 
  onUserChange(event, album: UntypedFormGroup) {
    const title = album.get('title');
  
    title.setValue(null);
    title.markAsUntouched();
    // Notice the ngIf at the title cell definition. The user with id 3 can't set the title of the albums
  }
  onClick(){
   console.log("dataa :> ", this.data.value) 
   this.data.reset()
  }
 

  onChange(ob: MatSlideToggleChange, id,date) {
    console.log("toggle changed")
    console.log(ob.checked);
    console.log(id)
    console.log(formatDate(date,'yyyy/MM/dd','en'))
  } 

  edit(row){
    console.log("edited data :- ", row)
    this.showModal = true;
  }
  hide(){
    this.showModal=false;
  }
  columnGraphFilterChanged(){
    
  }

getCustomers(){
  this.UserService.getAllCustomers().subscribe(
    response =>{
      console.log('response', response)
      let customer=[];
        for (let i = 0; i <= response['data'].length-1; i++) {
          let data = response['data'][i];
          console.log("data", data)
          let customer_details = data['customer'];
          let customer_id = customer_details['id'];
          let customer_username = customer_details['username'];
          let customer_email = customer_details['email'];
          let customer_contact = customer_details['Contact_number'];
          customer.push({
            'custId': customer_id,
            'custUserName': customer_username,
            'custEmail' : customer_email,
            'custContact': customer_contact
          })
        }
      
        this.dataSource = new MatTableDataSource(customer);
        console.log(this.dataSource);
        console.log('This is site data source'+ ": " + this.dataSource);
   
      
    }
  )
}


getAlarmGraph(){
  let data1 = {'site_id': this.siteId};
  this.UserService.getCustAlarmGraphData(data1).subscribe(
    response =>{
    this.lineChartOptions = {
      colorCount:'4',
      colors: ['#90ED7D','#ff7a01', '#7cb5ec', '#058DC7'],
      chart: {
        type: "spline",
        backgroundColor: "#222222",
        
        overflow:'scroll'
      },
    title: {
                style : {
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
      yAxis: {
        title: {
          style: {color:'white',},
          text: "Value"
        },
        labels : {
          style: {
            color:'white'
          }
        }
      },
      
    

      tooltip: {
        valueSuffix: ""
      },
      legend :{
        itemStyle : {color:'white',},
      },
      series:  
        
        {
          name: 'Energy Consumed',
          data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
        },
    }  


});

}





}

export interface PeriodicElement {
  id:Number;
  userId:string;
  title:string;
}
const ELEMENT_DATA: PeriodicElement[] = [
  {id: 1, 
    userId: 'Hydrogen', 
    title:''},
  {id: 2, 
    userId: 'helium', 
    title:''}

];







