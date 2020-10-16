import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef} from '@angular/core';
import { DatafileDetailService } from './datafile-detail-service';
import { Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Datafile, UploadFolder, UploadFolderSubmitObj, QAObj, Epoch , EpochResultObj, Montage, MontageChannel, ICAMethod, ICAPlotObj} from '../../models/datafile';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Options } from 'ng5-slider';
import { ChartDataSets, ChartType, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
@Component({
    selector: 'list-files',
    providers: [DatafileDetailService],
    templateUrl: './datafile-detail.component.html',
    styleUrls: ['./datafile-detail.component.scss']
})
export class DatafileDetailComponent implements OnInit, OnDestroy{
    @Input()
    showFiltersFlag : boolean;
    datafile : UploadFolder;
    uploadFolderSubmitObj: UploadFolderSubmitObj;
    fileId:any;
    message:string;
    activeTabTitle:string;
    statusColor:string;
    sub:Subscription;
    firstLoad:boolean;
    showHideEpochsFlag:boolean;
    timeBandWidth:number;
    numTapers:number;
    stepSize:number;
    windowSize:number;
    computePSDFlag:boolean;
    computeSpectrogramFlag:boolean;
    computePacFlag:boolean;
    computePlvFlag:boolean;
    selectedChannelQAIds:string[];
    epochList:Epoch[];
    selectedMontageId:number;
    montageChannel1 :string;
    montageChannel2 :string;
    resultChannel:string;
    lineChartIndices :number[];
    selectAllChannelsFlag:boolean;
    selectAllChannelsQAFlag:boolean;
    displayRawTrace:boolean;
    meanOutliers : number[];
    varOutliers : number[];
    meanOutliersZScores : number[];
    varOutliersZScores : number[];
    selectedChannelIds:string[];
    samplingFrequency:number;
    lowerFrequency:number;
    upperFrequency:number;

    lowerTimeLimit:number;
    upperTimeLimit:number;

    lowerQATimeLimit:number;
    upperQATimeLimit:number;

    lowerEpochTimeLimit:number;
    upperEpochTimeLimit:number;

    beginTime:number;
    endTime:number;

    artDataList:number[];
    meanOutliersList:number[];
    selectedICAMethod:string;
    showHideICAFlag:boolean;
    icaMethods:ICAMethod[];
    lowPassFilterFrequency:number;
    highPassFilterFrequency:number;

    rangeSliderOptions: Options = {
      floor: 0,
      ceil: 100
    };

    epochRangeSliderOptions: Options = {
      floor: 0,
      ceil: 100
    };

    lowPassSliderOptions: Options = {
      floor: 0,
      ceil: 100
    };

    highPassSliderOptions: Options = {
      floor: 0,
      ceil: 100
    };

    lowPassFilterFlag:boolean;
    highPassFilterFlag:boolean;

    filterOptions = [
      { 'id': 0, 'name': 'Uploaded', 'selected':false , 'color':'#EDF59A'},
      { 'id': 1, 'name': 'Analysis Submitted', 'selected':false , 'color':'#CBF022'},
      { 'id': 2, 'name': 'Score Calculated', 'selected':false , 'color':'#32FFC8'},
      { 'id': 3, 'name': 'Analysis Completed', 'selected':false , 'color':'#36CBEC'},
    ];

    channel1:string;
    channel2:string;

    computeCrossCorrelationFlag:boolean;
    computePACFlag:boolean;
    computePLVFlag:boolean;

    annotationIndexMap : Map<number, number>;
    epochIdMap : Map<number, number>;

    lcut :number;
    hcut :number;
    rippleDB :number;
    bandWidth :number;
    attenHz :number;
    epochTimePoints:number[];
    channelQAObjs:QAObj[];
    meanOutliersListFlag:boolean;
    artDataListFlag:boolean;
    showEpochsOverlayFlag:boolean;

    showHideMontagesFlag:boolean;

    montage:Montage;
    montageList:Montage[];

    montageChannels:MontageChannel[];

    public lineChartData: ChartDataSets[] = [
    ];

    public icaPlotObjs:ICAPlotObj[];

    public icaPlotData: ChartDataSets[] = [];

    public icaPlotLabels: Label[] = [];

    public lineChartLabels: Label[] = [
    ];

    public lineChartOptions: (ChartOptions & { annotation: any }) = {
      animation: {
        duration: 0, // general animation time
      },
      responsive: true,
      scales: {
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
        ]
      },
      annotation: {
        annotations: [
          //
          // {
          //          type: 'box',
          //          drawTime: 'beforeDatasetsDraw',
          //          xScaleID: 'x-axis-0',
          //          xMin: 60,
          //          xMax: 80,
          //          backgroundColor: 'rgba(0, 255, 0, 0.1)'
          // },
          //
          // {
          //          type: 'box',
          //          drawTime: 'beforeDatasetsDraw',
          //          xScaleID: 'x-axis-0',
          //          xMin: 70,
          //          xMax: 250,
          //          backgroundColor: 'rgba(255, 0, 0, 0.1)'
          //   },

        ],
      },
    };

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

    numQASeconds: number;
    numSecondsRangeSliderOptions: Options = {
      floor: 1,
      ceil: 5
    };

    minOkLength: number;
    minOKLengthRangeSliderOptions: Options = {
      floor: 1,
      ceil: 5
    };

    @ViewChild(BaseChartDirective) // for the dynamic charts
    public chart: BaseChartDirective; // Now you can reference your chart via `this.chart`

    ngOnDestroy(){
        // this.sub.unsubscribe();
    }

    sliderValueQAChange(event:any){
      this.reloadDatafile();
    }

    sliderValueChange(){}

    lowPassSliderValueChange(){}
    highPassSliderValueChange(){}

    selectAllChannels(){

      for (let i = 0; i < this.datafile.channelObjs.length; i++){

          if (this.datafile.channelObjs[i].isSelected){
            this.datafile.channelObjs[i].isSelected = false;
          }
          else {
            this.datafile.channelObjs[i].isSelected = true;
          }

      }

    }

    selectAllQAChannels(){

      for (let i = 0; i < this.datafile.channelQAObjs.length; i++){

          if (this.datafile.channelQAObjs[i].isSelected){
            this.datafile.channelQAObjs[i].isSelected = false;
          }
          else {
            this.datafile.channelQAObjs[i].isSelected = true;
          }

      }

    }

    setChannel1(value){
      this.channel1 = value;
    }

    setChannel2(value){
      this.channel2 = value;
    }

    showHideFilters(){
      if(this.showFiltersFlag ){
        this.showFiltersFlag  = false;
      }
      else{
        this.showFiltersFlag  = true;
      }// if flag
    } // end method

    showHideEpochs(){
      if(this.showHideEpochsFlag ){
        this.showHideEpochsFlag  = false;
      }
      else{
        this.showHideEpochsFlag  = true;
      }// if flag
    } // end method

    showHideMontages(){
      if(this.showHideMontagesFlag ){
        this.showHideMontagesFlag = false;
      }
      else{
        this.showHideMontagesFlag = true;
      }// if flag
    } // end method

    showHideICA(){
      if(this.showHideICAFlag ){
        this.showHideICAFlag = false;
      }
      else{
        this.showHideICAFlag = true;
      }// if flag
    } // end method

    setICAMethod(icaMethod){
      this.selectedICAMethod = icaMethod;
    }

    removeEpoch(epochId){

      // this.annotationIndexMap.set(this.epochTimePoints[i], this.lineChartOptions.annotation["annotations"].length);
      // this.epochIdMap.set(this.upperQATimeLimit + '-' + this.lowerQATimeLimit, this.epochTimePoints[i]);

      for (let i = 0; i < this.epochTimePoints.length; i++){

        var key = this.annotationIndexMap.get(this.epochTimePoints[i])
        // console.log(this.annotationIndexMap);
        // const index = this.lineChartOptions.annotation["annotations"].indexOf(key, 0);
        // console.log( index);
        // if (index > -1) {
          // console.log( " ****** " + index );
        this.lineChartOptions.annotation["annotations"] = [];
        // if (this.chart){
        //   this.chart.chart.update();
        // }
        // this.lineChartOptions.annotation["annotations"].splice(key, 1);
         // }

      }

      this.datafileDetailService.removeEpoch(this.fileId, epochId ).then(epochResultObj => {
        // console.log(epochList);
        // console.log(epochResultObj);
        this.epochList  = epochResultObj.epochs;
        // console.log(this.epochList);
        this.epochTimePoints = epochResultObj.epochTimePoints;

        // if(this.showEpochsOverlayFlag){
        //
        //   for (let i = 0; i< this.epochTimePoints.length; i++){
        //     this.lineChartOptions.annotation["annotations"].push(
        //       {
        //                type: 'box',
        //                drawTime: 'beforeDatasetsDraw',
        //                xScaleID: 'x-axis-0',
        //                xMin: this.epochTimePoints[i],
        //                xMax: this.epochTimePoints[i]+3,
        //                backgroundColor: 'rgba(159, 188, 220, 0.5)'
        //         },
        //
        //     );
        //   }
        //
        // }

      });
    }

    addEpoch(event:any){
      this.datafileDetailService.addEpoch(this.fileId, this.lowerEpochTimeLimit, this.upperEpochTimeLimit ).then(epochList => {
        console.log("  after added epochList " + epochList["epochs"]);
        this.epochList  = epochList["epochs"];
        this.reloadDatafile();

      });
    }

    submitICA(event:any){
      this.datafileDetailService.submitICA(this.fileId, this.lowPassFilterFlag, this.lowPassFilterFrequency, this.highPassFilterFlag, this.highPassFilterFrequency ).then(icaPlotObj => {
        this.icaPlotObjs  = icaPlotObj;
      });
    }

    addMontage(){
      this.datafileDetailService.addMontage(this.montage.name).then(montages => {
        this.montageList  = montages["montageList"];
      });
    }

    addMontageChannel(){
      this.datafileDetailService.addMontageChannel(this.montage.id, this.montageChannel1, this.montageChannel2 , this.resultChannel ).then(montage => {
        this.montage  = montage;
        this.montageChannel1 = '';
        this.montageChannel2 = '';
        this.resultChannel = '';
      });
    }

    removeMontage(montageId){
      this.datafileDetailService.removeMontage(montageId).then(montages => {
        this.montageList  = montages["montageList"];
      });
    }

    removeMontageChannel(montageChannelId){
      this.datafileDetailService.removeMontageChannel(montageChannelId).then(montage => {
        this.montage  = montage;
      });
    }

    selectMontage(){
      this.datafileDetailService.getMontage(this.selectedMontageId).then(montage => {
        this.montage  = montage;
      });

      this.montage.montageChannels = [];

    }

    setMontageChannel1(montageChannelLabel){
      this.montageChannel1 = montageChannelLabel;
      this.resultChannel = this.montageChannel1 + ' - ' + this.montageChannel2;
    }

    setMontageChannel2(montageChannelLabel){
      this.montageChannel2 = montageChannelLabel;
      this.resultChannel = this.montageChannel1 + ' - ' + this.montageChannel2;
    }

    updateEpochDescription(epochId){
      console.log(" in update");
    }

    reloadDatafile(){
      this.displayRawTrace = false;

      // console.log (" reloading ");

      let selectedChannelQAIds = [];

      for (let i = 0; i < this.datafile.channelObjs.length; i++){
        if(this.datafile.channelQAObjs[i].isSelected) {
          selectedChannelQAIds.push(this.datafile.channelQAObjs[i].channelLabel);
        }
      }
      // console.log(selectedChannelQAIds);

      this.datafileDetailService.reloadDatafile(this.fileId, selectedChannelQAIds, this.upperQATimeLimit, this.lowerQATimeLimit).then(datafile => {

        this.channelQAObjs = datafile.channelQAObjs;

        this.lineChartData = [];

        this.epochTimePoints = datafile.epochTimePoints;

        this.artDataList = datafile.artDataList;

        this.meanOutliersList = datafile.meanOutliersList;

        // this.epochList = datafile.epochList;

        // console.log( " this.meanOutliersList " + this.meanOutliersList);

        if(this.showEpochsOverlayFlag){

          for (let i = 0; i< this.epochTimePoints.length; i++){
            this.lineChartOptions.annotation["annotations"].push(
              {
                       type: 'box',
                       drawTime: 'beforeDatasetsDraw',
                       xScaleID: 'x-axis-0',
                       xMin: this.epochTimePoints[i],
                       xMax: this.epochTimePoints[i]+3,
                       backgroundColor: 'rgba(159, 188, 220, 0.5)'

                },

            );

            this.annotationIndexMap.set(this.epochTimePoints[i], this.lineChartOptions.annotation["annotations"].length);
            // this.epochIdMap.set(this.upperQATimeLimit + '-' + this.lowerQATimeLimit, this.epochTimePoints[i]);

          }

        }

        if(this.artDataListFlag){

          for (let i = 0; i< this.artDataList.length; i++){
            this.lineChartOptions.annotation["annotations"].push(
              {
                       type: 'box',
                       drawTime: 'beforeDatasetsDraw',
                       xScaleID: 'x-axis-0',
                       xMin: this.artDataList[i],
                       xMax: this.artDataList[i]+3,
                       backgroundColor: 'rgba(226, 119, 34, 0.5)'
                },

            );

             this.annotationIndexMap.set(this.artDataList[i], this.lineChartOptions.annotation["annotations"].length);

          }

        }

        if(this.meanOutliersListFlag){

          for (let i = 0; i< this.meanOutliersList.length; i++){
            this.lineChartOptions.annotation["annotations"].push(
              {
                       type: 'box',
                       drawTime: 'beforeDatasetsDraw',
                       xScaleID: 'x-axis-0',
                       xMin: this.meanOutliersList[i],
                       xMax: this.meanOutliersList[i]+3,
                       backgroundColor: 'rgba(188, 219, 34, 0.5)'
                },

            );

             this.annotationIndexMap.set(this.meanOutliersList[i], this.lineChartOptions.annotation["annotations"].length);

          }

        }

        for (let i = 0; i< this.channelQAObjs.length; i++){

          this.lineChartData.push ({"data":this.channelQAObjs[i].rawData, "borderWidth":1,"label":this.channelQAObjs[i].channelLabel, "fill":false, "pointRadius":0});

          this.varOutliers = this.channelQAObjs[i].varOutliers;

          this.meanOutliersZScores = this.channelQAObjs[i].meanOutliersZScores;
          // console.log(this.meanOutliersZScores);
          this.varOutliersZScores = this.channelQAObjs[i].varOutliersZScores;
          // console.log(this.varOutliersZScores);
          //
          // for (let i = 0; i< this.varOutliers.length; i++){
          //   this.lineChartOptions.annotation["annotations"].push(
          //     {
          //              type: 'box',
          //              drawTime: 'beforeDatasetsDraw',
          //              xScaleID: 'x-axis-0',
          //              xMin: this.varOutliers[i],
          //              xMax: this.varOutliers[i]+3,
          //              backgroundColor: 'rgba(226, 119, 34, 0.5)'
          //       },
          //
          //   );
          // }
          //
          // for (let i = 0; i< this.meanOutliersZScores.length; i++){
          //   if ( i < 10 ){console.log(this.meanOutliersZScores[i])};
          //
          //   this.lineChartOptions.annotation["annotations"].push(
          //     {
          //              type: 'box',
          //              drawTime: 'beforeDatasetsDraw',
          //              xScaleID: 'x-axis-0',
          //              xMin: this.meanOutliersZScores[i],
          //              xMax: this.meanOutliersZScores[i]+3,
          //              backgroundColor: 'rgba(6, 219, 234, 0.9)'
          //       },
          //
          //   );
          // }

        }

        if (this.channelQAObjs.length > 0) {
          this.lineChartLabels = this.channelQAObjs[0].rawDataLabels;
          this.displayRawTrace = true;
        }

      });
    }

    ngOnInit() {

      this.route.paramMap.subscribe(params => {
        this.fileId = (params.get("fileId")).toString();
        this.message = "";

      });

      this.selectedICAMethod = 'FAST ICA';

      this.showHideICAFlag = false;

      this.icaMethods = [];

      let fastICAMethod = new ICAMethod();
      fastICAMethod.methodName = 'FAST ICA';
      this.icaMethods.push(fastICAMethod);

      let pcaMethod = new ICAMethod();
      pcaMethod.methodName = 'PCA';
      this.icaMethods.push(pcaMethod);

      this.lowPassFilterFlag = false;
      this.highPassFilterFlag = false;

      this.lowPassFilterFrequency = 99;
      this.highPassFilterFrequency = 1;

      this.montageChannel1 = '';
      this.montageChannel2 = '';

      this.resultChannel = '';

      this.montageList = [];

      this.showHideMontagesFlag = false;

      this.montage = new Montage();
      this.montageChannels = [];

      this.annotationIndexMap = new Map<number, number>();
      this.epochIdMap = new Map<number, number>();

      this.lineChartIndices = [];

      this.meanOutliersListFlag = true;
      this.artDataListFlag = true;
      this.showEpochsOverlayFlag = true;

      this.artDataList = [];
      this.meanOutliersList = [];

      this.epochTimePoints = [];

      this.showHideEpochsFlag = false;

      this.epochList  = [];
      this.displayRawTrace = false;

      this.selectedChannelQAIds = [];

      this.selectAllChannelsQAFlag = false;

      this.computeCrossCorrelationFlag = false;
      this.computePACFlag = false;
      this.computePLVFlag = false;

      this.channel1= '';
      this.channel2= '';

      this.computeSpectrogramFlag = true;
      this.computePSDFlag = true;

      this.selectAllChannelsFlag = true;
      this.activeTabTitle = "Metadata";
      this.statusColor='#EDF59A';
      this.firstLoad = true;
      this.lowerFrequency = 0;
      this.upperFrequency = 100;
      this.samplingFrequency = 0;

      this.timeBandWidth = 2;
      this.numTapers = 5;
      this.stepSize = 2;
      this.windowSize = 3;

      this.lcut = 9;
      this.hcut = 13;
      this.rippleDB = 40;
      this.bandWidth = 20;
      this.attenHz = 4;

      this.meanOutliers = [];
      this.varOutliers = [];

      this.numQASeconds = 2;
      this.minOkLength = 2;

      this.epochList = [];

      this.datafileDetailService.getDatafile(this.fileId).then(datafile => {
          console.log("fetched data " + this.firstLoad);
          if (this.firstLoad){
            this.datafile = datafile;
            this.montageList = datafile.montageList;
            this.samplingFrequency = this.datafile.samplingFrequency;

            this.firstLoad = false;
          }
          else{
            this.datafile.logs = datafile.logs;
          }
          this.firstLoad = false;
          if ( this.datafile.status == "Uploaded" ) {
            this.activeTabTitle = "Analysis_Submit";
          }
          if ( this.datafile.status == "Analysis Submitted" ) {
            this.statusColor = this.datafile.rowColor;
          }

          this.lowerTimeLimit = datafile.beginTime;
          this.upperTimeLimit = datafile.endTime;
          this.showFiltersFlag = false;
          this.lowerQATimeLimit = datafile.beginTime;
          this.upperQATimeLimit = datafile.endTime;

          this.lowerEpochTimeLimit = datafile.beginTime;
          this.upperEpochTimeLimit = datafile.endTime;

          this.epochList = datafile.epochList;

          this.rangeSliderOptions= {
            floor: datafile.beginTime,
            ceil: datafile.endTime
          };

          this.epochRangeSliderOptions= {
            floor: datafile.beginTime,
            ceil: datafile.endTime
          };

          this.lineChartOptions.annotation["annotations"] = [
          //
          // {
          //          type: 'box',
          //          drawTime: 'beforeDatasetsDraw',
          //          xScaleID: 'x-axis-0',
          //          xMin: 60,
          //          xMax: 80,
          //          backgroundColor: 'rgba(0, 255, 0, 0.1)'
          // },
          //
          // {
          //          type: 'box',
          //          drawTime: 'beforeDatasetsDraw',
          //          xScaleID: 'x-axis-0',
          //          xMin: 250,
          //          xMax: 320,
          //          backgroundColor: 'rgba(0, 0, 255, 0.1)'
          //   },
          ];

      });
    }
    submitAnalysis(event:any){
      let selectedChannels = [];
      for (let i = 0; i < this.datafile.channelObjs.length; i++){
        if(this.datafile.channelObjs[i].isSelected) {
          selectedChannels.push(this.datafile.channelObjs[i].channelLabel);
        }
      }
      this.datafileDetailService.submitAnalysis(this.datafile.analysisProtocol,  this.samplingFrequency, this.timeBandWidth, this.numTapers, this.stepSize, this.windowSize, this.lowerFrequency, this.upperFrequency,
        this.computeSpectrogramFlag, selectedChannels, this.datafile.id, this.upperTimeLimit, this.lowerTimeLimit, this.computePSDFlag,this.computeCrossCorrelationFlag, this.computePACFlag, this.computePLVFlag, this.channel1, this.channel2,
        this.lcut, this.hcut, this.rippleDB, this.bandWidth, this.attenHz ).then((uploadFolderSubmitObj) =>
      {

          this.message = "Job Submitted";

      }
      );
    }

    constructor( private datafileDetailService: DatafileDetailService,
                 private route: ActivatedRoute,
               ) {
    };
}
