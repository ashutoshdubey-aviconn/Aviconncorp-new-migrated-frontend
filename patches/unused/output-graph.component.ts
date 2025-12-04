import { Component, OnInit } from '@angular/core';
import { UserService } from './../services/user.service';
import { CommonModule } from '@angular/common';
import { HighchartsStandaloneComponent } from '../highcharts/highcharts-standalone.component';
import { SHARED_MAT_MODULES } from '../shared/material-imports';

@Component({
    selector: 'app-output-graph',
    templateUrl: './output-graph.component.html',
    styleUrls: ['./output-graph.component.css'],
  standalone: true,
  imports: [CommonModule, HighchartsStandaloneComponent, ...SHARED_MAT_MODULES]
})
export class OutputGraphComponent implements OnInit {
  lineChartOptions: any;
  siteId = 90;
  hcModules: Array<any> = [];
  chartUpdateFlag = false;

  constructor(private UserService: UserService,) { }

  ngOnInit() {
    this.getMonthlyTrend();
  }

  getMonthlyTrend(){
    // original implementation archived
  }
}
