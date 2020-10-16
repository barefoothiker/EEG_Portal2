import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener, ChangeDetectionStrategy} from '@angular/core';
import { BrainViewerService } from './brain-viewer-service';
import { Observable} from 'rxjs';
import { OverlayData, SaliencyData, BarPlotData, BrainData, Region, SaliencyInfo, BrainViewerData, RegionInfo, PredictionData, StatsImageObj } from '../../models/overlayData';
import { UploadFolder} from '../../models/datafile';
import { Comment} from '../../models/comment';
import * as math from 'mathjs'
import * as nifti from "nifti-reader-js"
import { FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { trigger, transition, animate, style } from '@angular/animations'
import { ChartType, ChartDataSets, ChartOptions } from 'chart.js';
import * as Chart from 'chart.js';
import { Color, BaseChartDirective } from 'ng2-charts';
import { ActivatedRoute, Params } from '@angular/router';
import {AppSettings} from '../../app.settings';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HelpModalService } from '../../services/help-modal.service';
import { HelpModalComponent } from '../../help-modal/help-modal.component';
import { CommentModalService } from '../../services/comment-modal.service';
import { CommentModalComponent } from '../../comment-modal/comment-modal.component';
// import { CommentsListComponent } from '../../comments-list/comments-list.component';
import { FullScreenComponent } from '../../full-screen/full-screen.component';
import * as jsPDF from 'jspdf';
// import * as html2canvas from 'html2canvas';
import { WebWorkerService } from 'ngx-web-worker';
// import { BackgroundTask, BackgroundTaskJob } from '../../models/background-task.model';

@Component({
    selector: 'app-display-brain',
    providers: [BrainViewerService, WebWorkerService],
    // providers: [BrainViewerService],

    templateUrl: './brain-viewer.component.html',
    styleUrls: ['./brain-viewer.component.scss'],
    animations: [
        trigger('slideInOut', [
          transition(':enter', [
            style({transform: 'translateX(20%)'}),
            animate('200ms ease-in', style({transform: 'translateX(0%)'}))
          ]),
          transition(':leave', [
            animate('200ms ease-in', style({transform: 'translateX(20%)'}))
          ])
        ])
      ]
})

export class BrainViewerComponent implements OnInit{

  @ViewChild(BaseChartDirective) // for the dynamic charts
  public chart: BaseChartDirective; // Now you can reference your chart via `this.chart`

  // event emitter for changes in modal box
  @Output() commentsListChange = new EventEmitter<Comment[]>();
  // event emitter for slices selected in scrolling to broadcast events outside the event listener
  @Output() sliceNumArrayChange = new EventEmitter<number[]>();
  // event emitter for slices selected in scrolling to broadcast events outside the event listener
  @Output() coordinatesChange = new EventEmitter<number[]>();

  @Output() brightnessContrastArrayChange = new EventEmitter<number[]>();

  public webWorkerResults: any[] = [];
  public webWorkerStart = 35;
  public webWorkerEnd = 45;
  public synchronousStart = 35;
  public synchronousEnd = 38;
  public synchronousResults: any[] = [];
  public synchronousDuration = 0;
  private promises: Promise<any>[] = [];

  // listener for changes in modal box
  commentsListChangeListener = this.commentsListChange.subscribe((comments) => {
      this.comments = comments;
  });

  // listener for changes in slice num array
  sliceNumArrayChangeListener = this.sliceNumArrayChange.subscribe((sliceNumArray) => {
      this.sliceNumArray = sliceNumArray;
      let target:any;
      for(var i = 0; i < (this.imagePrefixes).length; i++){
            target = document.getElementById('target_' + i);
            target.sliceNumArray = sliceNumArray;
            // target.originalSliceNumArray = sliceNumArray;
    } // update divs
  });

  brightnessContrastArrayChangeListener = this.brightnessContrastArrayChange.subscribe((brightnessContrastArray) => {
      this.contrastFactor = brightnessContrastArray[0];
      this.brightnessFactor = brightnessContrastArray[1];
  });

