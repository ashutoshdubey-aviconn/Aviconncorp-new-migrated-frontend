import { Component, OnInit } from '@angular/core';
import { Inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SHARED_MAT_MODULES } from '../shared/material-imports';
import { DataService } from '../services/data.service';
import { LoggerService } from '../services/logger.service';
export interface DialogData {
  animal: string;
  name: string;
}



@Component({
  selector: 'app-fems-dialog',
  templateUrl: './fems-dialog.component.html',
  styleUrls: ['./fems-dialog.component.css'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, ...SHARED_MAT_MODULES]
})
export class FemsDialogComponent implements OnInit {
  // animal: string;
  // name: string;
 

  constructor(public dialog: MatDialog, public dialogRef: MatDialogRef<FemsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private DataService:DataService, private logger: LoggerService) {
      
     }

  

  ngOnInit() {
  }

  deleteRecord(){
    this.logger.log("##################", this.data)
      this.DataService.deleteInventoryData(this.data).subscribe(
    response =>{
      this.logger.log("response : ", response);
      this.dialogRef.close();
    }
  )
    

  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  

}

