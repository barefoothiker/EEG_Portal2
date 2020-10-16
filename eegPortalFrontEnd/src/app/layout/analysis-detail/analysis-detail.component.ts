import { Component, OnInit, OnDestroy, AfterViewInit, Input, ElementRef, QueryList, ViewChildren} from '@angular/core';
import { AnalysisDetailService } from './analysis-detail-service';
import { Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Datafile, UploadFolder, UploadFolderSubmitObj, AnalysisResult ,  AnalysisDetail , ChannelObj} from '../../models/datafile';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { DomSanitizer } from '@angular/platform-browser';
import { Options } from 'ng5-slider';
import { ChartDataSets, ChartType, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import 'rxjs/add/observable/interval';

@Component({
    selector: 'analysis-detail',
    providers: [AnalysisDetailService],
    templateUrl: './analysis-detail.component.html',
    styleUrls: ['./analysis-detail.component.scss']
})
export class AnalysisDetailComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input()
    datafile : UploadFolder;
    uploadFolderSubmitObj: UploadFolderSubmitObj;
    fileId:any;
    message:string;
    activeTabTitle:string;
    statusColor:string;
    sub:Subscription;
    sub2:Subscription;
    innerPadding:number;
    borderRadius:number;
    crossSpectrogramData:number[][];
    justSubmittedFlag:boolean;
    pacFgamma:number[];
    pacMI:number[];
    plvFgamma:number[];

    plvPlv:number[];

    barChartColors: Array<any> = [
      { // first color
        backgroundColor: 'rgba(255,255,0,0.5)',
        borderColor: 'rgba(225,10,24,0.2)',
        pointBackgroundColor: 'rgba(225,10,24,0.2)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(225,10,24,0.2)'
      },
      { // second color
        backgroundColor: 'rgba(255,0,255,0.5)',
        borderColor: 'rgba(225,10,24,0.2)',
        pointBackgroundColor: 'rgba(225,10,24,0.2)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(225,10,24,0.2)'
      },
      { // first color
        backgroundColor: 'rgba(0,255,255,0.5)',
        borderColor: 'rgba(225,10,24,0.2)',
        pointBackgroundColor: 'rgba(225,10,24,0.2)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(225,10,24,0.2)'
      },
      { // second color
        backgroundColor: 'rgba(0,0,255,0.5)',
        borderColor: 'rgba(225,10,24,0.2)',
        pointBackgroundColor: 'rgba(225,10,24,0.2)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(225,10,24,0.2)'
      }
    ];

    firstLoad:boolean;
    analysisDetail:AnalysisDetail;
    computePSDFlag:boolean;
    computeSpectrogramFlag:boolean;
    computePacFlag:boolean;
    computePlvFlag:boolean;
    selectAllChannelsFlag:boolean;
    selectedChannelIds:string[];
    spectrogramImagePaths:any[];
    psdImagePaths:any[];

    beginTime:number;
    endTime:number;
    showFiltersFlag:boolean;
    showRawDataFlag:boolean;
    showPsdFlag:boolean;
    showSpectrogramFlag:boolean;
    showPacFlag:boolean;
    showPlvFlag:boolean;
    analysisResult:AnalysisResult;

    spectrogramHeight = 300;
    spectrogramWidth = 1200;
    counter:number;
    samplingFrequency:number;
    timeBandWidth:number;
    numTapers:number;
    stepSize:number;
    windowSize:number;
    lowerFrequency:number;
    upperFrequency:number;
    initFlag = true;
    timeOutVar:any;

    autoIncrementFlag:boolean;

    filterOptions = [
      { 'id': 0, 'name': 'Uploaded', 'selected':false , 'color':'#EDF59A'},
      { 'id': 1, 'name': 'Analysis Submitted', 'selected':false , 'color':'#CBF022'},
      { 'id': 2, 'name': 'Score Calculated', 'selected':false , 'color':'#32FFC8'},
      { 'id': 3, 'name': 'Analysis Completed', 'selected':false , 'color':'#36CBEC'},
    ];

    lowerTimeLimit:number;
    upperTimeLimit:number;

    channelObjs:ChannelObj[];

    reloadingGraphMessage:string;

    rangeSliderOptions: Options = {
      floor: 0,
      ceil: 100
    };

    myTooltip = undefined;
    spectrogramDataList:any[];
    // options
     showXAxis = true;
     showYAxis = true;
     gradient = false;
     showLegend = true;
     showXAxisLabel = false;
     xAxisLabel = 'Country';
     showYAxisLabel = false;
     yAxisLabel = 'Population';

     colorScheme = {
       domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
     };

    // @ViewChild(BaseChartDirective) chart: BaseChartDirective;
    @ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective>;

    public lineChartData: ChartDataSets[] = [
     ];
     public lineChartLabels: Label[] = [
     ];

     public psdLineChartData: ChartDataSets[] = [
     ];

     public psdLineChartLabels: Label[] = [
     ];

     public plvLineChartLabels: Label[] = [
     ];

     public pacLineChartLabels: Label[] = [
     ];

     public pacLineChartData: ChartDataSets[] = [
     ];

     public plvLineChartData: ChartDataSets[] = [
     ];
     public lineChartOptions: (ChartOptions & { annotation: any }) = {
       animation: {
         duration: 0, // general animation time
       },
       responsive: true,
       scales: {
         // We use this empty structure as a placeholder for dynamic theming.
         xAxes: [{
         gridLines: {
             color: "rgba(0, 0, 0, 0)",
         }
          }],
         yAxes: [
           {
             id: 'y-axis-0',
             position: 'left',
             gridLines: {
               color: 'rgba(0,0,0,0)',
             },

           },
           // {
           //   id: 'y-axis-1',
           //   position: 'right',
           //   gridLines: {
           //     color: 'rgba(0,0,0,0)',
           //   },
           //   ticks: {
           //     fontColor: 'red',
           //   }
           // }
         ]
       },
       annotation: {
         annotations: [
           {
             type: 'line',
             mode: 'vertical',
             scaleID: 'x-axis-0',
             value: 'March',
             borderColor: 'orange',
             borderWidth: 2,
             label: {
               enabled: true,
               fontColor: 'orange',
               content: 'LineAnno'
             }
           },
         ],
       },
     };

     public barChartOptions: ChartOptions = {
       responsive: true,
       // We use these empty structures as placeholders for dynamic theming.
       scales: { xAxes: [{}], yAxes: [{
              //    gridLines: {
              //   show: false
              // },
               // display: false,
}] },
       plugins: {
         datalabels: {
           anchor: 'end',
           align: 'end',
         }
       }
     };
     public barChartLabels: Label[] = ['BandData'];
     public barChartType: ChartType = 'bar';
     public barChartLegend = true;
     // public barChartPlugins = [pluginDataLabels];

     public barChartData: ChartDataSets[] = [
       // { data: [65], label: 'Series A' },
       // { data: [28], label: 'Series B' }
     ];

     barChartDataList:ChartDataSets[][];

     public lineChartColors: Color[] = [
       { // red
         backgroundColor: 'rgba(255,0,0,0.3)',
         borderColor: 'red',
         pointRadius:0,
         pointBackgroundColor: 'rgba(148,159,177,1)',
         pointBorderColor: '#fff',
         pointHoverBackgroundColor: '#fff',
         pointHoverBorderColor: 'rgba(148,159,177,0.8)'
       }
     ];
     public lineChartLegend = true;
     public lineChartType = 'line';
     public lineChartPlugins = [pluginAnnotations];

     multi :any;

     channel1:string;
     channel2:string;

     computeCrossCorrelationFlag:boolean;
     computePACFlag:boolean;
     computePLVFlag:boolean;

     // @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;
    onSelect(event) {
      console.log(event);
    }

    ngOnDestroy(){
        this.sub.unsubscribe();
        this.sub2.unsubscribe();

        // window.clearTimeOut(this.timeOutVar);
    }

    ngAfterViewInit() {
    }

    setChannel1(value){
      this.channel1 = value;
    } // end method

    setChannel2(value){
      this.channel2 = value;
    } // end method

    setAutoIncrementFlag(){
      if(!this.autoIncrementFlag ){
        this.autoIncrementFlag  = true;
        this.justSubmittedFlag  = true;
      }
      else{
        this.autoIncrementFlag  = false;
        this.justSubmittedFlag  = false;
      }
    } // end method

    submitAnalysis(event:any){
      let selectedChannels = [];
      for (let i = 0; i < this.channelObjs.length; i++){
        if(this.channelObjs[i].isSelected) {
          selectedChannels.push(this.channelObjs[i].channelLabel);
        }
      }
      console.log ( "this.analysisDetail.upperTimeLimit = " + this.upperTimeLimit);

      // this.sub2 = Observable.interval(3000)
      // //   .subscribe((val) => {
      //
      //     this.lowerTimeLimit += this.counter;
      //     this.upperTimeLimit += this.counter;
      //
      //     this.counter += 1000;

      this.analysisDetailService.submitAnalysis( this.datafile.samplingFrequency, this.analysisDetail.timeBandWidth, this.analysisDetail.numTapers, this.analysisDetail.stepSize, this.analysisDetail.timeWindow,
         this.analysisDetail.lowerFrequency, this.analysisDetail.upperFrequency, selectedChannels, this.analysisDetail.uploadFolder.id, this.upperTimeLimit, this.lowerTimeLimit,
         this.computePSDFlag, this.computeCrossCorrelationFlag, this.computePACFlag, this.computePLVFlag, this.channel1, this.channel2,this.analysisDetail.pacParams.lcut, this.analysisDetail.pacParams.hcut, this.analysisDetail.pacParams.rippleDB, this.analysisDetail.pacParams.bandWidth, this.analysisDetail.pacParams.attenHz
       ).then((uploadFolderSubmitObj) =>
      {

          this.message = "Job Submitted";

      });

      // });
    }
    reSubmitAnalysis(){
      let selectedChannels = [];
      for (let i = 0; i < this.channelObjs.length; i++){
        if(this.channelObjs[i].isSelected) {
          selectedChannels.push(this.channelObjs[i].channelLabel);
        }
      }
      console.log ( " resubmitting analysis ");

      console.log ( "this.analysisDetail.upperTimeLimit = " + this.upperTimeLimit);

      // this.sub2 = Observable.interval(3000)
      //   .subscribe((val) => {

          this.lowerTimeLimit += this.analysisDetail.stepSize;
          this.upperTimeLimit += this.analysisDetail.stepSize;

          // this.counter += 2;

      this.analysisDetailService.reSubmitAnalysis( this.datafile.samplingFrequency, this.analysisDetail.timeBandWidth, this.analysisDetail.numTapers, this.analysisDetail.stepSize, this.analysisDetail.timeWindow,
         this.analysisDetail.lowerFrequency, this.analysisDetail.upperFrequency, selectedChannels, this.analysisDetail.uploadFolder.id, this.upperTimeLimit, this.lowerTimeLimit,
         this.computePSDFlag,this.computeCrossCorrelationFlag, this.computePACFlag, this.computePLVFlag, this.analysisDetail.channel1, this.analysisDetail.channel2,
         this.analysisDetail.pacParams.lcut, this.analysisDetail.pacParams.hcut, this.analysisDetail.pacParams.rippleDB, this.analysisDetail.pacParams.bandWidth, this.analysisDetail.pacParams.attenHz
       ).then((uploadFolderSubmitObj) =>
      {

          this.message = "Job Submitted";

      });

      // });
    }

    showHideFilters(){
      if(this.showFiltersFlag ){
        this.showFiltersFlag  = false;
      }
      else{
        this.showFiltersFlag  = true;
      }// if flag
    } // end method

    sliderValueChange(value: number): void {

      this.reloadingGraphMessage = " Reloading graph ";

      setTimeout(() => {        this.reloadingGraphMessage = ""; }, 2000);

    }

    ngOnInit() {
      this.route.paramMap.subscribe(params => {
        this.fileId = (params.get("fileId")).toString();
        this.message = "";
      });
      this.justSubmittedFlag = false;
      this.innerPadding = 0;
      this.initFlag = true;
      this.computePSDFlag = false;
      this.autoIncrementFlag = false;
      // this.selectedChannelIds = ['13'];
      this.selectedChannelIds = [];
      this.borderRadius = 0;
      this.lowerTimeLimit = 10;
      this.upperTimeLimit = 50;
      this.barChartDataList = [];
      this.beginTime = 0;
      this.endTime = 10;
      this.showFiltersFlag = false;
      this.showRawDataFlag= true;
      this.showPsdFlag= true;
      this.showSpectrogramFlag= true;
      this.showPacFlag= true;
      this.showPlvFlag= true;

      this.activeTabTitle = "Raw_Data";
      this.statusColor='#EDF59A';
      this.firstLoad = true;
      this.counter = 0;

      this.psdImagePaths = [];
      // this.spectrogramCharts = [];
      this.lineChartData = [];
      this.spectrogramImagePaths = [];
      this.psdLineChartData = [];

      this.channel1 = "";
      this.channel2 = "";

      this.computeCrossCorrelationFlag = false;
      this.computePACFlag = false;
      this.computePLVFlag = false;

      let spectrogramTitle = "spectrogram";

      this.getAnalysisDetail();

      this.sub = Observable.interval(5000)
        .subscribe(() => {
            this.autoIncrementSpectra();
        }) ;

      this.sub2 = Observable.interval(5000)
        .subscribe(() => {
            if (this.autoIncrementFlag){
              console.log( " this.justSubmittedFlag " + this.justSubmittedFlag);
              if (this.justSubmittedFlag){
                setTimeout(()=>{}, 2000);
                this.justSubmittedFlag = false;
              }
              this.getAnalysisDetail();
            }
        }) ;

    }

    perc2color(perc) {
      	var r, g, b = 0;
      	if(perc < 50) {
      		r = 255;
      		g = Math.round(5.1 * perc);
      	}
      	else {
      		g = 255;
      		r = Math.round(510 - 5.10 * perc);
      	}
	     var h = r * 0x10000 + g * 0x100 + b * 0x1;
	     return '#' + ('000000' + h.toString(16)).slice(-6);
    }

    getAnalysisDetail(){

      // this.psdImagePaths = [];
      // this.spectrogramCharts = [];
      // this.lineChartData = [];
      // this.spectrogramImagePaths = [];
      // this.psdLineChartData = [];

      this.analysisDetailService.getAnalysisDetail(this.fileId).then(analysisDetail => {
          console.log("fetched data " + this.firstLoad);
          this.analysisDetail = analysisDetail;
          this.datafile = analysisDetail.uploadFolder;
          this.crossSpectrogramData = analysisDetail.crossSpectrogramData;

          if (this.initFlag){
          } else {
            // console.log(" new psd data " + analysisDetail.analysisResultList[i].psdData);
            this.plvLineChartData["data"] = analysisDetail.plvPlv;
          }

          this.plvLineChartLabels = analysisDetail.plvFgamma;

          console.log (" this.crossSpectrogramData " + this.crossSpectrogramData);
          // console.log (" this.channels " + this.datafile.channelObjs);
          // console.log (" analysisResultList " + analysisDetail);
          this.spectrogramDataList = [];

          for (let i = 0; i< analysisDetail.analysisResultList.length; i++){

            if (this.initFlag || this.lineChartData.length == 0){
              this.lineChartData.push ({"data":analysisDetail.analysisResultList[i].rawData, "borderWidth":1,"label":analysisDetail.analysisResultList[i].channelLabel, "fill":false, "pointRadius":0});
            }
            else {
              // console.log (" i " + i + " this.lineChartData ")
              this.lineChartData[i]["data"] = analysisDetail.analysisResultList[i].rawData;
            }

            if (this.initFlag || this.barChartData.length == 0){
              if (i == 0){
              for (let j = 0; j < analysisDetail.analysisResultList[i].bandData.length; j++){
                this.barChartData.push({ data: [analysisDetail.analysisResultList[i].bandData[j]], label: analysisDetail.analysisResultList[i].bandLabels[j] })
              }
            }
            }

            else {
              if (i == 0){
              for (let j = 0; j < analysisDetail.analysisResultList[i].bandData.length; j++){
                this.barChartData[j]["data"] = [analysisDetail.analysisResultList[i].bandData[j]];
              }
              }

            }
              // this.chart.chart.update();
              if (this.initFlag){
              let spectrogramTitle = "Spectrogram for channel " + analysisDetail.analysisResultList[i].channelLabel;
              this.multi = analysisDetail.analysisResultList[i].spectrogramData;
                // this.spectrogramDataList.push(analysisDetail.analysisResultList[i].spectrogramData);
              }
              else{
                // for (let i = 0; i < this.spectrogramCharts.length; i++){
                //   // console.log(" setting sepcrtogram data = " + analysisDetail.analysisResultList[i].spectrogramData);
                //   this.spectrogramCharts[i].options.series[0].data = analysisDetail.analysisResultList[i].spectrogramData;
                //   this.spectrogramCharts[i].update();
                //   }
                // this.spectrogramDataList.push(analysisDetail.analysisResultList[i].spectrogramData);
                //
                this.multi = analysisDetail.analysisResultList[i].spectrogramData;
              }

              // this.spectrogramImagePaths.push( this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,'
              //                  + analysisDetail.analysisResultList[i].spectrogramString) );
              if (this.initFlag){
                this.psdLineChartData.push ({"data":analysisDetail.analysisResultList[i].psdData, "borderWidth":1,"label":analysisDetail.analysisResultList[i].channelLabel, "fill":false, "pointRadius":0});
                this.pacLineChartData.push ({"data":analysisDetail.analysisResultList[i].pacMI, "borderWidth":1,"label":analysisDetail.analysisResultList[i].channelLabel, "fill":false, "pointRadius":0});
                this.plvLineChartData.push ({"data":analysisDetail.plvPlv, "borderWidth":1,"label":analysisDetail.channel1 + "_" + analysisDetail.channel2, "fill":false, "pointRadius":0});
              } else {
                // console.log(" new psd data " + analysisDetail.analysisResultList[i].psdData);
                this.psdLineChartData[i]["data"] = analysisDetail.analysisResultList[i].psdData;
                this.pacLineChartData[i]["data"] = analysisDetail.analysisResultList[i].pacMI;
                this.plvLineChartData[i]["data"] = analysisDetail.plvPlv;
               }

               // if (!this.initFlag){
                 this.charts.forEach((child) => {
                      child.chart.update()
                  });
               // }
              // if (this.initFlag){
              // } else {
              //   console.log(" new pac data " + analysisDetail.analysisResultList[i].pacMI);
              //   this.chart.chart.update();
              // }

          }

          this.lineChartLabels = analysisDetail.analysisResultList[0].rawDataLabels;
          this.psdLineChartLabels = analysisDetail.analysisResultList[0].psdDataLabels;

          // this.pacLineChartLabels = analysisDetail.analysisResultList[0].fGamma;
          // this.pacLineChartLabels = analysisDetail.analysisResultList[0].pacFgamma;
          // this.plvLineChartLabels = analysisDetail.analysisResultList[0].plvFgamma;
          this.pacLineChartLabels = analysisDetail.plvFgamma;
          this.plvLineChartLabels = analysisDetail.plvFgamma;

          this.channelObjs = analysisDetail.channelObjs;

          console.log(" completed " );

          // this.datafile.beginTime = 0;
          // this.datafile.endTime = 301;

          if (this.initFlag){
            this.lowerTimeLimit = 10;
            this.upperTimeLimit = 50;
            this.initFlag = false;
          }
          this.rangeSliderOptions= {
            floor: this.datafile.beginTime,
            ceil: this.datafile.endTime
          };

        });

    }

    autoIncrementSpectra(){
      if (this.autoIncrementFlag){

        this.reSubmitAnalysis();

      }
    }

    constructor( private analysisDetailService: AnalysisDetailService,
                 private route: ActivatedRoute,
                 private sanitizer: DomSanitizer,

               ) {
    };
}