  // listener for changes in coordinates on mouse move or click
  coordinatesChangeListener = this.coordinatesChange.subscribe((coordinates) => {
      // this.xPosition = coordinates[0];
      // this.yPosition = coordinates[1];
      // this.zPosition = coordinates[2];
      this.coordsArray = coordinates;
    //   target.sliceNumArray = sliceNumArray;
    //   let target:any;
    //   for(var i = 0; i < (this.imagePrefixes).length; i++){
    //         target = document.getElementById('target_' + i);
    //         target.sliceNumArray = sliceNumArray;
    //         // target.originalSliceNumArray = sliceNumArray;
    // } // update divs
  });

  // open modal
  openModal(helpType: string) {
    const modalRef = this.modalService.open(HelpModalComponent);
    if (helpType == "helpImageClass"){
      modalRef.componentInstance.name = 'Clicking on the different buttons will load the corresponding images generated as a part of the MRI image processing.';
    }
    else if (helpType == "helpSearchType"){
      modalRef.componentInstance.name = 'Selecting a search type will show comments only for that  type - User, Algorithmically generated, or All.';
    }
    else if (helpType == "helpSaliencyMapSlider"){
      modalRef.componentInstance.name = 'Dynamically adjusts the opactiy of the saliency map.';
    }
    else if (helpType == "helpPDScore"){
      modalRef.componentInstance.name = 'Predicted PD Score.';
    }
    else if (helpType == "helpRoiGraphs"){
      modalRef.componentInstance.name = 'Shows the three graphs at the bottom of the image panels. The graphs will be dynamically generated based on saliency map slider value.';
    }
    else if (helpType == "helpRoiOverlaySlider"){
      modalRef.componentInstance.name = 'Dynamically adjusts opacity of the ROI overlays.';
    }

  }

  // download pdf
  downloadPDF(){
     var doc = new jsPDF();
      // doc.text(50,90,this.problems.length.toString());
      // doc.text(50,100,'page 1')
      // doc.addPage();
      doc.text(50,50,'Snapshot for brain' + this.uploadFolder.name);
      // html2canvas(document.getElementById('allContainer')).then(function(canvas) {
    //   var img = canvas.toDataURL("image/png");
    //   doc.addImage(img, 'JPEG', 10, 10, 200, 270);
    //   doc.save('download.pdf');
    // });
  }

  // tasks: BackgroundTask[] = [];

  @Input()

  overlayData : OverlayData = new OverlayData();
  overlayDataList : OverlayData [];
  selectedSaliencyDataIndex:number;
  mainPanelWidth:number;
  mainPanelHeight:number;
  sidePanelWidth:number;
  sidePanelHeight:number;
  loadingFullScreenMessage:string;
  fileId:string;
  brainData :any;
  roiData :any;
  saliencyData :any;
  uploadFolder :UploadFolder;
  niftiImage: any;
  saliencyInfo: SaliencyInfo;

  allData :BrainData;
  rawLength:number = 0;
  data:any;
  xPosition:number=0;
  yPosition:number=0;
  zPosition:number=0;

  coordsArray:number[];

  imageTypes:string[];
  imagePrefixes:string[];

  shape:number;
  shapeLPI:number;

  mousePress:boolean = false;

  selectedView:number = 0;

  saliencyMapSelected:boolean;
  saliencyMapSliderValue:number = 0;
  roiSliderValue:number = 50;

  disableSaliencySlider:boolean;

  niftiImages = Array();
  niftiHeaders = Array();

  roiNiftiImages = Array();
  roiNiftiHeaders = Array();

  saliencyNiftiImages = Array();
  saliencyNiftiHeaders = Array();
  saliencyDataList = Array();

  canvas:HTMLCanvasElement;
  canvas_saliency:HTMLCanvasElement;
  canvas_comment:HTMLCanvasElement;
  canvas_crossHair:HTMLCanvasElement;
  canvas_coords:HTMLCanvasElement;
  canvas_orientation:HTMLCanvasElement;
  canvas_fullScreen:HTMLCanvasElement;

  target:HTMLElement;
  midSliceNum:number;
  planeSelectionArray:number[];

  selectedImageClass:number = 0;
  imageClasses:string[];

  contrastFactor:number;
  brightnessFactor:number;

  brainViewerData:BrainViewerData;

  width:number = 1;
  identity:any;
  ppvValue:number;
  npvValue:number;

  barPlotDataSets:BarPlotData[];

  totalVoxelsPlotRegions:string[];
  totalVoxelsRegions:string[];
  totalVoxelsColors:string[];
  totalVoxelsRGBAColors:string[];
  totalVoxelsRGBA02Colors:string[];
  totalVoxelsRGBA08Colors:string[];
  totalVoxelsRegionNumbers:string[];

