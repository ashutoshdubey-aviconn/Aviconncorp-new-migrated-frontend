import { Component, OnInit } from '@angular/core';
import { Inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormControl,Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { SHARED_MAT_MODULES } from '../shared/material-imports';
import { DataService } from '../services/data.service';
import { LoggerService } from '../services/logger.service';

export interface DialogData {
  serialNo: string;
  deviceName: string;
  category: string;

}



@Component({
  selector: 'app-add-devtype-dialog',
  templateUrl: './add-devtype-dialog.component.html',
  styleUrls: ['./add-devtype-dialog.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ...SHARED_MAT_MODULES]
})

export class AddDevtypeDialogComponent implements OnInit {

  constructor(public dialog: MatDialog, public dialogRef: MatDialogRef<AddDevtypeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private dataService:DataService, private logger: LoggerService) { }
     
      siteId= localStorage.getItem('siteId');
     
      devTypeDataForm = new UntypedFormGroup({
      deviceName: new UntypedFormControl(''),
      category: new UntypedFormControl(''),

    });

  
  ngOnInit() {
    if (this.data) {
      // patchValue so missing fields won't break tests
      this.devTypeDataForm.patchValue({
        deviceName: this.data.deviceName,
        category: this.data.category,
      });
    }

  }
  
  onSubmitDevType(){
   let data = {"siteId":this.siteId,"deviceName":['deviceName'],"category":['category'],}
    this.logger.log("This is a site id:",data);
    this.dataService.fireDeviceTypeAdd(this.devTypeDataForm.value).subscribe(
      response =>{
        this.logger.log("response : ", response)
      }
    )
    this.dataService.success('Device type saved successfully !');
    this.dialogRef.close();
    
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
