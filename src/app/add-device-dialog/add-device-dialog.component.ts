import { Component, OnInit } from '@angular/core';
import { Inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { SHARED_MAT_MODULES } from '../shared/material-imports';
import { DataService } from '../services/data.service';
import { LoggerService } from '../services/logger.service';
import {formatDate, getLocaleDayNames} from '@angular/common';
import { FemsComponent } from '../fems/fems.component';
import { NgModule } from '@angular/core';


export interface DialogData {
  id: string,
  serialNo: string;
  deviceName: string;
  assetNo:string;
  modelno: string;
  location: string;
  warrenty: string;
  last_service: string;
  next_service: string;
  updatedBy: string;
}

@Component({
  selector: 'app-add-device-dialog',
  templateUrl: './add-device-dialog.component.html',
  styleUrls: ['./add-device-dialog.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ...SHARED_MAT_MODULES]
})
export class AddDeviceDialogComponent implements OnInit {
  constructor(public dialog: MatDialog, public dialogRef: MatDialogRef<AddDeviceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private dataService:DataService, private logger: LoggerService) { }

    siteId= localStorage.getItem('siteId');
    date = new UntypedFormControl(new Date());
    serializedDate = new UntypedFormControl((new Date()).toISOString().substring(0,10));

  
    inventoryDataForm = new UntypedFormGroup({
      deviceId: new UntypedFormControl(''),
      deviceAssetNo: new UntypedFormControl(''),
      deviceName: new UntypedFormControl(''),
      deviceModelNo: new UntypedFormControl(''),
      location: new UntypedFormControl(''),
      warrantyTillDate: new UntypedFormControl(''),
      nextServiceDate: new UntypedFormControl(''),
      lastServiceDate: new UntypedFormControl(''),
      updatedBy: new UntypedFormControl('')

    });
  ngOnInit() {
    this.logger.log("#################### I am in ngOnInit fuction: ", this.data);
    this.getDeviceName();
    if (this.data) {
      // patchValue so tests with undefined MAT_DIALOG_DATA don't fail
      this.inventoryDataForm.patchValue({
        deviceId: this.data.id ? this.data.id : "",
        deviceName: this.data.deviceName ? this.data.deviceName : "",
        deviceAssetNo: this.data.assetNo ? this.data.assetNo : "",
        deviceModelNo: this.data.modelno ? this.data.modelno : "",
        location: this.data.location ? this.data.location : "",
        warrantyTillDate: this.data.warrenty ? this.data.warrenty : "",
        nextServiceDate: this.data.next_service ? this.data.next_service : "",
        lastServiceDate: this.data.last_service ? this.data.last_service : "",
        updatedBy: this.data.updatedBy ? this.data.updatedBy : "",
      });
    }

  }
 

    getDeviceName(){
      
    return localStorage.getItem('devName');
  }


  
  onSubmit(){
    
    let row_id = localStorage.getItem('row_id'); 
    this.logger.log("row id in add device fuction", row_id);
    let data = {"id":this.inventoryDataForm.value.deviceId,"row_id":row_id,"deviceName":this.inventoryDataForm.value.deviceName,"assetNo":this.inventoryDataForm.value.deviceAssetNo,"updated_by":this.inventoryDataForm.value.updatedBy,"modelNo":this.inventoryDataForm.value.deviceModelNo,"location":this.inventoryDataForm.value.location,"warrenty":this.inventoryDataForm.value.warrantyTillDate,"last_service":this.inventoryDataForm.value.lastServiceDate,"next_service":this.inventoryDataForm.value.nextServiceDate}
    this.logger.log("This is a site id:",data);
     this.logger.log("function called", this.inventoryDataForm.value);
    this.dataService.saveInventoryData(data).subscribe(
      response =>{
        this.logger.log("response : ", response)
      }
    )
    this.dataService.success('Device saved successfully !');
    this.dialogRef.close();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