  totalVoxelRegionNames:string[];
  totalVoxelsData:number[][];
  totalVoxelsPlotData:ChartDataSets[]= [];
  totalVoxelsLabels :string[];
  totalVoxelsLabel: string[];

  thresholdProportionalRegions:string[];
  thresholdProportionalColors:string[];
  thresholdProportionalRGBAColors:string[];
  thresholdProportionalRGBA02Colors:string[];
  thresholdProportionalRGBA08Colors:string[];
  thresholdProportionalRegionNumbers:string[];

  thresholdProportionalData:number[][];
  thresholdProportionalPlotData:ChartDataSets[]= [];
  thresholdProportionalLabels:string[];
  thresholdProportionalLabel:string[];

  zmBinRegions:string[];
  zmBinColors:string[];
  zmBinRGBAColors:string[];
  zmBinRGBA02Colors:string[];
  zmBinRGBA08Colors:string[];
  zmBinRegionNumbers:string[];

  zmBinData:number[][];
  zmBinPlotData:ChartDataSets[] = [];
  zmBinRegionsLabel:string[];
  zmBinLabels:string[];
  zmBinLabel:string[];

  totalVoxelsColorsList: Array<any> = [];
  thresholdProportionalColorsList: Array<any> = [];
  zmBinColorsList: Array<any> = [];

  totalVoxelsSelected:boolean;
  thresholdProportionalSelected:boolean;
  zmBinSelected:boolean;

  disableSelection:boolean;
  disableLineChartsSelection:boolean;

  originalScanEnabled:boolean;
  brainExtractionEnabled:boolean;

  roiDataFlag:boolean;
  displayRoiFlag:boolean;
  saliencyDataFlag:boolean;

  imageLoaded_0:boolean;
  imageLoaded_1:boolean;
  imageLoaded_2:boolean;
  comments:Comment[];
  searchText:string;
  regionInfoList:RegionInfo[];

