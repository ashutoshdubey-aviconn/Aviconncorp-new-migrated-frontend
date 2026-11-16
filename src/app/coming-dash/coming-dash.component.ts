import { Component, OnInit } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { SHARED_MAT_MODULES } from '../shared/material-imports';

@Component({
    selector: 'app-coming-dash',
    templateUrl: './coming-dash.component.html',
    styleUrls: ['./coming-dash.component.css'],
  standalone: true,
  imports: [MatCardModule, ...SHARED_MAT_MODULES]
})
export class ComingDashComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
