import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src.js';
import { HighchartsStandaloneComponent } from '../highcharts/highcharts-standalone.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DataService } from '../services/data.service';
import { LoggerService } from '../services/logger.service';
import { Observable } from 'rxjs';
import { SHARED_MAT_MODULES } from '../shared/material-imports';


@Component({
  selector: 'app-load-graph',
  templateUrl: './load-graph.component.html',
  styleUrls: ['./load-graph.component.css'],
  standalone: true,
  imports: [CommonModule, HighchartsStandaloneComponent, MatProgressSpinnerModule, ...SHARED_MAT_MODULES]
})
export class LoadGraphComponent implements OnInit {
  lineChartOptions:any;
  Highcharts = Highcharts;
  chartLoading:Boolean=false;
  @ViewChild('chart') chart;
  
  

  constructor(private dataService: DataService, private logger: LoggerService) { }

  ngOnInit() {
    this.load_graph();
    this.logger.log("############################");
  }

  randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
  
  load_data_every_second(){
    this.logger.log("load function called")
    this.dataService.load_graph_every_sec({}).subscribe(
      res=>{
        for (let i = 0; i <= res['data'].length-1; i++){
          this.chart.chart.series[0].addPoint(res['data'][i], true, false)

        }
        
      }
    )
    // return response
  }

   load_graph(){
    let reqData = {"site_id": 35, "date":"2023/04/26"}
    this.dataService.dgFuelConsumptionData(reqData).subscribe(
      res=>{
        let dataSeries = res["data"]
        this.logger.log("api data: ", dataSeries)
        this.chartLoading=true;
        this.lineChartOptions = {
      
          chart: {
            type:"spline",
            scrollablePlotArea: {
              minWidth: 300,
              scrollPositionX: 1
          },
            zoomType:"x",
            
        },
        navigator: {
          enabled: true
      },
        scrollbar: {
          enabled: true
       },
    
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats:{
           day: '%d %b %Y'    //ex- 01 Jan 2016
          },
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true,
          labels: {
           rotation: -45,
           format: '{value:%Y-%m-%d %H:%M}',
         
          }
         },
        
    
        time: {
            useUTC: false
        },

        title: {
            text: 'Fuel Level Trend'
        },
        plotOptions: {
          series: {
            turboThreshold: 0,
          }
      },
    
        series: [{
            name: 'Fuel Consumption',
            data:dataSeries,
          
        },      ]
        }
      }
    )    
  }
}


