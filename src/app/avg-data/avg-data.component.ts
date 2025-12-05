import { Component, OnInit } from '@angular/core';
import { Inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { SHARED_MAT_MODULES } from '../shared/material-imports';
import { DataService } from '../services/data.service';
import { LoggerService } from '../services/logger.service';
export interface DialogData {

     from_date: string;
     till_date: string;
     avgValue:string;
     energyConsumed:string;
}
@Component({
  selector: 'app-avg-data',
  templateUrl: './avg-data.component.html',
  styleUrls: ['./avg-data.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ...SHARED_MAT_MODULES]
})


export class AvgDataComponent implements OnInit {
  avgDatavalue: any;
  totalDatavalue: any;
  noofDays: any;
  constructor(public dialog: MatDialog, public dialogRef: MatDialogRef<AvgDataComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private dataService:DataService, private logger: LoggerService) { }

    siteId= localStorage.getItem('siteId');
    date = new UntypedFormControl(new Date());
    serializedDate = new UntypedFormControl((new Date()).toISOString().substring(0,10));

  
    avgDataForm = new UntypedFormGroup({
      startDate: new UntypedFormControl(''),
      endDate: new UntypedFormControl(''),
      avgvalue: new UntypedFormControl(''),
      totalvalue: new UntypedFormControl(''),
      noOfDays: new UntypedFormControl('')

    });
  ngOnInit() {
    this.logger.log("#################### I am in ngOnInit fuction: ", this.data);
    if (this.data) {
      // use patchValue so missing controls don't cause setValue to throw
      this.avgDataForm.patchValue({
        startDate: this.data.from_date ? this.data.from_date : "",
        endDate: this.data.till_date ? this.data.till_date : "",
        avgvalue: this.data.avgValue ? this.data.avgValue : "",
        // component historically used energyConsumed but form uses totalvalue; patchValue avoids strict mismatch
        totalvalue: this.data.energyConsumed ? this.data.energyConsumed : ""
      });
    }
    
  }
 
  
  onSubmit(){
    let data = {"siteId":this.siteId,"from_date":this.avgDataForm.value.startDate,"till_date":this.avgDataForm.value.endDate,}
    this.logger.log("function called", this.avgDataForm.value);
    this.dataService.avgDataValue(data).subscribe(
      response =>{
        this.logger.log("response : ", response)
        this.avgDatavalue = response['value'];
        this.totalDatavalue = response['energyConsumed'];
        this.noofDays = response['totalDays'];
        // Update the reactive form controls so the template bound to formControlName
        // reflects the newly fetched values. Use patchValue for resilience.
        try {
          this.avgDataForm.patchValue({
            avgvalue: response['value'] ?? this.avgDataForm.value.avgvalue,
            totalvalue: response['energyConsumed'] ?? this.avgDataForm.value.totalvalue,
            noOfDays: response['totalDays'] ?? this.avgDataForm.value.noOfDays
          });
        } catch (e) {
          this.logger.warn('AvgDataComponent: failed to patch form with response', e);
        }
      }
    )
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
