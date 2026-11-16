import { Component, OnInit } from '@angular/core';
import { UserService } from './../services/user.service';

import { HighchartsStandaloneComponent } from '../highcharts/highcharts-standalone.component';
import { SHARED_MAT_MODULES } from '../shared/material-imports';
// Defer loading Highcharts modules to runtime via dynamic import() to avoid
// top-level require() which breaks AOT/type-checking and tests.

@Component({
    selector: 'app-output-graph',
    templateUrl: './output-graph.component.html',
    styleUrls: ['./output-graph.component.css'],
  standalone: true,
  imports: [HighchartsStandaloneComponent, ...SHARED_MAT_MODULES]
})
export class OutputGraphComponent implements OnInit {
  lineChartOptions: any;
  siteId = 90;
  // Pass module functions to the wrapper (loaded at runtime)
  hcModules: Array<any> = [];
  // Simple toggle to force the wrapper to call update
  chartUpdateFlag = false;

  constructor(private UserService: UserService,) {
    // Load Highcharts modules at runtime to avoid top-level require() and
    // to keep tests from failing when Highcharts is stubbed.
    (async () => {
      try {
  const modBoost = await import('highcharts/es-modules/masters/modules/boost.src.js');
  const modNoData = await import('highcharts/es-modules/masters/modules/no-data-to-display.src.js');
  const modMore = await import('highcharts/es-modules/masters/highcharts-more.src.js');

        const unwrap = (m: any) => (m && (m.default || m)) || m;
        const Boost = unwrap(modBoost);
        const noData = unwrap(modNoData);
        const More = unwrap(modMore);

        this.hcModules = [Boost, noData, More].filter(Boolean);
      } catch (e) {
        // ignore: tests or environments may not resolve these modules
        this.hcModules = [];
      }
    })();
  }

  ngOnInit() {
    this.getMonthlyTrend();
  }

  getMonthlyTrend(){

  let data1 = {'site_id': this.siteId};
  this.UserService.energySavingMonthlyTrend(data1).subscribe(
    response =>{
      let seriesData = [];
        for(let k = 0; k < response['Data'].length; k++)
          { 

            let energyConsumed:any;
             energyConsumed = {"name":"energyConsumed",'y':response['Data'][k]['energy_consumed']}
            let enegySaved = {"name":"energySaved",'y':response['Data'][k]['energy_saved']}
            let percentageSaved = {"name": "percentageSaved",'type':'spline','y':response['Data'][k]['percentage_saved']}
            
           
            let data2 = [{"data":[energyConsumed, enegySaved, percentageSaved]}]
            seriesData.push(data2);
          }

    // Compose options for the standalone wrapper
    this.lineChartOptions = {
      colorCount:'4',
      colors: ['#90ED7D','#ff7a01', '#7cb5ec', '#058DC7'],
      chart: {
        type: "spline",
        backgroundColor: "#222222",
        
        overflow:'scroll'
      },
    title: {
                style : {
                  color: 'white',
                },
                text: 'Snapshot Monthly Trend'
              },
      credits: {
        enabled: false
      },
      xAxis: {
        labels: {
          style: {
            color: 'white',
          },
        },
        categories: response['months']
      },
      yAxis: {
        title: {
          style: {color:'white',},
          text: "Value"
        },
        labels : {
          style: {
            color:'white'
          }
        }
      },
      
    

      tooltip: {
        valueSuffix: ""
      },
      legend :{
        itemStyle : {color:'white',},
      },
  series:  seriesData 
    };

    // toggle update flag so the wrapper updates (or creates) the chart
    this.chartUpdateFlag = !this.chartUpdateFlag;
    console.log("graph data", this.lineChartOptions);
    });

}
  }
