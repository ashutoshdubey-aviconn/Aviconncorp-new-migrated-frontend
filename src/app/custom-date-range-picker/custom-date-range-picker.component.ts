import { Component, OnInit } from '@angular/core';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Inject} from '@angular/core';
import { DataService } from '../services/data.service';
export interface DialogData {

  from_date: string;
  till_date: string;
 
}
@Component({
  selector: 'app-custom-date-range-picker',
  templateUrl: './custom-date-range-picker.component.html',
  styleUrls: ['./custom-date-range-picker.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule, MatButtonModule]
})
export class CustomDateRangePickerComponent implements OnInit {

  constructor(public dialog: MatDialog, public dialogRef: MatDialogRef<CustomDateRangePickerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private dataService:DataService,) { }


    date = new UntypedFormControl(new Date());
    serializedDate = new UntypedFormControl((new Date()).toISOString().substring(0,10));
    siteId= localStorage.getItem('siteId');
    customDateRange = new UntypedFormGroup({
      startDate: new UntypedFormControl(''),
      endDate: new UntypedFormControl(''),
    });
  ngOnInit() {
  }

  onSubmit(){

    let reqData = [{"from_date":this.customDateRange.value.startDate,"end_date":this.customDateRange.value.endDate}]
    this.dialogRef.close(reqData)
  }
  onNoClick(){
    this.dialogRef.close([])
  }
}
