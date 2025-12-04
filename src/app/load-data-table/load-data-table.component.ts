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
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SHARED_MAT_MODULES } from '../shared/material-imports';
import { LoggerService } from '../services/logger.service';

export class DialogData{

}

@Component({
  selector: 'app-load-data-table',
  templateUrl: './load-data-table.component.html',
  styleUrls: ['./load-data-table.component.css'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule, MatFormFieldModule, MatInputModule, ...SHARED_MAT_MODULES]
})
export class LoadDataTableComponent implements OnInit {
  dataSource: MatTableDataSource<UserData>; 
  tableData:any;
  myObj = JSON.parse(localStorage.getItem("account"));
  user_id = this.myObj["id"];
  user_type = this.myObj["UserType"];
  siteId;
  displayedColumns = ['power_source','month','max_load_time', 'max_load_value','min_load_time','min_load_value'];

@ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
@ViewChildren(MatSort) sort = new QueryList<MatSort>();
@ViewChild(MatTable, { static: true }) table: MatTable<DataTableItem>;
   applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  constructor(private dataService:DataService,
    public dialogRef: MatDialogRef<LoadDataTableComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private logger: LoggerService) { 
      this.siteId = localStorage.getItem('siteId');
    }

  ngOnInit() {
    this.monthly_min_max_load_data()
    this.siteId = localStorage.getItem('siteId');
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  monthly_min_max_load_data(){
    let data = {'id': this.siteId};
    this.dataService.monthly_min_max_load_data(data).subscribe(
      response => {
        this.logger.log("res of load table : ",response)
        let loadData = []
        for (let i = 0; i <= response['data'].length-1; i++){
          let data = response['data'][i]
          loadData.push({
            "power_source": data["power_source"],
            "min_load":data["min_load"],
            "max_load":data["max_load"],
            "max_load_created":data["max_load_created"],
            "min_load_created": data['min_load_created'],
            "month": data["month"]
          
          })
        }
        this.dataSource = new MatTableDataSource(loadData);
        this.dataSource.paginator = this.paginator.toArray()[0];
        this.dataSource.sort = this.sort.toArray()[0];
      }
    )

  }

  exportMonthlyLoadData(){
    let data = {"site_id": this.siteId}
    this.dataService.exportMonthlyMinMaxData(data).subscribe(
        (response:any) =>{
          this.logger.log("response: ", response);
            let blob:Blob=response.body as Blob;
            var downloadURL = window.URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.href = downloadURL;
            link.download = ("monthly_load_data"+ ".csv")
            link.click();
        }
    )
    this.dialogRef.close();
  }

  
  

}
export interface UserData {

}

