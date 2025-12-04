import { Component, OnInit ,Inject ,ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DataService } from './../services/data.service';
import { LoggerService } from '../services/logger.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SHARED_MAT_MODULES } from '../shared/material-imports';


export class DialogData{

}

@Component({
    selector: 'app-dialog-switchdash',
    templateUrl: './dialog-switchdash.component.html',
    styleUrls: ['./dialog-switchdash.component.css'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, ...SHARED_MAT_MODULES]
})
export class DialogSwitchdashComponent implements OnInit {
  dataSource: MatTableDataSource<UserData>; //mandeep
  tableData:any;
  myObj = JSON.parse(localStorage.getItem("account"));
  user_id = this.myObj["id"];
  user_type = this.myObj["UserType"];
  siteId;
  


  constructor(private dataService:DataService,
    public dialogRef: MatDialogRef<DialogSwitchdashComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private logger: LoggerService) {

      this.siteId = localStorage.getItem('siteId');
    }

  onNoClick(): void {
    this.dialogRef.close();
  }


  ngOnInit() {
    this.getCustomerSiteLists();
  }



displayedColumns = ['siteid', 'sitename','sitetype'];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

   applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  getCustomerSiteLists(){
    if(this.user_type == 1){
      let current_customer = localStorage.getItem('id')
      this.logger.log("current customer: ", current_customer)
      this.data = {'customer_id':current_customer,'site_id':this.siteId};
    }else{
      this.data = {'customer_id':this.user_id,'site_id':this.siteId};
    }
    
    this.logger.log('site id in switch dashboard function',this.siteId);
    this.logger.log("user_id",this.user_id)
    this.dataService.switchSiteDashboardApi(this.data).subscribe(
      response => {
        let sites=[];
        for (let i = 0; i <= response['data'].length-1; i++) { /*users.push(createNewUser(i));*/
          let data = response['data'][i];

          let TypeOfSite;
          let site_type = data['site_type']
          if (site_type == '1'){
              TypeOfSite = 'WH METERING'
          }
          else if(site_type == '2'){
            TypeOfSite = 'WH_ENERGY SAVING'
          }
          sites.push({"siteid" : data['id'],
                      "sitename":data['site_name'],
                      'sitetype': TypeOfSite,
                      });
        
        }
     
        //userData.push(users1);
        this.dataSource = new MatTableDataSource(sites);
        this.logger.log(this.dataSource);
        this.logger.log('This is site data source:', this.dataSource);
        this.dataSource.paginator = this.paginator;  //mandeep
        this.dataSource.sort = this.sort;  //mandeep
        
      },
      error => {}
    );
  }
//Onclick function for switching a dashboard
  switchSiteDashboard(row: any): void {
    let siteType = row.sitetype;
    this.logger.log("site type$$$$", siteType)
    let siteId = row.siteid;
    let siteName = row.sitename;
    
    localStorage.removeItem("energy_saving")
    localStorage.removeItem("siteId");
    localStorage.removeItem("sitename")
     localStorage.setItem('siteId', siteId)
     localStorage.setItem("sitename", siteName)
     if (localStorage.getItem("wh_metering")){
      localStorage.removeItem("wh_metering");
     }
    if(siteType == "WH METERING")
    {
     
      localStorage.setItem("wh_metering", 'false');
      localStorage.removeItem("wh_metering");
      this.dataService.changeMessage("wh_metering");
      localStorage.setItem("wh_metering", 'true');
      
      

    }
    else if(siteType == "WH_ENERGY SAVING")
    {
      this.dataService.changeMessage("energy_saving");
      localStorage.setItem("energy_saving", 'true');
      

    }
    this.onNoClick();
  }

}
export interface UserData {
  siteid: string;
  sitename: string;
  sitetype: string;
}

