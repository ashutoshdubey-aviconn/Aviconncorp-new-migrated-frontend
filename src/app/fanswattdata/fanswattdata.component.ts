import { Component, OnInit ,Inject ,ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from './../services/data.service';
import { LoggerService } from '../services/logger.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { DataTableItem } from '../super-admin/data-table-datasource';
import { MatTable } from '@angular/material/table';
import { SHARED_MAT_MODULES } from '../shared/material-imports';
import { DialogData } from '../dialog-switchdash/dialog-switchdash.component';

@Component({
    selector: 'app-fanswattdata',
    templateUrl: './fanswattdata.component.html',
    styleUrls: ['./fanswattdata.component.css'],
  standalone: true,
  imports: [CommonModule, ...SHARED_MAT_MODULES]
})
export class FanswattdataComponent implements OnInit {
  dataSource: MatTableDataSource<UserData>; 
  tableData:any;
  myObj = JSON.parse(localStorage.getItem("account"));
  user_id = this.myObj["id"];
  user_type = this.myObj["UserType"];
  siteId;
  


  constructor(private dataService:DataService,
    public dialogRef: MatDialogRef<FanswattdataComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private logger: LoggerService) {

      this.siteId = localStorage.getItem('siteId');
    }

  onNoClick(): void {
    this.dialogRef.close();
  }


  ngOnInit() {
    this.siteId = localStorage.getItem('siteId');
    this.fansData()
    
  }




displayedColumns = ['area', 'totalfans','Watt80','Watt100','totalWattLoad','totalUnits'];

@ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
@ViewChildren(MatSort) sort = new QueryList<MatSort>();
@ViewChild(MatTable, { static: true }) table: MatTable<DataTableItem>;
   applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
  
  fansData(){
    this.logger.log('site id in switch dashboard function',this.siteId);
    this.dataService.fansData(this.data).subscribe(
      response => {
        let lightsData = []
        for (let i = 0; i <= response['data'].length-1; i++){
          let data = response['data'][i]
          lightsData.push({"areaName": data['areaName'],
            "totalFans": data["totalFans"],
            "watt80":data["80watt"],
            "watt100":data["100watt"],
            "totalWattFans":data["totalWattFans"],
            "totalUnits":data["totalUnits"],
          })
        }
        this.dataSource = new MatTableDataSource(lightsData);
        this.dataSource.sort = this.sort.toArray()[0];
      }
    )

  }
}
export interface UserData {
  aisles: string;
  Watt18: string;
  Watt20:string;
  Watt24:string;
  Watt36:string;
  Watt40:string;
  totalWattLoad:string;
  totalUnits:string;
  totalWatts: string;
}

