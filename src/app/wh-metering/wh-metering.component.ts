import { Validators } from '@angular/forms';
//import { PieGraphComponent } from './../pie-graph/pie-graph.component';
import { SiteDetailsModel, LiveMeteringDataModel } from './../models/siteDataModel';
import { DataService } from './../services/data.service';
// import { DataTableItem, DataTableDataSource } from '../super-admin/data-table-datasource';
import { changePassword } from './../models/changepassword';
import { DashboardDataService } from './../services/dashboard-data.service';
// import { LoginComponent } from './../login/login.component';

import { UserService } from './../services/user.service';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// Note: removed use of internal throwMatDialogContentAlreadyAttachedError which is no longer exported
// from Angular Material in v16.
// Use ESM build of Highcharts to avoid CommonJS optimization warnings
import Highcharts from 'highcharts/es-modules/masters/highcharts.src.js';
//import {MatPaginator} from '@angular/material';
// import { MatSort } from '@angular/material/sort';
import { UntypedFormControl } from '@angular/forms';
import { Observable, interval, from } from 'rxjs';
import { formatDate, getLocaleDayNames } from '@angular/common';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { SHARED_MAT_MODULES } from '../shared/material-imports';
import { HighchartsStandaloneComponent } from '../highcharts/highcharts-standalone.component';
import { LoggerService } from '../services/logger.service';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { DialogSwitchdashComponent } from '../dialog-switchdash/dialog-switchdash.component';
// import * as solidGauge from 'highcharts/modules/solid-gauge.src';
// prefer calling Highcharts.chart via the Highcharts namespace imported above
// Defer loading Highcharts modules until runtime (constructor) so tests can
// stub Highcharts before modules attempt to patch it. Loading modules at
// top-level causes test-time errors because the library internals are not
// yet prepared.
import { ExcelsheetComponent } from '../excelsheet/excelsheet.component';
import { PfTableComponent } from '../pf-table/pf-table.component';
// import { LightsWattDataComponent } from '../lights-watt-data/lights-watt-data.component';
import { LoadDataTableComponent } from '../load-data-table/load-data-table.component';
import { CustomDateRangePickerComponent } from '../custom-date-range-picker/custom-date-range-picker.component';
import { DgFuelExcelExportComponent } from '../dg-fuel-excel-export/dg-fuel-excel-export.component';
// removed incorrect import from 'jquery' (was shadowing local variables)


export interface KeyValueIf {
    value: string;
    viewValue: string;
}


@Component({
    selector: 'app-wh-metering',
    templateUrl: './wh-metering.component.html',
    styleUrls: ['./wh-metering.component.css']
    //providers:[PieGraphComponent]
        ,
        standalone: true,
        imports: [
            CommonModule,
            ReactiveFormsModule,
            FormsModule,
                    // local Highcharts wrapper (standalone)
                    HighchartsStandaloneComponent,
                    ...SHARED_MAT_MODULES
        ]
})
export class WhMeteringComponent implements OnInit {

    myObj = JSON.parse(localStorage.getItem("account"));
    siteId = localStorage.getItem('siteId');
    user_id = this.myObj["id"];
    user_type = this.myObj["UserType"];
    minDate = new Date(2000, 0, 1);
    maxDate = new Date();
    dgfuelMinDate = new Date(2023, 3, 6)
    totalLoad: any;
    supply_source = "";
    // highCharts = HighCharts;
    applySelectFilter(event) {
        //alert(event.value);
        //data = event.value;
    }
    selected_load_options = "0";
    loadGraphintervals: KeyValueIf[] = [
        { value: '0', viewValue: 'DateWise' },
        { value: '1', viewValue: 'Daily' },
        { value: '2', viewValue: 'Monthly' },
        { value: '3', viewValue: 'Mains &DG' },
        { value: '4', viewValue: 'Live Data' },

    ];

    intervals: KeyValueIf[] = [
        { value: '0', viewValue: 'Daily' },
        { value: '1', viewValue: 'Hourly' }
    ];

    graphTypes: any = [
        { value: '0', viewValue: 'Energy Consumption' },
        { value: '1', viewValue: 'Mains/DG Run Percentage(Unit)' }
    ];

    selected_graph = '0';
    selected_task = '0';
    date = new UntypedFormControl(new Date());
    loadDate = new UntypedFormControl(new Date());
    dgFuelDate = new UntypedFormControl(new Date());
    serializedDate = new UntypedFormControl((new Date()).toISOString().substring(0, 10));
    whichGraph = 1;
    loadGraph: Boolean = true;
    seprateManinsDgLoad: Boolean = false;
    filterDate: string;
    picker1: Date;
    picker2: Date;


    /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
    //displayedColumns = ['id', 'name'];
    isCollapsed: boolean = true;
    color = 'primary';
    mode = 'determinate';
    value = 50;
    oldpwd: string;
    token = localStorage.getItem('token');
    chngpwd;
    isShown: boolean = false;
    userInfo: object[];
    customerInfo: object[];
    dates: object[];
    myData: object[];
    show_dg_mains_run_time: any;
    liveData = new LiveMeteringDataModel();
    loading = true;
    // legacy flag used throughout the code; we expose a getter/setter so older
    // assignments `this.updateFlag = true` will toggle the wrapper's update signal.
    private _updateFlag = false;
    updateLoadDataFlag: boolean = false;
    Highcharts = Highcharts;
    pieChart = Highcharts;
    // wrapper update toggle used by the standalone component
    chartUpdateFlag = false;
    // modules to pass into the standalone wrapper — populated in constructor
    hcModules: Array<any> = [];

    get updateFlag(): boolean { return this._updateFlag; }
    set updateFlag(val: boolean) {
        if (val) this.chartUpdateFlag = !this.chartUpdateFlag;
        this._updateFlag = val;
    }
    public pieChartOptions: any;
    barChartOptions: any;
    chartConstructor: string = 'chart';
    chartCallback: any = function(){};
    oneToOneFlag: boolean = true;
    barChartOptionsRunTime: any; // this is for run time graph
    unitConsumptionGraph: boolean = true;
    runTimeGraph: boolean = false
    graphTitle: string;
    graphYAxis: string;
    changePasswordModel = new changePassword(this.token, '', '');
    siteDetails = new SiteDetailsModel();
    dgFuelData: boolean = false;
    dgFuelConsumptionOptions: any;
    dgFuelDataSelectionChange: boolean = false;
    dgFuelConsumptionSelectionOptions: any;
    showFuelGraph: boolean = false;
    site_dash = false;
    customer_home = false;
    super_admin_home = false;
    customer_name = false;
    Admindata = false;
    infoToken; //variable decalration for token verfication
    sessionVerify; //for session verification
    baselineVisibility: boolean = false;
    showIntervalOptions: boolean = false;
    showLoadIntervalOptions: boolean = false;
    // pf_visible: boolean = false;
    pf_visible: any = localStorage.getItem('pf_visible');
    is_load_graph_visible: any = localStorage.getItem("is_load_graph_visible");
    dg_fuel_system_installed: any = localStorage.getItem("dg_fuel_system_installed");
    customer_visible_dg_fuel_data: any = localStorage.getItem("customer_visible_dg_fuel_data")
    is_hourly_data_visible: any = localStorage.getItem("is_hourly_data_visible")
    liveLoadApiCal: Boolean = false;
    lineChartOptions: any;
    lineChartOption: any;
    seprateManinsDgLoadChartOptions: any;
    // Highcharts = Highcharts;
    chartLoading: Boolean = false;
    @ViewChild('chart') chart;
    @ViewChild("loadChart") loadChart;

