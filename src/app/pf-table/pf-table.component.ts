import { Component, OnInit ,Inject ,ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from './../services/data.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { DataTableItem } from '../super-admin/data-table-datasource';
import { MatTable } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { SHARED_MAT_MODULES } from '../shared/material-imports';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { formatDate } from '@angular/common';
import { LoggerService } from '../services/logger.service';


export class DialogData{

}

@Component({
  selector: 'app-pf-table',
  templateUrl: './pf-table.component.html',
  styleUrls: ['./pf-table.component.css'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule, MatFormFieldModule, MatInputModule, ...SHARED_MAT_MODULES]
})
export class PfTableComponent implements OnInit {
  dataSource: MatTableDataSource<UserData>; 
  tableData:any;
  myObj = JSON.parse(localStorage.getItem("account"));
  user_id = this.myObj["id"];
  user_type = this.myObj["UserType"];
  siteId;
  displayedColumns = ['datetime','power_source', 'R_Phase','Y_Phase','B_Phase'];

@ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
@ViewChildren(MatSort) sort = new QueryList<MatSort>();
@ViewChild(MatTable, { static: true }) table: MatTable<DataTableItem>;
   applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  constructor(private dataService:DataService,
    public dialogRef: MatDialogRef<PfTableComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private logger: LoggerService) { 
      this.siteId = localStorage.getItem('siteId');
    }

  ngOnInit() {
    this.fetch_power_factor_fluctuation_data()
    this.siteId = localStorage.getItem('siteId');
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  fetch_power_factor_fluctuation_data(){
    let data = {'site_id': this.siteId};
    this.dataService.fetch_power_factor_fluctuation_data(data).subscribe(
      response => {
        this.logger.log("res of pf table : ",response)
        let pfData = []
        for (let i = 0; i <= response['data'].length-1; i++){
          let data = response['data'][i]
          pfData.push({"datetime": data['created'],
            "power_source": data["power_source"],
            "r_phase":data["r_phase"],
            "y_phase":data["y_phase"],
            "b_phase":data["b_phase"],
          
          })
        }
        this.dataSource = new MatTableDataSource(pfData);
        this.dataSource.paginator = this.paginator.toArray()[0];
        this.dataSource.sort = this.sort.toArray()[0];
      }
    )

  }

  exportPFFluctuationData(){
    let data = {"site_id": this.siteId}
    this.dataService.exportPFFluctuationData(data).subscribe(
        (response:any) =>{
            this.logger.log("response: ", response);
            let current_date = formatDate(new Date(), 'yyyy/MM/dd', 'en')
            let blob:Blob=response.body as Blob;
            var downloadURL = window.URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.href = downloadURL;
            link.download = ("power_factor_data_"+current_date+ ".csv")
            link.click();
        }
    )
    this.dialogRef.close();
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
