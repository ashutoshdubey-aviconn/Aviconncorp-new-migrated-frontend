import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SHARED_MAT_MODULES } from '../shared/material-imports';

@Component({
    selector: 'app-dialog-over',
    templateUrl: './dialog-over.component.html',
    styleUrls: ['./dialog-over.component.css'],
  standalone: true,
  imports: [CommonModule, ...SHARED_MAT_MODULES]
})
export class DialogOverComponent implements OnInit {
  loginerror:string;
  
  constructor(public dialogRef: MatDialogRef<DialogOverComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      this.loginerror = data;
    }

  ngOnInit() {
  }

}