    // normalize series data to ensure numeric points and consistent shapes
    private normalizeSeries(inputSeries: any): any[] {
        if (!inputSeries) return [];
        return inputSeries.map(s => {
            if (s && Array.isArray(s.data)) {
                s.data = s.data.map(pt => {
                    if (Array.isArray(pt)) return [Number(pt[0]), Number(pt[1])];
                    if (pt && pt.x !== undefined) return [Number(pt.x), Number(pt.y)];
                    return pt;
                });
                return s;
            }
            if (s && s.data) {
                s.data = (s.data || []).map(pt => {
                    if (Array.isArray(pt)) return [Number(pt[0]), Number(pt[1])];
                    if (pt && pt.x !== undefined) return [Number(pt.x), Number(pt.y)];
                    return pt;
                });
                return s;
            }
            return s;
        });
    }



    //@ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(private dashData: DashboardDataService,
        private UserService: UserService,
        private DataService: DataService,
        private user_service: UserService,
        private router: Router,
        public dialog: MatDialog,
        private logger: LoggerService,
    ) {
                // Try to require Highcharts modules at runtime. Wrap in try/catch so
                // tests (which stub Highcharts) or environments without require don't
                // crash during module loading.
                // Try to dynamically import Highcharts modules at runtime. Using
                // dynamic `import()` avoids referring to `require` (which breaks
                // type checking for AOT builds) and keeps module loading lazy so
                // tests that stub Highcharts won't be patched prematurely.
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
                        // ignore failures during tests or in environments where
                        // dynamic import can't resolve the modules
                        this.hcModules = [];
                    }
                })();
        this.show_dg_mains_run_time = localStorage.getItem('show_dg_mains_run_time');
        if (this.show_dg_mains_run_time == "true") {
            this.graphTypes = [
                { value: '0', viewValue: 'Energy Consumption' },
                { value: '1', viewValue: 'Mains/DG Run Percentage(Unit)' },
                { value: '2', viewValue: 'Mains/DG Run Percentage(Time)' }
            ];
        }


    }

    

    ngOnInit() {
        const accountStr = localStorage.getItem("account");
        if (accountStr) {
            this.myObj = JSON.parse(accountStr);
            this.user_id = this.myObj["id"];
            this.user_type = this.myObj["UserType"];
        } else {
            this.logger.error("Account info missing — redirecting to login");
            this.router.navigate(['/login']);
        }
        // this.fetchDGCountFromAPI();
        // this.fetchDGOptions(this.siteIds);
        if (this.pf_visible == "true") {
            this.pf_visible = true;
        } else {
            this.pf_visible = false
        }
        //here is implementation of breadceumb...
        if (this.user_type == '1') {
            this.super_admin_home = true
            this.customer_home = false
            this.customer_name = true //false
            this.site_dash = true
            this.Admindata = true
            this.showIntervalOptions = true
            this.showLoadIntervalOptions = true;
        }
        else if (this.user_type == '4' || this.user_type == '5') {
            this.super_admin_home = false
            this.customer_home = true
            this.customer_name = false
            this.site_dash = true
            this.Admindata = false
            this.showLoadIntervalOptions = true;
            if (this.is_hourly_data_visible == 'true') {
                this.showIntervalOptions = true
            } else {
                this.showIntervalOptions = false;
            }
        }
        else {
            this.super_admin_home = false
            this.customer_home = true
            this.customer_name = false
            this.site_dash = true
            this.Admindata = false
        }
        /**
         * These functions need to be called whenever the page is loaded
         */
        // Get Site Details
        this.getSiteDetails();
        // Live data to be fetched every 5 sec
        // this.getDGInfo();
        this.getSiteCurrLoadInfoData();
        this.dgFuelMonthlyTrend();


        // Get Power source distribution data
        this.getPowerSourceDistData();
        // Highcharts.chart('chartcontainer',this.barChartOptions);
        this.isShown = true;
        this.logger.log("is_load_graph_visible: ", this.is_load_graph_visible)
        this.logger.log("is pf visible: ", this.pf_visible)
        // Set defaults
        this.selected_load_options = "0"; // datewise
        this.loadDate.setValue(new Date());

        // Wait until view is initialized so chart exists
        setTimeout(() => {
            this.loadGraphFilterChanged();
        }, 0);

        if (this.is_load_graph_visible == "true") {
            this.load_graph({}); // call with empty data object (previous accidental import created a global 'data')
        }
        this.logger.log("show fuel data: ", this.dg_fuel_system_installed)
        if (this.dg_fuel_system_installed == 'true') {
            this.logger.log("#########################", this.customer_visible_dg_fuel_data)
            if (this.user_type == '1') {
                this.showFuelGraph = true
                this.dgFuelConsumptionGraph()
            }
            else if (this.customer_visible_dg_fuel_data == 'true') {
                this.showFuelGraph = true
                this.dgFuelConsumptionGraph()
            }

        }
        // Consumption Graph data
        this.getConsumptionData();
    }


    ngAfterViewInit() {
        interval(15000).subscribe(
            response => {
                if (this.selected_load_options == "4" && this.liveLoadApiCal) {
                    this.load_data_every_second();
                }

            }
        );
        interval(5000).subscribe(
            response => {
                this.getSiteCurrLoadInfoData();
            });
    }

    dgFuelConsumptionGraph() {
        let todayDate = formatDate(this.dgFuelDate.value, 'yyyy/MM/dd', 'en');
        let reqData = { "site_id": this.siteId, "date": todayDate, "user_type": this.user_type }
        this.dgFuelDataSelectionChange = false;
        this.dgFuelData = true;
        this.DataService.dgFuelConsumptionData(reqData).subscribe(
            res => {

                let dataSeries = res["data"]
                let refuelSeries = res["refuel_alert"]
                refuelSeries["dataLabels"] = { "enabled": true }
                let theftSeries = res["theft_alert"]
                theftSeries["dataLabels"] = { "enabled": true }
                let dgFuelConsumed = res["dg_fuel_data"]
                dgFuelConsumed["dataLabels"] = { "enabled": true }
                let dgUnitPerLtr = res["dg_unit_per_litre_data"]
                dgUnitPerLtr["dataLabels"] = { "enabled": true }
                let dgConsumptionDataSeries = res["dg_unit_data"]
                dgConsumptionDataSeries["yAxis"] = 1
                dgConsumptionDataSeries["dataLabels"] = { "enabled": true }
                this.logger.log("dgConsumptionDataSeries", dgConsumptionDataSeries)
                this.chartLoading = true;
                this.dgFuelConsumptionOptions = {
                    colorCount: '5',
                    colors: ['#90ED7D', '#7cb5ec', '#ff0000', '#ff7a01', '#800080', '#00008B'],
                    chart: {
                        // type:"spline",
                        backgroundColor: "#222222",
                        scrollablePlotArea: {
                            minWidth: 300,
                            scrollPositionX: 1
                        },
                        zoomType: "x",

                    },
                    navigator: {
                        enabled: true
                    },
                    scrollbar: {
                        enabled: true
                    },
                    legend: {
                        itemStyle: { color: 'white', },
                    },

                    xAxis: {
                        type: 'datetime',
                        dateTimeLabelFormats: {
                            day: '%d %b %Y'    //ex- 01 Jan 2016
                        },
                        startOnTick: true,
                        endOnTick: true,
                        showLastLabel: true,
                        labels: {
                            style: { color: 'white', },
                            rotation: -45,
                            //Specify the formatting of xAxis labels:
                            format: '{value:%Y-%m-%d %H:%M}',

                        }
                    },

                    yAxis: [{ // Primary yAxis
                        labels: {
                            // format: '{value} units',
                            style: {
                                color: 'white'
                            }
                        },
                        title: {
                            text: 'Fuel Level (in Litres)',
                            style: {
                                color: 'white'
                            }
                        },
                        opposite: false,
                        // plotOptions: {
                        //     series: {
                        //         pointWidth: 50
                        //     }
                        // },
                        // min: 0,
                        // max: 1000,
                        // tickInterval: 100,
                        // lineWidth: 0,

                    },
                    { // Secondary yAxis
                        gridLineWidth: 0,
                        title: {
                            text: 'Unit Consumed In KWH',
                            style: {
                                color: 'white'
                            }
                        },
                        labels: {
                            format: '{value} KWH',
                            style: {
                                color: 'white'
                            }

                        },
                        opposite: true,
                        min: 0,
                        max: 600,
                        tickInterval: 100,


                    }
                    ],


                    time: {
                        useUTC: false
                    },



                    title: {
                        text: 'DG Fuel and Unit Trend',
                        style: {
                            color: 'white',
                        },
                    },

                    plotOptions: {
                        series: {
                            turboThreshold: 0,
                            pointWidth: 15
                        }
                    },

                    series: [{
                        type: "areaspline",
                        name: 'Fuel Level',
                        data: dataSeries,
                        fillColor: new Highcharts.Color('#808080').setOpacity(0.66).get(),

                    }, refuelSeries, theftSeries, dgConsumptionDataSeries, dgFuelConsumed, dgUnitPerLtr


                    ]
                }
                // make sure the chart updates after options are assigned
                this.updateFlag = true;
            }
        )
    }

    dgFuelConsumptionGraphSelectionChange() {
        let todayDate = formatDate(this.dgFuelDate.value, 'yyyy/MM/dd', 'en');
        let reqData = { "site_id": this.siteId, "date": todayDate, "user_type": this.user_type }
        this.dgFuelData = false;
        this.dgFuelDataSelectionChange = true;
        this.DataService.dgFuelConsumptionData(reqData).subscribe(
            res => {
                let dataSeries = res["data"]
                // dataSeries["dataLabels"] = {"enabled": true}
                let refuelSeries = res["refuel_alert"]
                refuelSeries["dataLabels"] = { "enabled": true }
                let theftSeries = res["theft_alert"]
                theftSeries["dataLabels"] = { "enabled": true }
                let dgFuelConsumed = res["dg_fuel_data"]
                dgFuelConsumed["dataLabels"] = { "enabled": true }
                let dgUnitPerLtr = res["dg_unit_per_litre_data"]
                dgUnitPerLtr["dataLabels"] = { "enabled": true }
                let dgConsumptionDataSeries = res["dg_unit_data"]
                dgConsumptionDataSeries["yAxis"] = 1
                dgConsumptionDataSeries["dataLabels"] = { "enabled": true }
                this.logger.log("################## ", dataSeries[0]['x'])
                let alertData = res["alert_data"]
                this.logger.log("api data: ", dataSeries)
                this.chartLoading = true;
                this.dgFuelConsumptionSelectionOptions = {
                    colorCount: '5',
                    colors: ['#90ED7D', '#7cb5ec', '#ff0000', '#ff7a01', '#800080', '#00008B'],
                    chart: {
                        type: "spline",
                        backgroundColor: "#222222",
                        scrollablePlotArea: {
                            minWidth: 300,
                            scrollPositionX: 1
                        },
                        zoomType: "x",

                    },
                    navigator: {
                        enabled: true
                    },
                    scrollbar: {
                        enabled: true
                    },
                    legend: {
                        itemStyle: { color: 'white', },
                    },


                    xAxis: {
                        type: 'datetime',
                        dateTimeLabelFormats: {
                            day: '%d %b %Y'    //ex- 01 Jan 2016
                        },
                        startOnTick: true,
                        endOnTick: true,
                        showLastLabel: true,
                        labels: {
                            style: { color: 'white', },
                            rotation: -45,
                            //Specify the formatting of xAxis labels:
                            format: '{value:%Y-%m-%d %H:%M}',

                        }
                    },
                    yAxis: [{ // Primary yAxis
                        labels: {
                            // format: '{value} units',
                            style: {
                                color: 'white'
                            }
                        },
                        title: {
                            text: 'Fuel Level (in Litres)',
                            style: {
                                color: 'white'
                            }
                        },
                        opposite: false,
                        // min: 0,
                        // max: 1000,
                        // tickInterval: 100,
                        // lineWidth: 0,

                    },
                    { // Secondary yAxis
                        gridLineWidth: 0,
                        title: {
                            text: 'Unit Consumed In KWH',
                            style: {
                                color: 'white'
                            }
                        },
                        labels: {
                            format: '{value} KWH',
                            style: {
                                color: 'white'
                            }

                        },
                        opposite: true,
                        min: 0,
                        max: 600,
                        tickInterval: 100,


                    },

                    ],


                    time: {
                        useUTC: false
                    },



                    title: {
                        text: 'DG Fuel and Unit Trend',
                        style: {
                            color: 'white',
                        },
                    },

                    plotOptions: {
                        series: {
                            turboThreshold: 0,
                            pointWidth: 15
                        }
                    },

                    series: [{
                        type: "areaspline",
                        name: 'Fuel Level',
                        data: dataSeries,
                        fillColor: new Highcharts.Color('#808080').setOpacity(0.66).get(),

                    }, refuelSeries, theftSeries, dgConsumptionDataSeries, dgFuelConsumed, dgUnitPerLtr


                    ]
                }
            }
        )
    }

    verifySession() {
        this.infoToken = { "token": localStorage.getItem("token") }
        this.user_service.validateToken(this.infoToken).subscribe(
            response => {
                this.sessionVerify = response['result']
                if (this.sessionVerify == 'true') {
                    this.logger.log(this.sessionVerify + 'Session verified')

                }
                else {
                    // localStorage.removeItem('token');
                    localStorage.clear();
                    localStorage.removeItem('token');
                    this.router.navigate(['/login']);

                }
            }

        )
    }

    open() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = "40%";
        this.dialog.open(DialogSwitchdashComponent, dialogConfig);
    }

    // load_data_every_second() {
    //     let epoch_time = localStorage.getItem("epoch_time");
    //     let data = { "site_id": this.siteId, "epoch_time": epoch_time }
    //     this.DataService.load_graph_every_sec(data).subscribe(
    //         res => {
    //             for (let i = 0; i <= res['data'].length - 1; i++) {
    //                 this.loadChart.chart.series[0].addPoint(res['data'][i], true, false)
    //             }

    //             localStorage.setItem("epoch_time", res["data"].splice(-1)[0].x)
    //         })
    // }

    // load_data_every_second() {
    //     const epoch_time = localStorage.getItem("epoch_time");
    //     if (!epoch_time) return;

    //     const req_data = { site_id: this.siteId, epoch_time: epoch_time };

    //     this.DataService.load_graph_every_sec(req_data).subscribe(res => {
    //         if (res && res["data"]) {
    //             const supplyNames = Object.keys(res["data"]);
    //             let latestEpoch = parseInt(epoch_time, 10);

    //             supplyNames.forEach((supply, index) => {
    //                 const points = res["data"][supply];

    //                 points.forEach((p: any) => {
    //                     const x = parseInt(p.epoch, 10);
    //                     // const y = p.load;
    //                     const y = parseFloat(p.load.toFixed(2));


    //                     if (!this.loadChart.chart.series[index]) {
    //                         this.loadChart.chart.addSeries(
    //                             { data: [], name: supply, type: "spline" },
    //                             false
    //                         );
    //                     }

    //                     this.loadChart.chart.series[index].addPoint([x, y], true, false);

    //                     if (x > latestEpoch) latestEpoch = x;
    //                 });
    //             });

    //             // update stored epoch
    //             localStorage.setItem("epoch_time", latestEpoch.toString());
    //         }
    //     });
    // }

    load_data_every_second() {
        const epoch_time = localStorage.getItem("epoch_time");
        if (!epoch_time) return;

        const req_data = { site_id: this.siteId, epoch_time: epoch_time };
        const fixedColors = ['#00FFFF', '#FF7F50', '#7CFC00']; // same fixed colors

        this.DataService.new_load_data_sec(req_data).subscribe(res => {
            if (res && res["data"]) {
                this.logger.log("live load data every second api res: ", res);
                const supplyNames = Object.keys(res["data"]);
                let latestEpoch = parseInt(epoch_time, 10);

                supplyNames.forEach((supply, index) => {
                    const points = res["data"][supply];

                    points.forEach((p: any) => {
                        const x = parseInt(p.epoch, 10);
                        const y = parseFloat(p.load.toFixed(2));

                        if (!this.loadChart.chart.series[index]) {
                            this.loadChart.chart.addSeries(
                                {
                                    data: [],
                                    name: supply,
                                    type: "spline",
                                    color: fixedColors[index % fixedColors.length] // 🔥 enforce color
                                },
                                false
                            );
                        }

                        this.loadChart.chart.series[index].addPoint([x, y], true, false);

                        if (x > latestEpoch) latestEpoch = x;
                    });
                });

                // update stored epoch
                localStorage.setItem("epoch_time", latestEpoch.toString());
            }
        });
    }




    // load_graph(data) {
    //     let req_data = data;
    //     this.DataService.hourly_load_graph(req_data).subscribe(res => {
    //         const apiData = (res && res["data"]) || [];
    //         const brightColors = ['#00FFFF', '#30d1b6', '#FFFF00', '#5d8fde', '#7CFC00'];

    //         const seriesData = apiData.map((item, idx) => {
    //             const name = Object.keys(item)[0];
    //             const values = item[name] || [];

    //             const transformed = values.flatMap(point => {
    //                 if (point.x !== undefined) {
    //                     // Normal reading
    //                     return [{ x: point.x, y: point.y }];
    //                 } else if (point.from !== undefined && point.to !== undefined) {
    //                     // Gap → insert 0 at start and end
    //                     return [
    //                         { x: point.from, y: 0 },
    //                         { x: point.to, y: 0 }
    //                     ];
    //                 }
    //                 return [];
    //             });

    //             return {
    //                 name: name,
    //                 data: transformed,
    //                 color: (values.length > 0 && values[0].color)
    //                     ? values[0].color
    //                     : brightColors[idx % brightColors.length],
    //                 type: 'spline',
    //                 step: 'left'
    //             };
    //         });

    //         this.chartLoading = true;
    //         this.lineChartOptions = {
    //             chart: {
    //                 type: "spline",
    //                 backgroundColor: '#222222',
    //                 scrollablePlotArea: { minWidth: 300, scrollPositionX: 1 },
    //                 zoomType: "x"
    //             },
    //             navigator: { enabled: true },
    //             scrollbar: { enabled: true },
    //             credits: { enabled: false },
    //             xAxis: {
    //                 type: 'datetime',
    //                 labels: {
    //                     style: { color: 'white' },
    //                     rotation: -45,
    //                     format: '{value:%Y-%m-%d %H:%M}'
    //                 }
    //             },
    //             yAxis: {
    //                 allowDecimals: false,
    //                 min: 0,
    //                 title: { text: 'Load Values (kW)', style: { color: 'white' } },
    //                 labels: { style: { color: 'white' } }
    //             },
    //             time: { useUTC: false },
    //             title: { text: 'Load data', style: { color: 'white' } },
    //             legend: { itemStyle: { color: 'white' } },
    //             plotOptions: { series: { turboThreshold: 0 } },
    //             series: seriesData
    //         };
    //     });
    // }

    load_graph(data) {
        let req_data = data;
        this.DataService.hourly_load_graph(req_data).subscribe(res => {
            const apiData = (res && res["data"]) || [];
            const brightColors = ['#00FFFF', '#30d1b6', '#FFFF00', '#5d8fde', '#7CFC00'];

            const seriesData = apiData.map((item, idx) => {
                const name = Object.keys(item)[0];
                const values = item[name] || [];

                const transformed = values.flatMap(point => {
                    if (point.x !== undefined) {
                        // Normal reading
                        return [{ x: point.x, y: point.y }];
                    } else if (point.from !== undefined && point.to !== undefined) {
                        // Gap → insert 0 at start and end
                        return [
                            { x: point.from, y: 0 },
                            { x: point.to, y: 0 }
                        ];
                    }
                    return [];
                });

                return {
                    name: name,
                    data: transformed,
                    color: brightColors[idx % brightColors.length], // ✅ Force only our palette
                    type: 'spline',
                    step: 'left'
                };
            });

            this.chartLoading = true;
            this.lineChartOptions = {
                chart: {
                    type: "spline",
                    backgroundColor: '#222222',
                    scrollablePlotArea: { minWidth: 300, scrollPositionX: 1 },
                    zoomType: "x"
                },
                navigator: { enabled: true },
                scrollbar: { enabled: true },
                credits: { enabled: false },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        style: { color: 'white' },
                        rotation: -45,
                        format: '{value:%Y-%m-%d %H:%M}'
                    }
                },
                yAxis: {
                    allowDecimals: false,
                    min: 0,
                    title: { text: 'Load Values (kW)', style: { color: 'white' } },
                    labels: { style: { color: 'white' } }
                },
                time: { useUTC: false },
                title: { text: 'Load data', style: { color: 'white' } },
                legend: { itemStyle: { color: 'white' } },
                plotOptions: { series: { turboThreshold: 0 } },
                series: seriesData
            };
        });
    }


    loadGraphFilterChanged() {
        this.logger.log("#######################", formatDate(this.loadDate.value, 'yyyy/MM/dd', 'en'), this.selected_load_options)
        // Always clear all series before rendering new data
        if (this.loadChart && this.loadChart.chart && this.loadChart.chart.series) {
            while (this.loadChart.chart.series.length) {
                this.loadChart.chart.series[0].remove(false);
            }
            this.loadChart.chart.update({
                title: { text: 'Load data' },
                series: []
            }, false);
            this.loadChart.chart.redraw();
        }
        if (this.selected_load_options == "0") {
            this.loadGraph = true;
            this.liveLoadApiCal = false;
            this.seprateManinsDgLoad = false;

            let data = { "site_id": this.siteId, 'date': formatDate(this.loadDate.value, 'yyyy/MM/dd', 'en') }
            this.load_graph(data);
        }
        else if (this.selected_load_options == "1") {
            this.loadGraph = true;
            this.liveLoadApiCal = false;
            this.seprateManinsDgLoad = false;
            let data = { "site_id": this.siteId, 'date': formatDate(this.loadDate.value, 'yyyy/MM/dd', 'en') }
            this.DataService.daily_load_graph(data).subscribe(
                res => {
                    if (res["data"].length > 0) {
                        this.loadChart.chart.addSeries({ data: res["data"], name: 'Daily Load', type: 'spline' }, false);
                        this.updateLoadDataFlag = true;
                    } else {
                        let epoch_time = new Date(this.loadDate.value).getTime()
                        this.loadChart.chart.addSeries({ data: [[epoch_time, 0]], name: 'Daily Load', type: 'spline' }, false);
                        this.updateLoadDataFlag = true;
                    }
                    this.loadChart.chart.redraw();
                }
            )
        }
        else if (this.selected_load_options == "2") {
            this.loadGraph = true;
            this.liveLoadApiCal = false;
            this.seprateManinsDgLoad = false;
            let data = { "site_id": this.siteId, 'date': formatDate(this.loadDate.value, 'yyyy/MM/dd', 'en') }
            this.DataService.daily_load_graph(data).subscribe(
                res => {
                    if (res["data"].length > 0) {
                        this.loadChart.chart.addSeries({ data: res["data"], name: 'Monthly Load', type: 'spline' }, false);
                        this.updateLoadDataFlag = true;
                    } else {
                        let epoch_time = new Date(this.loadDate.value).getTime()
                        this.loadChart.chart.addSeries({ data: [[epoch_time, 0]], name: 'Monthly Load', type: 'spline' }, false);
                        this.updateLoadDataFlag = true;
                    }
                    this.loadChart.chart.redraw();
                }
            )
        }
        else if (this.selected_load_options == "3") {
            this.liveLoadApiCal = false;
            this.loadGraph = false;
            this.seprateManinsDgLoad = true;
            let data = { "site_id": this.siteId, 'date': formatDate(this.loadDate.value, 'yyyy/MM/dd', 'en') }
            this.DataService.mains_dg_daily_load_graph(data).subscribe(
                res => {
                    if (res["data"].length > 0) {
                        this.seprateManinsDgLoadChartOptions = {
                            colorCount: 12,
                            colors: ['#90ED7D', '#ff7a01', '#7cb5ec', '#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
                            chart: {
                                type: "spline",
                                backgroundColor: '#222222',
                                scrollablePlotArea: {
                                    minWidth: 300,
                                    scrollPositionX: 1
                                },
                                zoomType: "x",
                            },
                            navigator: { enabled: true },
                            scrollbar: { enabled: true },
                            xAxis: {
                                type: 'datetime',
                                dateTimeLabelFormats: { day: '%d %b %Y' },
                                startOnTick: true,
                                endOnTick: true,
                                showLastLabel: true,
                                labels: {
                                    style: { color: 'white' },
                                    rotation: -45,
                                    format: '{value:%Y-%m-%d %H:%M}',
                                }
                            },
                            yAxis: {
                                allowDecimals: false,
                                min: 0,
                                title: {
                                    style: { color: 'white', },
                                    text: 'Load Values(in KW)'
                                },
                                stackLabels: {
                                    enabled: true,
                                    rotation: -90,
                                    style: { color: "white" },
                                    verticalAlign: "top",
                                    y: -30,
                                },
                                labels: { style: { color: 'white' } }
                            },
                            time: { useUTC: false },
                            title: {
                                text: 'Load data',
                                style: { color: 'white', },
                            },
                            legend: { itemStyle: { color: 'white' } },
                            plotOptions: {
                                series: {
                                    turboThreshold: 0
                                }
                            },
                            series: res["data"]
                        }
                    } else {
                        let epoch_time = new Date(this.loadDate.value).getTime()
                        this.seprateManinsDgLoadChartOptions = {
                            series: [{ data: [[epoch_time, 0]], name: 'No Data', type: 'spline' }]
                        }
                        this.updateLoadDataFlag = true;
                    }
                }
            )
        }
        // else if (this.selected_load_options == "4") {
        //     let req_data = { "site_id": this.siteId }
        //     this.loadGraph = true;
        //     this.seprateManinsDgLoad = false;
        //     this.liveLoadApiCal = true;
        //     this.DataService.load_live_graph(req_data).subscribe(
        //         res => {
        //             if (res["data"].length > 0) {
        //                 this.loadChart.chart.addSeries({ data: res["data"], name: 'Live Load', type: 'spline' }, false);
        //                 this.updateLoadDataFlag = true;
        //             } else {
        //                 let epoch_time = new Date(this.loadDate.value).getTime()
        //                 this.loadChart.chart.addSeries({ data: [[epoch_time, 0]], name: 'Live Load', type: 'spline' }, false);
        //                 this.updateLoadDataFlag = true;
        //             }
        //             this.loadChart.chart.redraw();
        //         }
        //     )
        // }
        else if (this.selected_load_options == "4") {
            // const currentEpoch = Date.now()*1000; // current epoch in ms
            const epoch_time = localStorage.getItem("epoch_time");
            const req_data = { site_id: this.siteId, epoch_time: epoch_time };

            this.loadGraph = true;
            this.seprateManinsDgLoad = false;
            this.liveLoadApiCal = true;
            this.chartLoading = true;

            // Force color set
            // Pastel blue/green shades
            const fixedColors = ['#A8DADC', '#90CAF9', '#81C784'];


            if (this.loadChart && this.loadChart.chart) {
                while (this.loadChart.chart.series.length) {
                    this.loadChart.chart.series[0].remove(false);
                }
                this.loadChart.chart.redraw();
            }

            this.DataService.new_load_data_sec(req_data).subscribe(res => {
                if (res && res["data"]) {
                    this.logger.log("live load data api res: 4 ", res);
                    const supplyNames = Object.keys(res["data"]);

                    supplyNames.forEach((supply, idx) => {
                        const points = res["data"][supply].map(function (p: any) {
                            return [parseInt(p.epoch, 10), parseFloat(p.load.toFixed(2))];
                        });

                        this.loadChart.chart.addSeries(
                            {
                                data: points,
                                name: supply,
                                type: "spline",
                                color: fixedColors[idx % fixedColors.length] // 🔥 enforce color
                            },
                            false
                        );
                    });

                    this.loadChart.chart.redraw();
                    this.chartLoading = true;

                    // store the latest epoch
                    let latestEpoch = 0;
                    supplyNames.forEach((supply) => {
                        const arr = res["data"][supply];
                        if (arr.length > 0) {
                            const lastEpoch = parseInt(arr[arr.length - 1].epoch, 10);
                            if (lastEpoch > latestEpoch) latestEpoch = lastEpoch;
                        }
                    });
                    localStorage.setItem("epoch_time", latestEpoch.toString());
                }
            });
        }
    }


    getSiteDetails() {
        let data = { 'siteId': this.siteId };
        this.DataService.getSiteInfo(data).subscribe(
            response => {
                let siteDetails = response['site'];
                // let siteManagerDetails = siteDetails['site_manager'];
                let site_type = siteDetails['site_type']
                if (site_type == '1') {
                    site_type = 'WH METERING'
                }
                else if (site_type == '2') {
                    site_type = 'WH_ENERGY SAVING'
                }

                this.logger.log("Site Details" + siteDetails);
                this.siteDetails.site_id = siteDetails['id'];
                this.siteDetails.site_name = siteDetails['site_name'];
                this.siteDetails.site_addr = siteDetails['location'];
                this.siteDetails.site_type = site_type;
                this.siteDetails.site_mgr_name = siteDetails['site_manager'];
                this.siteDetails.site_mgr_mob = siteDetails['site_manager_contact'];
                this.siteDetails.site_mgr_email = siteDetails['site_manager_email'];
                this.siteDetails.total_blocks = siteDetails['total_no_of_blocks'];
                this.siteDetails.total_aisles = siteDetails['total_no_of_aisles'];
                this.siteDetails.total_single_src_meters = siteDetails['no_of_single_source_meters'];
                this.siteDetails.total_dual_src_meters = siteDetails['no_of_dual_source_meters'];
            },
            error => { }
        );
    }


    getPowerSourceDistData() {
        let data = { 'siteId': this.siteId };
        this.DataService.getPowerSrcDistData(data).subscribe(
            response => {
                let status = response['result'];
                let mainsPercentage = 0;
                let dg1Percentage = 0;
                let dg2Percentage = 0;
                let seriesData = [];
                let currentMonth = response['current_month'];


                if (status == "1") {
                    for (let k = 0; k < response['data'].length; k++) {
                        let data: any;
                        data = { 'name': response['data'][k]['name'], 'y': response['data'][k]['data'] };
                        seriesData.push(data);
                    }
                }


                // this.pieChartComp.updatePieChartData(seriesData);

                // this.highcharts = Highcharts;
                this.pieChartOptions = {
                    colorCount: '12',
                    colors: ['#90ED7D', '#ff7a01', '#7cb5ec', '#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
                    chart: {
                        type: 'pie',
                        backgroundColor: '#222222',
                        options3d: {
                            enabled: true,
                            alpha: 45,
                            beta: 0
                        }
                    },


                    credits: {
                        enabled: false
                    },
                    title: {
                        style: {
                            color: 'white',
                        },
                        text: 'Power Source Distribution ( ' + currentMonth + ' )'
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            depth: 35,
                            dataLabels: {
                                style: {
                                    color: 'white',
                                    fontSize: '12'
                                },
                                enabled: true,
                                format: '{point.name}: <b>{point.percentage:.1f}%</b>'
                            }
                        }
                    },
                    series: [{
                        type: 'pie',
                        name: 'share',
                        // innersize:'50%',
                        data: seriesData
                    }]
                }
                this.logger.log("this is series data", this.pieChartOptions);
                // else {
                //   // Show the meaningful text on  graph
                // }
            },
            error => {

            }
        );

    }

    getConsumptionData() {
        let todayDate = new Date();
        let tillDate = formatDate(new Date(), 'yyyy/MM/dd', 'en');
        let fromDate = formatDate(new Date().setDate(todayDate.getDate() - 30), 'yyyy/MM/dd', 'en');
        this.logger.log("till Date is : " + tillDate);
        this.logger.log("From Date is : " + fromDate);
        let data1 = { 'site_id': this.siteId, 'from_date': fromDate, 'till_date': tillDate };
        this.DataService.getGraphData(data1).subscribe(
            response => {
                //this.Highcharts = Highcharts;
                this.barChartOptions = {
                    colorCount: '12',
                    colors: ['#90ED7D', '#ff7a01', '#7cb5ec', '#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
                    credits: {
                        enabled: false,
                    },

                    chart: {
                        backgroundColor: '#222222',
                        type: 'column',
                        zoomType: "x"
                    },
                    title: {
                        text: this.graphTitle,
                        style: {
                            color: 'white',
                        },
                    },

                    xAxis: {
                        labels: {
                            style: {
                                color: 'white',
                            },
                        },
                        categories: response['Dates']
                    },


                    yAxis: {
                        allowDecimals: false,
                        min: 0,
                        title: {
                            style: { color: 'white', },
                            text: 'Number of units (kWh)'
                        },
                        stackLabels: {
                            enabled: true,
                            rotation: -90,
                            style: { color: "white" },
                            verticalAlign: "top",
                            y: -30,
                        },


                        labels: {
                            style: {
                                color: 'white'
                            }
                        }
                    },


                    labels: {
                        style: {
                            color: 'white'
                        }
                    },


                    tooltip: {
                        formatter: function () {
                            return '<b>' + this.x + '</b><br/>' +
                                this.series.name + ': ' + this.y + '<br/>' +
                                'Total: ' + this.point.stackTotal;
                        }
                    },

                    plotOptions: {
                        column: {
                            stacking: 'normal',
                            //colors: ['orange', 'white', 'blue']
                        },
                    },

                    legend: {
                        itemStyle: { color: 'white', },
                    },

                    series: response['Data'],
                }
                this.logger.log("graph data", this.barChartOptions)
            });
    }

    onChange(value) {
        this.logger.log("@@@@@@@ ", value)
    }

    columnGraphFilterChanged(interval) {
        let mode = this.selected_task;
        this.logger.log("value of selected task is", mode);
        let tillDate = formatDate(this.date.value, 'yyyy/MM/dd', 'en');
        let graphType = this.selected_graph;
        let todayDate = new Date();
        let fromDate;
        let categories = [];
        let series = [];

        let selectedYear = this.date.value.getFullYear();
        let selectedMonth = this.date.value.getMonth();
        let selectedMonthYear = formatDate(this.date.value, 'yyyy/MM', 'en');
        let currentMonthYear = formatDate(new Date(), 'yyyy/MM', 'en');
        let hourlySelectedDate = formatDate(this.date.value, 'yyyy/MM/dd', 'en');
        if (selectedMonthYear == currentMonthYear) {
            // if the daily filter is for current month only
            // then show the last 30 days data
            fromDate = formatDate(new Date().setDate(todayDate.getDate() - 30), 'yyyy/MM/dd', 'en');
        }
        else {
            // if the current month is not same as the selected month
            // then show the data for that complete month
            fromDate = selectedMonthYear + "/01";
            fromDate = formatDate(fromDate, 'yyyy/MM/dd', 'en');
            let day = new Date(selectedYear, selectedMonth + 1, 0).getDate();
            tillDate = selectedMonthYear + "/" + day;
        }



        /**
         *  Call the API on the basis of Graph Type
         */
        if (graphType == '0') {
            // Energy Consumption Graph
            if (mode == '0') {
                // Graph Filter is for daily data

                // Call the API with specific data
                let data = { 'site_id': this.siteId, 'from_date': fromDate, 'till_date': tillDate };
                this.DataService.getGraphData(data).subscribe(
                    response => {
                        categories = response['Dates'];
                        series = response['Data'];
                        this.barChartOptions.xAxis.categories = categories;
                        this.barChartOptions.series = this.normalizeSeries(series);
                        setTimeout(() => {
                            this.updateFlag = true;
                            try{ if(this.chart && this.chart.chart) this.chart.chart.reflow(); } catch(e){}
                        },0);
                    },
                    error => { }
                );
            }
            else {
                // Graph Filter is for hourly data
                let data = { 'site_id': this.siteId, 'date': hourlySelectedDate };
                // this.barChartOptions.plotOptions.column.stacking='percent';

                this.DataService.getSiteHourlyConsumptionData(data).subscribe(
                    response => {
                        categories = response['Hours'];
                        series = response['Data'];
                        this.barChartOptions.xAxis.categories = categories;
                        this.barChartOptions.series = this.normalizeSeries(series);
                        setTimeout(() => {
                            this.updateFlag = true;
                            try{ if(this.chart && this.chart.chart) this.chart.chart.reflow(); } catch(e){}
                        },0);
                    },
                    error => { }
                );
            }
            this.unitConsumptionGraph = true;
            this.runTimeGraph = false;
        }
        else if (graphType == "1") {
            // Percentage Run Graph

            if (mode == '0') {
                // Graph Filter is for daily data

                // Call the API with specific data
                let data = { 'site_id': this.siteId, 'from_date': fromDate, 'till_date': tillDate };
                this.DataService.getDailyPowerSrcDistData(data).subscribe(
                    response => {

                        categories = response['Dates'];
                        series = response['Data'];

                        this.barChartOptions.xAxis.categories = categories;
                        this.barChartOptions.series = series;
                        this.barChartOptions.yAxis.title.text = "Number of units % (KWh)"
                        this.updateFlag = true;
                    },
                    error => { }
                );
            }
            else {
                // Graph Filter is for hourly data
                let data = { 'site_id': this.siteId, 'date': hourlySelectedDate };
                this.DataService.getHourlyPowerSrcDistData(data).subscribe(
                    response => {
                        categories = response['Hours'];
                        series = response['Data'];
                        this.barChartOptions.xAxis.categories = categories;
                        this.barChartOptions.series = this.normalizeSeries(series);
                        setTimeout(() => {
                            this.updateFlag = true;
                            try{ if(this.chart && this.chart.chart) this.chart.chart.reflow(); } catch(e){}
                        },0);
                    },
                    error => { }
                );
            }
            this.unitConsumptionGraph = true;
            this.runTimeGraph = false;
        }

        else {
            // Percentage Run Graph (Time)
            if (mode == '0') {
                // Graph Filter is for daily data

                // Call the API with specific data
                let data = { 'site_id': this.siteId, 'from_date': fromDate, 'till_date': tillDate };
                this.DataService.getDailyPowerSrcDistDataTime(data).subscribe(
                    response => {

                        this.barChartOptionsRunTime = {
                            colorCount: '12',
                            colors: ['#90ED7D', '#ff7a01', '#7cb5ec', '#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
                            credits: {
                                enabled: false,
                            },

                            chart: {
                                backgroundColor: '#222222',
                                type: 'column',
                                zoomType: "x"
                            },
                            title: {
                                text: this.graphTitle,
                                style: {
                                    color: 'white',
                                },
                            },

                            xAxis: {
                                labels: {
                                    style: {
                                        color: 'white',
                                    },
                                },
                                categories: response['Dates']
                            },


                            yAxis: {
                                allowDecimals: false,
                                min: 0,
                                title: {
                                    style: { color: 'white', },
                                    text: 'Time (In Seconds)'
                                },
                                stackLabels: {
                                    enabled: true,
                                    rotation: -90,
                                    style: { color: "white" },
                                    verticalAlign: "top",
                                    y: -30,
                                },


                                labels: {
                                    style: {
                                        color: 'white'
                                    }
                                }
                            },


                            labels: {
                                style: {
                                    color: 'white'
                                }
                            },


                            tooltip: {
                                formatter: function () {
                                    var totalMinutes = Math.floor(this.y / 60);
                                    var seconds = this.y % 60;
                                    var hours = Math.floor(totalMinutes / 60);
                                    var minutes = totalMinutes % 60;
                                    var y = hours + " hrs " + minutes + " min " + seconds + " sec";
                                    // for total
                                    var tm = Math.floor(this.point.stackTotal / 60);
                                    var ss = this.point.stackTotal % 60;
                                    var hrs = Math.floor(tm / 60);
                                    var ms = tm % 60;
                                    var total = hrs + " hrs " + ms + " min " + ss + " sec";
                                    return '<b>' + this.x + '</b><br/>' +
                                        this.series.name + ': ' + y + '<br/>' +
                                        'Total: ' + total;
                                }
                            },

                            plotOptions: {
                                column: {
                                    stacking: 'normal',
                                    //colors: ['orange', 'white', 'blue']
                                },
                            },

                            legend: {
                                itemStyle: { color: 'white', },
                            },

                            series: response['Data'],
                        }
                        this.unitConsumptionGraph = false;
                        this.runTimeGraph = true;
                    },
                    error => { }
                );
            }
            else {
                // Graph Filter is for hourly data
                let data = { 'site_id': this.siteId, 'date': hourlySelectedDate };
                this.DataService.getHourlyPowerSrcDistDataTime(data).subscribe(
                    response => {

                        this.barChartOptionsRunTime = {
                            colorCount: '12',
                            colors: ['#90ED7D', '#ff7a01', '#7cb5ec', '#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
                            credits: {
                                enabled: false,
                            },

                            chart: {
                                backgroundColor: '#222222',
                                type: 'column',
                                zoomType: "x"
                            },
                            title: {
                                text: this.graphTitle,
                                style: {
                                    color: 'white',
                                },
                            },

                            xAxis: {
                                labels: {
                                    style: {
                                        color: 'white',
                                    },
                                },
                                categories: response['Dates']
                            },


                            yAxis: {
                                allowDecimals: false,
                                min: 0,
                                title: {
                                    style: { color: 'white', },
                                    text: 'Number of units (kWh)'
                                },
                                stackLabels: {
                                    enabled: true,
                                    rotation: -90,
                                    style: { color: "white" },
                                    verticalAlign: "top",
                                    y: -30,
                                },


                                labels: {
                                    style: {
                                        color: 'white'
                                    }
                                }
                            },


                            labels: {
                                style: {
                                    color: 'white'
                                }
                            },


                            tooltip: {
                                formatter: function () {
                                    var totalMinutes = Math.floor(this.y / 60);
                                    var seconds = this.y % 60;
                                    var hours = Math.floor(totalMinutes / 60);
                                    var minutes = totalMinutes % 60;
                                    var y = hours + " hrs " + minutes + " min " + seconds + " sec";
                                    // for total
                                    var tm = Math.floor(this.point.stackTotal / 60);
                                    var ss = this.point.stackTotal % 60;
                                    var hrs = Math.floor(tm / 60);
                                    var ms = tm % 60;
                                    var total = hrs + " hrs " + ms + " min " + ss + " sec";
                                    return '<b>' + this.x + '</b><br/>' +
                                        this.series.name + ': ' + y + '<br/>' +
                                        'Total: ' + total;
                                }
                            },

                            plotOptions: {
                                column: {
                                    stacking: 'normal',
                                    //colors: ['orange', 'white', 'blue']
                                },
                            },

                            legend: {
                                itemStyle: { color: 'white', },
                            },

                            series: response['Data'],
                        }
                        this.unitConsumptionGraph = false;
                        this.runTimeGraph = true;
                    },
                    error => { }
                );
            }
        }
    }

    changeGraphStacking() {
        this.whichGraph ^= 0x1;

        if (this.whichGraph == 0) {
            this.barChartOptions.plotOptions.column.stacking = '';
            this.updateFlag = true;
            this.logger.log('Inside normal stacking false')
        }
        else {
            this.barChartOptions.plotOptions.column.stacking = 'normal';
            this.updateFlag = true;
            this.logger.log('Inside normal stacking True')
        }
    }
    changeGraphStackingRunTime() {
        this.whichGraph ^= 0x1;

        if (this.whichGraph == 0) {
            this.barChartOptionsRunTime.plotOptions.column.stacking = '';
            this.updateFlag = true;
            this.logger.log('Inside normal stacking false')
        }
        else {
            this.barChartOptionsRunTime.plotOptions.column.stacking = 'normal';
            this.updateFlag = true;
            this.logger.log('Inside normal stacking True')
        }
    }

    openSiteDashboard() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = "40%";
        this.dialog.open(DialogSwitchdashComponent, dialogConfig);
    }
    loadDetails() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = "60%";
        this.dialog.open(LoadDataTableComponent, dialogConfig);

    }

    exportExcelData() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = "20%";
        this.dialog.open(ExcelsheetComponent, dialogConfig);
    }

    exportDgFuelExcelData() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = "20%";
        this.dialog.open(DgFuelExcelExportComponent, dialogConfig);
    }

    exportLoadData() {
        let data = { "site_id": this.siteId, "date": formatDate(this.loadDate.value, 'yyyy/MM/dd', 'en'), "graph_type": this.selected_load_options }
        this.DataService.download_excel_load_data(data).subscribe(
            (response: any) => {
                this.logger.log("response: ", response);
                let selectedGraphName = this.loadGraphintervals[parseInt(this.selected_load_options)].viewValue
                let blob: Blob = response.body as Blob;
                var downloadURL = window.URL.createObjectURL(blob);
                var link = document.createElement('a');
                link.href = downloadURL;
                link.download = (selectedGraphName + "load_data_" + formatDate(this.loadDate.value, 'yyyy/MM/dd', 'en') + ".csv")
                link.click();
            }
        )
    }

    getSiteCurrLoadInfoData() {
        let pf_visible = localStorage.getItem('pf_visible');
        let data = { 'site_id': this.siteId };
        this.dashData.getSiteCurrentLoadInfo(data).subscribe(
            response => {
                this.logger.log("Response#####", response)
                this.liveData.totalLoad = response.Total_Load;
                this.liveData.r_volt = response.R_Voltage;
                this.liveData.y_volt = response.Y_Voltage;
                this.liveData.b_volt = response.B_Voltage;
                this.liveData.r_current = response.R_Current;
                this.liveData.y_current = response.Y_Current;
                this.liveData.b_current = response.B_Current;
                this.liveData.r_pf = response.R_Power_Factor;
                this.liveData.y_pf = response.Y_Power_Factor;
                this.liveData.b_pf = response.B_Power_Factor;
                this.liveData.max_load = response.max_load;
                this.liveData.min_load = response.min_load;
                this.liveData.supply_source = response.Power_supply;

            },
            error => {

            }
        );
    }


    customerPage() {
        this.DataService.changeMessage("customer");
    }
    pf_details() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = "70%";
        this.dialog.open(PfTableComponent, dialogConfig);

    }

    home() {
        localStorage.removeItem('customer');
        location.reload();
    }

    customRangePopup() {
        this.logger.log("function called")
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = "20%";
        const dialogRef = this.dialog.open(CustomDateRangePickerComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(result => {
            if (result.length > 0 && result[0].from_date != '' && result[0].end_date != '') {
                this.logger.log("#############:", result.length, result)
                result = result[0]
                let start_date = result.from_date;
                let end_date = result.end_date;
                let reqData = { "site_id": this.siteId, "from_date": start_date, "end_date": end_date }
                this.DataService.fetchDGFuelDataCustomeRange(reqData).subscribe(
                    res => {
                        this.dgFuelData = false;
                        this.dgFuelDataSelectionChange = true;
                        this.logger.log("response: ", res);
                        let dataSeries = res["data"]
                        // dataSeries["dataLabels"] = {"enabled": true}
                        let refuelSeries = res["refuel_alert"]
                        refuelSeries["dataLabels"] = { "enabled": true }
                        let theftSeries = res["theft_alert"]
                        theftSeries["dataLabels"] = { "enabled": true }
                        let dgFuelConsumed = res["dg_fuel_data"]
                        // dgFuelConsumed["dataLabels"] = {"enabled": true}
                        let dgUnitPerLtr = res["dg_unit_per_litre_data"]
                        // dgUnitPerLtr["dataLabels"] = {"enabled": true}
                        let dgConsumptionDataSeries = res["dg_unit_data"]
                        dgConsumptionDataSeries["yAxis"] = 1
                        dgConsumptionDataSeries["dataLabels"] = { "enabled": true }
                        this.logger.log("################## ", dataSeries[0]['x'])
                        let alertData = res["alert_data"]
                        this.logger.log("api data: ", dataSeries)
                        this.chartLoading = true;
                        this.dgFuelConsumptionSelectionOptions = {
                            colorCount: '5',
                            colors: ['#90ED7D', '#7cb5ec', '#ff0000', '#ff7a01', '#800080', '#00008B'],
                            chart: {
                                type: "spline",
                                backgroundColor: "#222222",
                                scrollablePlotArea: {
                                    minWidth: 300,
                                    scrollPositionX: 1
                                },
                                zoomType: "x",

                            },
                            navigator: {
                                enabled: true
                            },
                            scrollbar: {
                                enabled: true
                            },
                            legend: {
                                itemStyle: { color: 'white', },
                            },


                            xAxis: {
                                type: 'datetime',
                                dateTimeLabelFormats: {
                                    day: '%d %b %Y'    //ex- 01 Jan 2016
                                },
                                startOnTick: true,
                                endOnTick: true,
                                showLastLabel: true,
                                labels: {
                                    style: { color: 'white', },
                                    rotation: -45,
                                    //Specify the formatting of xAxis labels:
                                    format: '{value:%Y-%m-%d %H:%M}',

                                }
                            },
                            yAxis: [{ // Primary yAxis
                                labels: {
                                    // format: '{value} units',
                                    style: {
                                        color: 'white'
                                    }
                                },
                                title: {
                                    text: 'Fuel Level (in Litres)',
                                    style: {
                                        color: 'white'
                                    }
                                },
                                opposite: false,
                                // min: 0,
                                // max: 1000,
                                // tickInterval: 100,
                                // lineWidth: 0,

                            },
                            { // Secondary yAxis
                                gridLineWidth: 0,
                                title: {
                                    text: 'Unit Consumed In KWH',
                                    style: {
                                        color: 'white'
                                    }
                                },
                                labels: {
                                    format: '{value} KWH',
                                    style: {
                                        color: 'white'
                                    }

                                },
                                opposite: true,
                                min: 0,
                                max: 600,
                                tickInterval: 100,


                            },

                            ],


                            time: {
                                useUTC: false
                            },



                            title: {
                                text: 'DG Fuel and Unit Trend',
                                style: {
                                    color: 'white',
                                },
                            },

                            plotOptions: {
                                series: {
                                    turboThreshold: 0,
                                    pointWidth: 15
                                }
                            },

                            series: [{
                                type: "areaspline",
                                name: 'Fuel Level',
                                data: dataSeries,
                                fillColor: new Highcharts.Color('#808080').setOpacity(0.66).get(),
                                // fillColor: new Highcharts.Color('#ADD8E6').setOpacity(0.66).get(),
                                // pointStart: dataSeries[0]['x']
                                // fillColor: {
                                //     linearGradient: {
                                //         x1: 0,
                                //         y1: 0,
                                //         x2: 0,
                                //         y2: 1
                                //     },
                                //     stops: [
                                //         [0, Highcharts.getOptions().colors[0]],
                                //         [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                                //     ]
                                // },
                            }, refuelSeries, theftSeries, dgConsumptionDataSeries, dgFuelConsumed, dgUnitPerLtr


                            ]
                        }
                    }
                )
            }

        });
    }

    dgFuelMonthlyTrend() {
        this.logger.log("5%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
        let data1 = { 'site_id': this.siteId, "user_type": this.user_type };
        // this.dgFuelData=true;

        this.DataService.dgFuelConsumptionMonthlyTrend(data1).subscribe(
            response => {
                this.logger.log('**************************', response)
                let seriesData = [];
                //this.Highcharts = Highcharts;
                //let xyz = [response['Data'],{"leg":'baseline', 'type': "spline", 'data':[{"a":100,'b':90,'c':80,'d':86,'e':90,'f':100,'g':100,'h':100,'i':100,'j':100,'k':100,'l':100,'m':100,'n':100,'o':100,'p':100,'q':100,'r':100,'s':100,'t':100,'u':100,'v':100,'w':100,'x':100,'y':100,'z':100,'ca':100,'cb':100,'cc':100,'cd':100,}]}]


                let energyConsumed: any;
                energyConsumed = { "name": "Mains", 'type': "spline", 'y': response['mains_unit_consumption_monthly'] }
                let enegySaved = { "name": "DG", 'type': 'spline', 'y': response['dg_unit_consumption_monthly'] }
                let percentageSaved = { "name": "DG-Fuel-Consumption", 'type': 'spline', 'y': response['dg_unit_consumption_monthly'] }



                let data2 = [{ "data": [energyConsumed, enegySaved, percentageSaved] }]
                // seriesData.push(consumption);
                // seriesData1.push(dataSaving);
                seriesData.push(data2);


                // highcharts = Highcharts;
                this.lineChartOption = {
                    colorCount: '4',
                    colors: ['#90ED7D', '#ff7a01', '#7cb5ec', '#058DC7'],
                    chart: {
                        type: "column",
                        backgroundColor: "#222222",

                        overflow: 'scroll'
                    },
                    title: {
                        style: {
                            color: 'white',
                        },
                        text: 'Monthly Trend Mains/DG-Units & DG-Fuel-Consumption'
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
                    yAxis: [{ // Primary yAxis
                        labels: {
                            //   format: '{value} units',
                            style: {
                                color: '#ff7a01'
                            }
                        },
                        title: {
                            text: 'Units (KWH)',
                            style: {
                                color: '#ff7a01'
                            }
                        },
                        opposite: false

                    }, { // Secondary yAxis
                        gridLineWidth: 0,
                        title: {
                            text: 'DG Fuel Consumption',
                            style: {
                                color: '#7cb5ec'
                            }
                        },
                        labels: {
                            //   format: '{value} %',
                            style: {
                                color: '#7cb5ec'
                            }

                        },
                        opposite: true

                    }],



                    tooltip: {
                        formatter: function () {
                            return '<b>' + this.x + '</b><br/>' +
                                this.series.name + ': ' + this.y + '<br/>'

                        }
                    },
                    legend: {
                        itemStyle: { color: 'white', },
                    },
                    series: [

                        {
                            name: 'Mains-Units',
                            data: response['mains_unit_consumption_monthly'],


                        },
                        {
                            name: 'DG-Units',
                            data: response["dg_unit_consumption_monthly"],


                        },
                        {
                            yAxis: 1,
                            name: 'DG-Fuel-Consumption',
                            data: response["dg_fuel_monthly"],
                            type: 'spline'

                        }
                    ]
                }
            });
    }

}



