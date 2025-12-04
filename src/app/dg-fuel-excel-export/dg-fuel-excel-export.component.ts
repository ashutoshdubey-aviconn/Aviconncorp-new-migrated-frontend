import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Inject} from '@angular/core';
import { DataService } from '../services/data.service';
import { LoggerService } from '../services/logger.service';
import { SHARED_MAT_MODULES } from '../shared/material-imports';

export interface DialogData {

  from_date: string;
  till_date: string;
 
}

@Component({
  selector: 'app-dg-fuel-excel-export',
  templateUrl: './dg-fuel-excel-export.component.html',
  styleUrls: ['./dg-fuel-excel-export.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, ...SHARED_MAT_MODULES]
})
export class DgFuelExcelExportComponent implements OnInit {

  myObj = JSON.parse(localStorage.getItem("account"));
  user_id = this.myObj["id"];
  user_type = this.myObj["UserType"];

  constructor(public dialog: MatDialog, public dialogRef: MatDialogRef<DgFuelExcelExportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private dataService:DataService, private logger: LoggerService) { }

    siteId= localStorage.getItem('siteId');
    date = new UntypedFormControl(new Date());
    serializedDate = new UntypedFormControl((new Date()).toISOString().substring(0,10));
    
      excelDataForm = new UntypedFormGroup({
      startDate: new UntypedFormControl(''),
      endDate: new UntypedFormControl(''),

    });

  ngOnInit() {
  }

  onSubmit(){
    let data = {"site_id":this.siteId,"start_date":this.excelDataForm.value.startDate,"end_date":this.excelDataForm.value.endDate,}
    this.logger.log("function called", this.excelDataForm.value);
    this.dataService.showLoader();
    this.dataService.dgFuelExcelExport(data).subscribe(
      (response:any) =>{
        this.logger.log("response : ", response)
        let date = new Date().getDate().toString()+'-'+ new Date().toLocaleDateString("en-US", { month: 'short' })  + '-' + new Date().getFullYear().toString();
        this.logger.log("date : ",date)
        let blob:Blob=response.body as Blob;
        var downloadURL = window.URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = ("Report DG Fuel & Unit Trend_"+date+ ".xlsx")
        link.click();
        this.dialogRef.close();
        this.dataService.hideLoader()
        
        
      }
    )
  }


  onNoClick(): void {
    this.dialogRef.close();
  }

}
