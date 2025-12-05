import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SHARED_MAT_MODULES } from '../shared/material-imports';

@Component({
    selector: 'app-coming-dash',
    templateUrl: './coming-dash.component.html',
    styleUrls: ['./coming-dash.component.css'],
  standalone: true,
  imports: [CommonModule, ...SHARED_MAT_MODULES]
})
export class ComingDashComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