  loadingDataFlag: boolean;
  selectedSaliencyColor:string;
  dropdownList = [];
  selectedRegions = [];
  sliceNumArray:number[];
  midSliceNumArray:number[];
  dropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 5,
    allowSearchFilter: true
    };

  selectedRegionsMap : Map<number, RegionInfo> = new Map<number, RegionInfo>();
  selectedRegionsList : RegionInfo[];
  activeTabTitle:string;
  regionInfoMap : Map<number, RegionInfo> = new Map<number, RegionInfo>();

  boxPlotData:string;
  boxPlotImageData:any;
  boxPlotImagePath:any;

  statsImageObjList:StatsImageObj[];
  corticalThicknessImageObjList:StatsImageObj[];

  regionInfoObj:RegionInfo;
  totalVoxelsLineChartData:number[][];
  thresholdProportionalLineChartData:number[][];
  zmBinLineChartData:number[][];

  totalVoxelsLineChartDataSet:ChartDataSets[];
  thresholdProportionalLineChartDataSet:ChartDataSets[];
  zmBinLineChartDataSet:ChartDataSets[];

  totalVoxelsLineChartLegend:string;
  thresholdProportionalLineChartLegend:string;
  zmBinLineChartLegend:string;

  totalVoxelsLineChartColors:Color[];
  thresholdProportionalLineChartColors:Color[];
  zmBinLineChartColors:Color[];

  lineChartLabels: string[];
  lineChartOptions: (ChartOptions & { annotation: any });
  lineChartColors: Color[];
  lineChartLegend = true;
  lineChartType = 'line';

  fullScreenView:boolean;

  lineChartPlugins = [pluginAnnotations];

  listStyle = {
          width:'300px', //width of the list defaults to 300
          height: '540px', //height of the list defaults to 250
        }
  // for checking if drawing canvas first time
  initFlag:boolean;
  // show hide params panel
  showParamsFlag :boolean;
  showHideCommentsFlag:boolean;
  // check if any regions are selected and show total voxels, threshold coulds, zmbin checkboxes correspondingly
  regionsSelected:boolean;
  defaultButtonColor:string;
  unSelectedDefaultButtonColor:string;
  commentsSelFormGroup:FormGroup;
  commentTypeSel:FormControl;

  commentsFilterButtonColor_0:string;
  commentsFilterButtonColor_1:string;
  commentsFilterButtonColor_2:string;
  commentsAll:Comment[];

  originalScanButtonBackgroundColor:string;
  brainExtractionButtonBackgroundColor:string;

  selectedSaliencyData:number;

  showCrossHairsFlag : boolean;
  showStatsFlag : boolean;
  displaySaliencyFlag : boolean;
  mousePos : any;

  niftiTypedDataList:any[];
  roiTypedDataList:any[];
  saliencyTypedDataList:any[];
  dims:number[];
  predictionDataList:PredictionData[];
  predictionData:PredictionData;

  fullScreenBrainViewerData:BrainViewerData;
  fullScreenOverlayDataList:OverlayData[];
  fullScreenOverlayData:OverlayData;

  fullScreenAllData:BrainData;
  fullScreenBrainData:string;

  fullScreenPredictionDataList:PredictionData[];
  fullScreenPredictionData: PredictionData;

  fullScreenRoiData:string[];
  fullScreenSaliencyDataList:SaliencyData[];
  fullScreenSaliencyData:SaliencyData;
  fullScreenSaliencyInfo:SaliencyInfo;
  fullScreenShape:number;
  fullScreenSaliencyNiftiHeaders = Array();
  fullScreenSaliencyNiftiImages = Array();
  fullScreenNiftiHeaders = Array();
  fullScreenNiftiImages = Array();
  fullScreenRoiNiftiHeaders = Array();
  fullScreenRoiNiftiImages = Array();

  fullScreenNiftiTypedDataList = [];
  fullScreenRoiTypedDataList = [];
  fullScreenSaliencyTypedDataList = [];
  fullScreenDims:number[];
  fullScreenFlag:boolean;
  activeCorticalThicknessTabTitle:string;
  selectedCorticalThicknessIndex:number;
 public barChartOptions: ChartOptions = {
     responsive: true,
     // We use these empty structures as placeholders for dynamic theming.
     scales: { xAxes: [{}], yAxes: [{}] },
     plugins: {
       datalabels: {
         anchor: 'end',
         align: 'end',
       }
     }
   };
 public barPlotOptions: ChartOptions = {
     responsive: true,

     scales: { xAxes: [{
         ticks: {
           beginAtZero: true,
           min: 0,
           max: 100
       },
       gridLines: {
           offsetGridLines: false,
           display: false
        },
       // stacked: true

     }], yAxes: [{
         ticks: {
           beginAtZero: true,
           min: 0,
           max: 100
       },
       gridLines: {
           offsetGridLines: false,
           display: false
        },
       // stacked: true
     }] },

     plugins: {
        datalabels: {
           display: true,
           align: 'center',
           anchor: 'center'
        }
     }
   };


   public barPlotLabels: string[] = [];
   // public barPlotType: ChartType = 'horizontalbar';
   public barPlotType: ChartType = 'horizontalBar';
   public barPlotLegend = true;
   public barPlotData: ChartDataSets[];

   public barChartLabels: string[] = [];
   public barChartType: ChartType = 'bar';
   public barChartLegend = true;
   public barChartData: ChartDataSets[];

   barPlotRegions: string[] = [];
   barPlotValues: ChartDataSets[];

   // convert hex to RGB, as per discussion in https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
   hexToRgb(hex) {
     // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
     var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
     hex = hex.replace(shorthandRegex, function(m, r, g, b) {
       return r + r + g + g + b + b;
     });

     var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
     return result ? {
       r: parseInt(result[1], 16),
       g: parseInt(result[2], 16),
       b: parseInt(result[3], 16)
     } : null;
   }

    ngOnInit() {
      this.route.paramMap.subscribe(params => {
        this.fileId = (params.get("fileId")).toString();
      })

      this.brainViewerService.getOverlayData(this.fileId).then(brainViewerData => {

      });

    }

    constructor( private brainViewerService: BrainViewerService,
                 private sanitizer: DomSanitizer,
                 private route:ActivatedRoute,
                 private modalService: NgbModal,
                 private commentModalService: NgbModal,
                 private fullScreenService: NgbModal,
                 private _elementRef: ElementRef,
                 private helpModalService: HelpModalService,
                 private formBuilder: FormBuilder,
                 // private webWorkerService: WebWorkerService
               ) {
    };

}
