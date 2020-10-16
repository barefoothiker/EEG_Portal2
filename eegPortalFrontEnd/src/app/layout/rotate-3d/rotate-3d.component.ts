import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener, ChangeDetectionStrategy} from '@angular/core';
import { Rotate3DService } from './rotate-3d-service';
import { Observable} from 'rxjs';
import { OverlayData, BarPlotData, BrainData, Region, SaliencyInfo, BrainViewerData, RegionInfo } from '../../models/overlayData';
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
import * as jsPDF from 'jspdf';
import * as html2canvas from 'html2canvas';

@Component({
    selector: 'app-rotate-3d',
    providers: [Rotate3DService],
    templateUrl: './rotate-3d.component.html',
    styleUrls: ['./rotate-3d.component.scss'],
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

export class Rotate3DComponent implements OnInit{

  @ViewChild(BaseChartDirective) // for the dynamic charts
  public chart: BaseChartDirective; // Now you can reference your chart via `this.chart`

  // event emitter for changes in modal box
  @Output() commentsListChange = new EventEmitter<Comment[]>();
  // event emitter for slices selected in scrolling to broadcast events outside the event listener
  @Output() sliceNumArrayChange = new EventEmitter<number[]>();
  // event emitter for slices selected in scrolling to broadcast events outside the event listener
  @Output() coordinatesChange = new EventEmitter<number[]>();

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
      html2canvas(document.getElementById('allContainer')).then(function(canvas) {
      var img = canvas.toDataURL("image/png");
      doc.addImage(img, 'JPEG', 10, 10, 200, 270);
      doc.save('download.pdf');
    });
  }

  @Input()

  overlayData : OverlayData = new OverlayData();
  overlayDataList : OverlayData [];

  mainPanelWidth:number;
  mainPanelHeight:number;
  sidePanelWidth:number;
  sidePanelHeight:number;

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

  threedArray:number[][][] ;

  shape:number;
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

  canvas:HTMLCanvasElement;
  canvas_saliency:HTMLCanvasElement;
  canvas_comment:HTMLCanvasElement;
  canvas_crossHair:HTMLCanvasElement;
  canvas_coords:HTMLCanvasElement;
  canvas_orientation:HTMLCanvasElement;

  target:HTMLElement;
  midSliceNum:number;
  planeSelectionArray:number[];

  selectedImageClass:number = 0;
  imageClasses:string[];

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

  thresholdProportionalRegions:string[];
  thresholdProportionalColors:string[];
  thresholdProportionalRGBAColors:string[];
  thresholdProportionalRGBA02Colors:string[];
  thresholdProportionalRGBA08Colors:string[];
  thresholdProportionalRegionNumbers:string[];

  thresholdProportionalData:number[][];
  thresholdProportionalPlotData:ChartDataSets[]= [];
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
  corticalThicknessEnabled:boolean;
  warpedImageEnabled:boolean;

  roiDataFlag:boolean;
  saliencyDataFlag:boolean;

  pdScore:number;

  imageLoaded_0:boolean;
  imageLoaded_1:boolean;
  imageLoaded_2:boolean;
  comments:Comment[];
  searchText:string;
  regionInfoList:RegionInfo[];

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
  regionInfoMap : Map<number, RegionInfo> = new Map<number, RegionInfo>();

  boxPlotData:string;
  boxPlotImageData:any;
  boxPlotImagePath:any;

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

 commentsSelFormGroup:FormGroup;
 commentTypeSel:FormControl;

 commentsFilterButtonColor_0:string;
 commentsFilterButtonColor_1:string;
 commentsFilterButtonColor_2:string;
 commentsAll:Comment[];

 originalScanButtonBackgroundColor:string;
 brainExtractionButtonBackgroundColor:string;
 corticalThicknessButtonBackgroundColor:string;
 warpedImageButtonBackgroundColor:string;

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
     scales: { xAxes: [{}], yAxes: [{}] },
     plugins: {
       datalabels: {
         anchor: 'end',
         align: 'end',
       }
     }
   };

   public barPlotLabels: string[] = [];
   public barPlotType: ChartType = 'bar';
   public barPlotLegend = true;
   public barPlotData: ChartDataSets[];

   public barChartLabels: string[] = [];
   public barChartType: ChartType = 'bar';
   public barChartLegend = true;
   public barChartData: ChartDataSets[];

   barPlotRegions: string[] = [];
   barPlotValues: ChartDataSets[];

 initialise3dArray(){
   let threedArrayInner1 : number[][];
   let threedArrayInner2 : number[];

    for (let i = 0; i< 10; i++) {
      threedArrayInner1 = [];
      for (let j = 0; j< 10; j++) {
        threedArrayInner2 = [];
        for (let k = 0; k< 10; k++) {
          threedArrayInner2.push(k);
        }
        threedArrayInner1.push(threedArrayInner2);
      }
      this.threedArray.push(threedArrayInner1);
    }
    console.log(" this.threedArray " + this.threedArray);
 }
 showCommentDetails(comment:Comment, event:any) {

  event.preventDefault();
  event.stopPropagation();

  const commentModalRef = this.commentModalService.open(CommentModalComponent);

  commentModalRef.componentInstance.imageClass = this.selectedImageClass;
  commentModalRef.componentInstance.uploadFolder = this.uploadFolder;

  const sub = commentModalRef.componentInstance.saveEvent.subscribe(() => {
     this.rotate3dService.fetchAllComments(this.uploadFolder.id).then(comments => {
       this.comments = comments;

       for (let i = 0; i< this.imagePrefixes.length; i++){

          var canvas_comment = document.getElementById('canvas_comment_' + i ) as HTMLCanvasElement;
          var canvas = document.getElementById('canvas_' + i ) as HTMLCanvasElement;
          var canvas_saliency = document.getElementById('canvas_saliency_' + i ) as HTMLCanvasElement;
          var canvas_coords = document.getElementById('canvas_coords_' + i ) as HTMLCanvasElement;
          var canvas_orientation = document.getElementById('canvas_orientation_' + i ) as HTMLCanvasElement;
          var canvas_crossHair = document.getElementById('canvas_crossHair_' + i ) as HTMLCanvasElement;

          var target = document.getElementById('target_' + i );

          this.drawCanvas(canvas, canvas_saliency, canvas_comment, canvas_coords, canvas_orientation, canvas_crossHair, this.shape, target, this.selectedView, i,  this.sliceNumArray, this.niftiHeaders[i], this.niftiImages[i], this.roiNiftiHeaders[i], this.roiNiftiImages[i], this.saliencyNiftiHeaders[i], this.saliencyNiftiImages[i], this.saliencyMapSelected, this.saliencyMapSliderValue , this.roiSliderValue, this.selectedRegions, this.planeSelectionArray, this.coordsArray, this.regionInfoMap, this.comments, this.initFlag);

        } // draw all 3 panels

        console.log(" listened to change in modal");
        this.commentsListChange.emit(this.comments);
        this.sliceNumArrayChange.emit(this.sliceNumArray);

     });
     console.log(" subscription to event ")
   });
   commentModalRef.componentInstance.allowAddComment = false;

   commentModalRef.componentInstance.xPosition = comment.xPosition;
   commentModalRef.componentInstance.yPosition = comment.yPosition;
   commentModalRef.componentInstance.zPosition = comment.zPosition;

   commentModalRef.componentInstance.commentsList = [comment] ;
   this.mousePress=false;

  }

  filterComments(commentTypeVal){
    this.comments = [];

    if (commentTypeVal == 2){
      this.comments = this.commentsAll;

      this.commentsFilterButtonColor_0 = "#609FA7";
      this.commentsFilterButtonColor_1 = "#609FA7";
      this.commentsFilterButtonColor_2 = "#478B93";

    }
    else {
      for (let i = 0; i < this.commentsAll.length; i++ ){
        if (commentTypeVal == 0 && this.commentsAll[i].userOrAlgorithm == "0"){
          this.comments.push(this.commentsAll[i]);

          this.commentsFilterButtonColor_0 = "#478B93";
          this.commentsFilterButtonColor_1 = "#609FA7";
          this.commentsFilterButtonColor_2 = "#609FA7";

        } // end if
        else if (commentTypeVal == 1 && this.commentsAll[i].userOrAlgorithm == "1"){
          this.comments.push(this.commentsAll[i]);

          this.commentsFilterButtonColor_0 = "#609FA7";
          this.commentsFilterButtonColor_1 = "#478B93";
          this.commentsFilterButtonColor_2 = "#609FA7";

        } // end if
      } // end for
    }
  } // end method

  showHideParams(){
    if(this.showParamsFlag ){
      this.showParamsFlag  = false;
    }
    else{
      this.showParamsFlag  = true;
    }// if flag
  } // end method

  showHideComments(){
    if(this.showHideCommentsFlag ){
      this.showHideCommentsFlag  = false;
    }
    else{
      this.showHideCommentsFlag  = true;
    }// if flag
  }

  gotoCenter(){

    this.sliceNumArray = [Math.round(this.shape/2),Math.round(this.shape/2),Math.round(this.shape/2)];
    console.log(" in go to center = " + this.sliceNumArray);
    this.xPosition = this.midSliceNum;
    this.yPosition = this.midSliceNum;
    this.zPosition = this.midSliceNum;

    for(var i = 0; i < (this.imagePrefixes).length; i++){
      let target:any;

      this.canvas = document.getElementById('canvas_' + i) as HTMLCanvasElement;
      this.canvas_saliency = document.getElementById('canvas_saliency_' + i) as HTMLCanvasElement;
      this.canvas_comment = document.getElementById('canvas_comment_' + i) as HTMLCanvasElement;
      this.canvas_coords = document.getElementById('canvas_coords_' + i) as HTMLCanvasElement;
      this.canvas_orientation = document.getElementById('canvas_orientation_' + i) as HTMLCanvasElement;

      this.target = document.getElementById('target_' + i);

      target = document.getElementById('target_' + i);
      target.selectedRegions = this.selectedRegions;
      target.sliceNumArray = this.sliceNumArray;

      // draw canvas
      this.drawCanvas(this.canvas, this.canvas_saliency, this.canvas_comment, this.canvas_coords, this.canvas_orientation, this.canvas_crossHair, this.shape, this.target, this.selectedView, i, this.sliceNumArray, this.niftiHeaders[i], this.niftiImages[i], this.roiNiftiHeaders[i], this.roiNiftiImages[i], this.saliencyNiftiHeaders[i], this.saliencyNiftiImages[i], this.saliencyMapSelected, this.saliencyMapSliderValue , this.roiSliderValue, this.selectedRegions, this.planeSelectionArray, this.coordsArray, this.regionInfoMap, this.comments, this.initFlag);

    }// end for different planes

  }// end method

  // handler for comment goto click
  gotoComment(comment:Comment){

    for(var i = 0; i < (this.imagePrefixes).length; i++){
      let target:any;

      this.canvas = document.getElementById('canvas_' + i) as HTMLCanvasElement;
      this.canvas_saliency = document.getElementById('canvas_saliency_' + i) as HTMLCanvasElement;
      this.canvas_comment = document.getElementById('canvas_comment_' + i) as HTMLCanvasElement;
      this.canvas_coords = document.getElementById('canvas_coords_' + i) as HTMLCanvasElement;
      this.canvas_orientation = document.getElementById('canvas_orientation_' + i) as HTMLCanvasElement;

      this.target = document.getElementById('target_' + i);

      target = document.getElementById('target_' + i);
      target.selectedRegions = this.selectedRegions;
      if ( this.planeSelectionArray[i] == 0 ){
        this.sliceNumArray[i] = +comment.zPosition;
      } else if ( this.planeSelectionArray[i] == 1 ){
        this.sliceNumArray[i] = this.shape - (+comment.yPosition);
      } else if ( this.planeSelectionArray[i] == 2 ){
        this.sliceNumArray[i] = this.shape - (+comment.xPosition);
      }
      // draw canvas
      this.drawCanvas(this.canvas, this.canvas_saliency, this.canvas_comment, this.canvas_coords, this.canvas_orientation, this.canvas_crossHair,this.shape, this.target, this.selectedView, i, this.sliceNumArray, this.niftiHeaders[i], this.niftiImages[i], this.roiNiftiHeaders[i], this.roiNiftiImages[i], this.saliencyNiftiHeaders[i], this.saliencyNiftiImages[i], this.saliencyMapSelected, this.saliencyMapSliderValue , this.roiSliderValue, this.selectedRegions, this.planeSelectionArray,this.coordsArray, this.regionInfoMap, this.comments, this.initFlag);

    }// end for different planes

  }// end method

  // handler for show hide comment click
  showHideComment(comment:Comment){
    // set comment show hide flag in comments array
    for (var i = 0; i < this.comments.length; i++) {
      if (this.comments[i].commentId == comment.commentId) {
        if (this.comments[i].showHideFlag == "0"){
          this.comments[i].showHideFlag = "1";
        }
        else if (this.comments[i].showHideFlag == "1"){
          this.comments[i].showHideFlag = "0";
        }
      }
    }

    // set comment show hide flag in comments array
    for(var i = 0; i < (this.imagePrefixes).length; i++){
      let target:any;

      this.canvas = document.getElementById('canvas_' + i) as HTMLCanvasElement;
      this.canvas_saliency = document.getElementById('canvas_saliency_' + i) as HTMLCanvasElement;
      this.canvas_comment = document.getElementById('canvas_comment_' + i) as HTMLCanvasElement;
      this.canvas_coords = document.getElementById('canvas_coords_' + i) as HTMLCanvasElement;
      this.canvas_orientation = document.getElementById('canvas_orientation_' + i) as HTMLCanvasElement;

      this.target = document.getElementById('target_' + i);

      target = document.getElementById('target_' + i);
      target.selectedRegions = this.selectedRegions;
      if ( this.planeSelectionArray[i] == 0 ){
        this.sliceNumArray[i] = +comment.zPosition;
      } else if ( this.planeSelectionArray[i] == 1 ){
        this.sliceNumArray[i] = this.shape - (+comment.yPosition);
      } else if ( this.planeSelectionArray[i] == 2 ){
        this.sliceNumArray[i] = this.shape - (+comment.xPosition);
      }
      // draw canvas
      this.drawCanvas(this.canvas, this.canvas_saliency, this.canvas_comment, this.canvas_coords, this.canvas_orientation, this.canvas_crossHair, this.shape, this.target, this.selectedView, i, this.sliceNumArray, this.niftiHeaders[i], this.niftiImages[i], this.roiNiftiHeaders[i], this.roiNiftiImages[i], this.saliencyNiftiHeaders[i], this.saliencyNiftiImages[i], this.saliencyMapSelected, this.saliencyMapSliderValue , this.roiSliderValue, this.selectedRegions, this.planeSelectionArray, this.coordsArray,this.regionInfoMap, this.comments,this.initFlag);

    }// end for

  }// end method

  // handle region selection from drop down list
  onRegionSelect(item: any) {
    this.selectedRegions.push(item.item_id);
    this.selectedRegionsMap.set(item.item_id, this.regionInfoMap[item.item_id]);
    this.selectRegion();
    this.regionsSelected = true;
  }

  // handle region selection from drop down list
  onRegionDeSelect(item: any) {
    var index = this.selectedRegions.indexOf(item.item_id);
    if (index > -1) {
    this.selectedRegions.splice(index, 1);
    }
    this.selectRegion();
    if (this.selectedRegions.length == 0){
      this.regionsSelected = false;
    }
  }

  // handler for select all regions
  onSelectAll(items: any) {
    console.log(items);
  }

  // draw selected region on the canvases
  selectRegion(){

      let target:any;

      for(var i = 0; i < (this.imagePrefixes).length; i++){

        this.canvas = document.getElementById('canvas_' + i) as HTMLCanvasElement;
        this.canvas_saliency = document.getElementById('canvas_saliency_' + i) as HTMLCanvasElement;
        this.canvas_comment = document.getElementById('canvas_comment_' + i) as HTMLCanvasElement;
        this.canvas_coords = document.getElementById('canvas_coords_' + i) as HTMLCanvasElement;
        this.canvas_orientation = document.getElementById('canvas_orientation_' + i) as HTMLCanvasElement;

        this.target = document.getElementById('target_' + i);

        target = document.getElementById('target_' + i);
        target.selectedRegions = this.selectedRegions;
        this.drawCanvas(this.canvas, this.canvas_saliency, this.canvas_comment, this.canvas_coords, this.canvas_orientation, this.canvas_crossHair, this.shape, this.target, this.selectedView, i, this.sliceNumArray, this.niftiHeaders[i], this.niftiImages[i], this.roiNiftiHeaders[i], this.roiNiftiImages[i], this.saliencyNiftiHeaders[i], this.saliencyNiftiImages[i], this.saliencyMapSelected, this.saliencyMapSliderValue , this.roiSliderValue, this.selectedRegions, this.planeSelectionArray, this.coordsArray,this.regionInfoMap, this.comments, this.initFlag);

      } // end for loop

      // update line chart data
      this.setLineChartData();
      // update graph data
      this.setGraphData();

  } // end method

  // set ROI slider value for adjusting opacity
  setRoiSliderValue(){

    let roiSlider = document.getElementById('roiSlider') as HTMLInputElement;
    this.roiSliderValue = Number(roiSlider.value);

    let target:any;
    for(var i = 0; i < (this.imagePrefixes).length; i++){

      this.canvas = document.getElementById('canvas_' + i) as HTMLCanvasElement;
      this.canvas_saliency = document.getElementById('canvas_saliency_' + i) as HTMLCanvasElement;
      this.canvas_comment = document.getElementById('canvas_comment_' + i) as HTMLCanvasElement;
      this.canvas_coords = document.getElementById('canvas_coords_' + i) as HTMLCanvasElement;
      this.canvas_orientation = document.getElementById('canvas_orientation_' + i) as HTMLCanvasElement;

      this.target = document.getElementById('target_' + i);

      // let midSliceNum = Math.round((this.niftiHeaders[i]).dims[3] / 2);
      target = document.getElementById('target_' + i);
      target.saliencyMapSliderValue = this.saliencyMapSliderValue;
      target.roiSliderValue = this.roiSliderValue;

      this.drawCanvas(this.canvas, this.canvas_saliency, this.canvas_comment, this.canvas_coords, this.canvas_orientation, this.canvas_crossHair, this.shape, this.target, this.selectedView, i, this.sliceNumArray, this.niftiHeaders[i], this.niftiImages[i], this.roiNiftiHeaders[i], this.roiNiftiImages[i], this.saliencyNiftiHeaders[i], this.saliencyNiftiImages[i], this.saliencyMapSelected, this.saliencyMapSliderValue, this.roiSliderValue, this.selectedRegions, this.planeSelectionArray, this.coordsArray, this.regionInfoMap, this.comments, this.initFlag);

    } // end for loop

  } // end method

  // handler function for saliency map slider
  setSaliencyMapSliderValue(){

    let saliencyMapSlider = document.getElementById('saliencyMapSlider') as HTMLInputElement;
    this.saliencyMapSliderValue = Number(saliencyMapSlider.value);

    let target:any;
    for(var i = 0; i < (this.imagePrefixes).length; i++){

      this.canvas = document.getElementById('canvas_' + i) as HTMLCanvasElement;
      this.canvas_saliency = document.getElementById('canvas_saliency_' + i) as HTMLCanvasElement;
      this.canvas_comment = document.getElementById('canvas_comment_' + i) as HTMLCanvasElement;
      this.canvas_coords = document.getElementById('canvas_coords_' + i) as HTMLCanvasElement;
      this.canvas_orientation = document.getElementById('canvas_orientation_' + i) as HTMLCanvasElement;

      this.target = document.getElementById('target_' + i);

      target = document.getElementById('target_' + i);
      target.saliencyMapSliderValue = this.saliencyMapSliderValue;

      this.drawCanvas(this.canvas, this.canvas_saliency, this.canvas_comment, this.canvas_coords, this.canvas_orientation, this.canvas_crossHair, this.shape, this.target, this.selectedView, i, this.sliceNumArray, this.niftiHeaders[i], this.niftiImages[i], this.roiNiftiHeaders[i], this.roiNiftiImages[i], this.saliencyNiftiHeaders[i], this.saliencyNiftiImages[i], this.saliencyMapSelected, this.saliencyMapSliderValue, this.roiSliderValue, this.selectedRegions, this.planeSelectionArray, this.coordsArray, this.regionInfoMap, this.comments, this.initFlag);

    }
    console.log( " setting slider ---- ");
    this.setGraphData();
    this.lineChartOptions = {
      responsive: true,
      scales: {
        // We use this empty structure as a placeholder for dynamic theming.
        xAxes: [
        {'ticks':
          {
          'beginAtZero':false,
          // 'suggestedMin':1,
          // 'suggestedMax':100,
          'maxTicksLimit':10,
          'stepSize':10,
          'display':false,
          'min': 1,
          'max':100
          },
          'gridLines': {
            'display': false
          }
        },
        {
          'scaleLabel': {
          'display': true,
          'labelString': 'saliency'
          }
        },
        {'display':false}

        ],
        yAxes: [
          // {
          //   "id": 'y-axis-0',
          //   "position": 'left',
          //   'display':false,
          //   'ticks': {'min': 0, 'max':100},
          // },
          {
            "id": 'y-axis-1',
            "position": 'right',
            'ticks': {'min': 0, 'max':100},
            'display':false,

            'gridLines': {
              'display': false
            }

        },
        {
          'scaleLabel': {
          'display': true,
          'labelString': 'count'
          }
        },
        {'display':false}

        ]
      },
      annotation: {
        annotations: [
          {
            "type": 'line',
            "mode": 'vertical',
            "scaleID": 'x-axis-0',
            "value": this.saliencyMapSliderValue,
            "borderColor": 'orange',
            "borderWidth": 2,
            "label": {
              "enabled": true,
              "fontColor": 'orange',
              "content": 'Saliency: ' + this.saliencyMapSliderValue,
            }
          },
        ],
      },
    };

  }// end method set saliency map slider

  setGraphData(){

    console.log( " set graph data ---- ");

    this.totalVoxelsColorsList= [];
    this.thresholdProportionalColorsList= [];
    this.zmBinColorsList= [];

    let totalVoxelsPlotDataValues = [];

    if (this.totalVoxelsData.length > this.saliencyMapSliderValue){
      for (let i = 0; i < this.totalVoxelsData[this.saliencyMapSliderValue].length; i++){
        // console.log(" this.selectedRegions " + this.selectedRegions + " this.totalVoxelsRegionNumbers[i] " + this.totalVoxelsRegionNumbers[i]);
        if (this.selectedRegions.includes(this.totalVoxelsRegionNumbers[i])){
          totalVoxelsPlotDataValues.push ({"data":[this.totalVoxelsData[this.saliencyMapSliderValue][i]], "label":this.totalVoxelsRegions[i]});
          this.totalVoxelsColorsList.push({"backgroundColor":this.totalVoxelsRGBAColors[i]});
        }
      }
    }
    //
    // colorList = [];

    let thresholdProportionalDataValues = [];

    if (this.thresholdProportionalData.length > this.saliencyMapSliderValue){
      for (let i = 0; i < this.thresholdProportionalData[this.saliencyMapSliderValue].length; i++){
        if (this.selectedRegions.includes(this.thresholdProportionalRegionNumbers[i])){
          thresholdProportionalDataValues.push ({"data":[this.thresholdProportionalData[this.saliencyMapSliderValue][i]], "label":this.thresholdProportionalRegions[i]});
          this.thresholdProportionalColorsList.push({"backgroundColor":this.thresholdProportionalRGBAColors[i]});
        }
      }
    }

    let zmBinPlotDataValues = [];

    if (this.zmBinData.length > this.saliencyMapSliderValue){
      for (let i = 0; i < this.zmBinData[this.saliencyMapSliderValue].length; i++){
        if (this.selectedRegions.includes(this.zmBinRegionNumbers[i])){
          zmBinPlotDataValues.push ({"data":[this.zmBinData[this.saliencyMapSliderValue][i]], "label":this.zmBinRegions[i]});
          this.zmBinColorsList.push({"backgroundColor": this.zmBinRGBAColors[i]});
        }
      }
    }

    console.log(" totalVoxelsPlotDataValues  = " + totalVoxelsPlotDataValues);

    setTimeout(() => {
      console.log(" this.totalVoxelsPlotData  = " + this.totalVoxelsPlotData);
      this.totalVoxelsPlotData = totalVoxelsPlotDataValues;
      this.thresholdProportionalPlotData = thresholdProportionalDataValues;
      this.zmBinPlotData = zmBinPlotDataValues;

      this.totalVoxelsLabels = ["Total_voxels_"+this.saliencyMapSliderValue];
      this.thresholdProportionalLabel = ["Proportional_Threshold_"+this.saliencyMapSliderValue];
      this.zmBinRegionsLabel = ["ZM_Bin_"+this.saliencyMapSliderValue];
      if (this.chart){
        this.chart.chart.update();
      }
    }, 50);

  }

  // set data for line chart, changing dynamically with saliency map slider
  setLineChartData(){

    this.totalVoxelsLineChartDataSet = [];
    this.totalVoxelsLineChartColors = [];

    this.thresholdProportionalLineChartDataSet = [];
    this.thresholdProportionalLineChartColors = [];

    this.zmBinLineChartDataSet = [];
    this.zmBinLineChartColors = [];

    setTimeout(() => {
    if (this.totalVoxelsRegionNumbers){
      for (let i = 0; i < this.totalVoxelsRegionNumbers.length; i++){
        if (this.selectedRegions.includes(this.totalVoxelsRegionNumbers[i])){
          this.totalVoxelsLineChartDataSet.push ({"data":this.totalVoxelsLineChartData[i], "label":this.totalVoxelsRegions[i]});
          this.totalVoxelsLineChartColors.push({ // grey
                                                "backgroundColor": this.totalVoxelsRGBA02Colors[i],
                                                "borderColor": this.totalVoxelsRGBAColors[i],
                                                "pointBackgroundColor": this.totalVoxelsRGBAColors[i],
                                                "pointBorderColor": '#fff',
                                                "pointHoverBackgroundColor": '#fff',
                                                "pointHoverBorderColor": this.totalVoxelsRGBA08Colors[i],
                                                });
        }
      }
    }
    if (this.thresholdProportionalRegionNumbers){
      for (let i = 0; i < this.thresholdProportionalRegionNumbers.length; i++){
        if(this.selectedRegions.includes(this.thresholdProportionalRegionNumbers[i])){
          this.thresholdProportionalLineChartDataSet.push ({"data":this.thresholdProportionalLineChartData[i], "label":this.thresholdProportionalRegions[i]});
          this.thresholdProportionalLineChartColors.push({ // grey
                                                "backgroundColor": this.thresholdProportionalRGBA02Colors[i],
                                                "borderColor": this.thresholdProportionalRGBAColors[i],
                                                "pointBackgroundColor": this.thresholdProportionalRGBAColors[i],
                                                "pointBorderColor": '#fff',
                                                "pointHoverBackgroundColor": '#fff',
                                                "pointHoverBorderColor": this.thresholdProportionalRGBA08Colors[i],
                                                });
        }
      }
    }
    if (this.zmBinRegionNumbers){

      for (let i = 0; i < this.zmBinRegionNumbers.length; i++){
        if (this.selectedRegions.includes(this.zmBinRegionNumbers[i])){
          this.zmBinLineChartDataSet.push ({"data":this.zmBinLineChartData[i], "label":this.zmBinRegions[i]});
          this.zmBinLineChartColors.push({ // grey
                                                "backgroundColor": this.zmBinRGBA02Colors[i],
                                                "borderColor": this.zmBinRGBAColors[i],
                                                "pointBackgroundColor": this.zmBinRGBAColors[i],
                                                "pointBorderColor": '#fff',
                                                "pointHoverBackgroundColor": '#fff',
                                                "pointHoverBorderColor": this.zmBinRGBA08Colors[i],
                                                });
        }
      }
    }
   }
   ,50);

 } // end method

 // handle show hide saliency map overlay
  displaySaliencyMap(){
    if (this.saliencyMapSelected){
      this.disableLineChartsSelection = false;
      let target:any;
      console.log( " in display saliency " + this.saliencyMapSelected);
      this.disableSaliencySlider = false;
      for(var i = 0; i < (this.imagePrefixes).length; i++){

        this.canvas = document.getElementById('canvas_' + i) as HTMLCanvasElement;
        this.canvas_saliency = document.getElementById('canvas_saliency_' + i) as HTMLCanvasElement;
        this.canvas_comment = document.getElementById('canvas_comment_' + i) as HTMLCanvasElement;
        this.canvas_coords = document.getElementById('canvas_coords_' + i) as HTMLCanvasElement;
        this.canvas_orientation = document.getElementById('canvas_orientation_' + i) as HTMLCanvasElement;

        this.target = document.getElementById('target_' + i);

        target = document.getElementById('target_' + i);
        target.saliencyMapSelected = this.saliencyMapSelected;

        this.drawCanvas(this.canvas, this.canvas_saliency, this.canvas_comment, this.canvas_coords, this.canvas_orientation, this.canvas_crossHair, this.shape, this.target, this.selectedView, i, this.sliceNumArray, this.niftiHeaders[i], this.niftiImages[i], this.roiNiftiHeaders[i], this.roiNiftiImages[i], this.saliencyNiftiHeaders[i], this.saliencyNiftiImages[i], this.saliencyMapSelected,this.saliencyMapSliderValue, this.roiSliderValue, this.selectedRegions, this.planeSelectionArray, this.coordsArray, this.regionInfoMap, this.comments, this.initFlag);

      }
      // show line charts if needed.
      this.lineChartOptions = {
        responsive: true,
        scales: {
          // We use this empty structure as a placeholder for dynamic theming.
          xAxes: [

          {'ticks':
            {
            'beginAtZero':false,
            // 'suggestedMin':1,
            // 'suggestedMax':100,
            'maxTicksLimit':10,
            'stepSize':10,
            'display':false,
            'min': 1,
            'max':100
            },
            'gridLines': {
              'display': false
            }
          },
          {
            'scaleLabel': {
            'display': true,
            'labelString': 'saliency'
            }
          },
          {'display':false}
          ],
          yAxes: [
            // {
            //   "id": 'y-axis-0',
            //   "position": 'left',
            //   'display':false,
            //   'ticks': {'min': 0, 'max':100},
            // },
            // 'gridLines': {
            //   'display': false
            // }
            {
              "id": 'y-axis-1',
              "position": 'right',
              'display':false,
              'ticks': {'min': 0, 'max':100},
              'gridLines': {
                'display': false
              }
            //   // "gridLines": {
            //   //   "color": 'rgba(255,0,0,0.3)',
            //   // }
            //   "ticks": {
            //     "fontColor": 'red',
            //   }
          },
          {
            'scaleLabel': {
              'display': true,
              'labelString': 'count'
            }
          },
          {'display':false}
         ]
        },
        annotation: {
          annotations: [
            {
              "type": 'line',
              "mode": 'vertical',
              "scaleID": 'x-axis-0',
              "value": this.saliencyMapSliderValue,
              "borderColor": 'orange',
              "borderWidth": 2,
              "label": {
                "enabled": true,
                "fontColor": 'orange',
                "content": 'Saliency: ' + this.saliencyMapSliderValue,
              }
            },
          ],
        },
      };
    }
    else {
      this.disableLineChartsSelection = true;

      let target:any;
      console.log( " in display saliency " + this.saliencyMapSelected);
      this.disableSaliencySlider = true;
      for(var i = 0; i < (this.imagePrefixes).length; i++){

        this.canvas = document.getElementById('canvas_' + i) as HTMLCanvasElement;
        this.canvas_saliency = document.getElementById('canvas_saliency_' + i) as HTMLCanvasElement;
        this.canvas_comment = document.getElementById('canvas_comment_' + i) as HTMLCanvasElement;
        this.canvas_coords = document.getElementById('canvas_coords_' + i) as HTMLCanvasElement;
        this.canvas_orientation = document.getElementById('canvas_orientation_' + i) as HTMLCanvasElement;

        this.target = document.getElementById('target_' + i);

        target = document.getElementById('target_' + i);
        target.saliencyMapSelected = this.saliencyMapSelected;

        this.drawCanvas(this.canvas, this.canvas_saliency, this.canvas_comment, this.canvas_coords, this.canvas_orientation, this.canvas_crossHair, this.shape, this.target, this.selectedView, i, this.sliceNumArray, this.niftiHeaders[i], this.niftiImages[i], this.roiNiftiHeaders[i], this.roiNiftiImages[i], this.saliencyNiftiHeaders[i], this.saliencyNiftiImages[i], this.saliencyMapSelected,this.saliencyMapSliderValue, this.roiSliderValue, this.selectedRegions, this.planeSelectionArray, this.coordsArray, this.regionInfoMap, this.comments, this.initFlag);

      }

    }
  } //  end method

  // rotate positional arrays associated with the 3 views
  rotateArray( array , times ){
    while( times-- ){
      var temp = array.shift();
      array.push( temp )
    }
  }

  // method invoked for first display of page from on init
  showPage() {
    if (this.initFlag){
      this.defaultButtonColor = "#006400";
    }

    this.overlayData = this.overlayDataList[this.selectedImageClass];
    this.comments = this.overlayData.comments;
    this.commentsAll = this.overlayData.comments;
    console.log(this.overlayDataList);
    let timer:any;

    // if data received from server
    if (this.overlayData) {

      this.allData = this.overlayData.allData;
      this.brainData = this.allData.brainData;
      this.niftiImages = Array();
      this.niftiHeaders = Array();

      this.roiNiftiImages = Array();
      this.roiNiftiHeaders = Array();

      this.saliencyNiftiImages = Array();
      this.saliencyNiftiHeaders = Array();

      // unpack and show data for the viewer panel
      this.displayBrain(this.brainData, this.roiData, this.saliencyData, this.imagePrefixes, this.shape);

    }

  } // end method

  // switch between image classes : original brain, brain extraction, cortical thickness, warped image
  changeImageClass(imageClass){

      this.selectedImageClass= imageClass;

      console.log(" selected image class " + this.selectedImageClass);
      this.disableSelection = false;

      this.originalScanButtonBackgroundColor = "#9A9AE9";
      this.brainExtractionButtonBackgroundColor = "#9A9AE9";
      this.corticalThicknessButtonBackgroundColor = "#9A9AE9";
      this.warpedImageButtonBackgroundColor = "#9A9AE9";

      if (imageClass == 0){
          this.originalScanButtonBackgroundColor = "#6567DF";
      } else if (imageClass == 1){
        this.brainExtractionButtonBackgroundColor = "#6567DF";
      } else if (imageClass == 2){
        this.corticalThicknessButtonBackgroundColor = "#6567DF";
      } else if (imageClass == 3){
        this.warpedImageButtonBackgroundColor = "#6567DF";
      }

      if (this.selectedImageClass == 0){
        this.disableSelection = true;
      }
      let button:any;
      this.planeSelectionArray = [0,1,2];
      this.selectedView = 0;
      let button2 = document.getElementById('button_0');
      button2.setAttribute("style", "background-color:#006400;");

      button2 = document.getElementById('button_1');
      button2.setAttribute("style", "background-color:#4CAF50;");

      button2 = document.getElementById('button_2');
      button2.setAttribute("style", "background-color:#4CAF50;");

      for(var i = 0; i < (this.imagePrefixes).length; i++){

        let canvas = document.getElementById('canvas_' + i) as HTMLCanvasElement;

        let canvas_saliency = document.getElementById('canvas_saliency_' + i) as HTMLCanvasElement;
        let canvas_crossHair = document.getElementById('canvas_crossHair_' + i) as HTMLCanvasElement;
        let canvas_coords = document.getElementById('canvas_coords_' + i) as HTMLCanvasElement;

        let target = document.getElementById('target_' + i);
        let ctx =  canvas.getContext("2d");
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.font = "30px Arial";
        ctx.fillText("Loading .. ",10,50);

        ctx =  canvas_crossHair.getContext("2d");
        ctx.clearRect(0,0,canvas_crossHair.width,canvas_crossHair.height);

        while (target.hasChildNodes()) {
          target.removeChild(target.lastChild);
        }

      }

      this.showPage();
  } // end method

  // switch between views: coronal, axial and sagittal
  changeView(selectedView){

    let shiftIndex = (this.planeSelectionArray).indexOf(selectedView);

    // shioft all related arrays (coronal: (x,y,z), axial: (y,z,x), sagittal: (z,y,x))
    this.rotateArray(this.niftiImages, shiftIndex);
    this.rotateArray(this.niftiHeaders, shiftIndex);

    this.rotateArray(this.roiNiftiImages, shiftIndex);
    this.rotateArray(this.roiNiftiHeaders, shiftIndex);

    this.rotateArray(this.saliencyNiftiImages, shiftIndex);
    this.rotateArray(this.saliencyNiftiHeaders, shiftIndex);

    this.selectedView = selectedView;
    this.rotateArray(this.planeSelectionArray, shiftIndex);
    this.rotateArray(this.sliceNumArray, shiftIndex);

    let button:any;
    var target:any;

    for(var i = 0; i < (this.imagePrefixes).length; i++){

      let canvas = document.getElementById('canvas_' + i) as HTMLCanvasElement;
      let canvas_saliency = document.getElementById('canvas_saliency_' + i) as HTMLCanvasElement;
      let canvas_comment = document.getElementById('canvas_comment_' + i) as HTMLCanvasElement;
      let canvas_coords = document.getElementById('canvas_coords_' + i) as HTMLCanvasElement;
      this.canvas_orientation = document.getElementById('canvas_orientation_' + i) as HTMLCanvasElement;

      target = document.getElementById('target_' + i);
      target.selectedView = selectedView;

      button = document.getElementById('button_' + i);

      let ctx =  canvas.getContext("2d");
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.font = "30px Arial";
      ctx.fillText("Loading .. ",10,50);
      // if buttons are rendered
      if(button){
        if(i == selectedView){
          button.setAttribute("style", "background-color:#006400;");
        } else {
          button.setAttribute("style", "background-color:#4CAF50;");
        }
      }

      if (selectedView == 0){
        this.defaultButtonColor = "#006400";
      } else {
        this.defaultButtonColor = "#4CAF50";
      }

      this.drawCanvas(canvas, canvas_saliency, canvas_comment, canvas_coords, this.canvas_orientation, this.canvas_crossHair, this.shape, target, this.selectedView, i, this.sliceNumArray, this.niftiHeaders[i], this.niftiImages[i], this.roiNiftiHeaders[i], this.roiNiftiImages[i], this.saliencyNiftiHeaders[i], this.saliencyNiftiImages[i], this.saliencyMapSelected, this.saliencyMapSliderValue, this.roiSliderValue, this.selectedRegions, this.planeSelectionArray, this.coordsArray, this.regionInfoMap, this.comments, this.initFlag);

    }
  }// end method

  // rotate sagittal images by 90. Copied from web, MIT license.
  rotate90(matrix) {
    const n = matrix.length;
    const x = Math.floor(n/ 2);
    const y = n - 1;
    for (let i = 0; i < x; i++) {
       for (let j = i; j < y - i; j++) {
          let k = matrix[i][j];
          matrix[i][j] = matrix[y - j][i];
          matrix[y - j][i] = matrix[y - i][y - j];
          matrix[y - i][y - j] = matrix[j][y - i];
          matrix[j][y - i] = k;
       }
    }
  } // end method

  // method to unpack binary data
  // from https://github.com/danguer/blog-examples/blob/master/js/base64-binary.js
  Base64Binary = {
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    /* will return a  Uint8Array type */
    decodeArrayBuffer: function(input) {
      var bytes = (input.length/4) * 3;
      var ab = new ArrayBuffer(bytes);
      this.decode(input, ab);

      return ab;
    },

    removePaddingChars: function(input){
      var lkey = this._keyStr.indexOf(input.charAt(input.length - 1));
      if(lkey == 64){
        return input.substring(0,input.length - 1);
      }
      return input;
    },

    decode: function (input, arrayBuffer) {
      //get last chars to see if are valid
      input = this.removePaddingChars(input);
      input = this.removePaddingChars(input);

      var bytes = Math.floor((input.length / 4) * 3);
      // var bytes = (input.length / 4) * 3;

      var uarray;
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0;
      var j = 0;

      if (arrayBuffer)
        uarray = new Uint8Array(arrayBuffer);
      else
        uarray = new Uint8Array(bytes);

      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

      for (i=0; i<bytes; i+=3) {
        //get the 3 octects in 4 ascii chars
        enc1 = this._keyStr.indexOf(input.charAt(j++));
        enc2 = this._keyStr.indexOf(input.charAt(j++));
        enc3 = this._keyStr.indexOf(input.charAt(j++));
        enc4 = this._keyStr.indexOf(input.charAt(j++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        uarray[i] = chr1;
        if (enc3 != 64) uarray[i+1] = chr2;
        if (enc4 != 64) uarray[i+2] = chr3;
      }

      return uarray;
    }
  } // end method

  // called first time page loads. Data is unpacked here from binary for selected image class. Event handlersdefined.
    displayBrain(brainData, roiData, saliencyData, imagePrefixes, shape){

      // console.log( " in display brain " + this.selectedRegions + " region info map " + this.regionInfoMap);
      var brainDataArray = null;
      var roiDataArray = null;
      var saliencyDataArray = null;

      var data = null;
      var roiDataValue = null;
      var saliencyDataValue = null;
      var niftiHeader = null,
          niftiImage = null,
          roiNiftiHeader = null,
          roiNiftiImage = null,
          saliencyNiftiHeader = null,
          saliencyNiftiImage = null,
          niftiExt = null;

      var elems = document.getElementsByClassName("imageClass");
      var shapeLPI = shape*2;

      for(var i = 0; i < (imagePrefixes).length; i++){

        brainDataArray = this.Base64Binary.decodeArrayBuffer(brainData[i]);

        roiDataArray = [];
        if (roiData && roiData[i] && roiData[i].length > 0){
          roiDataArray = this.Base64Binary.decodeArrayBuffer(roiData[i]);
        }

        saliencyDataArray = [];
        if (saliencyData && saliencyData[i] && saliencyData[i].length > 0){
          saliencyDataArray = this.Base64Binary.decodeArrayBuffer(saliencyData[i]);
        }

        data = brainDataArray;
        niftiHeader = null,
        niftiImage = null,
        niftiExt = null;

        if (nifti.isCompressed(brainDataArray)) {
            data = nifti.decompress(brainDataArray);
        }

        roiDataValue = []

        if (roiDataArray.byteLength > 0 && nifti.isCompressed(roiDataArray)) {

            roiDataValue = nifti.decompress(roiDataArray);
        }

        saliencyDataValue = [];

        if (saliencyDataArray && nifti.isCompressed(saliencyDataArray)) {
            saliencyDataValue = nifti.decompress(saliencyDataArray);
        }

        saliencyNiftiHeader = [];
        saliencyNiftiImage = [];

        if (saliencyDataValue.byteLength > 0 && nifti.isNIFTI(saliencyDataValue)) {

            saliencyNiftiHeader = nifti.readHeader(saliencyDataValue);
            saliencyNiftiImage = nifti.readImage(saliencyNiftiHeader, saliencyDataValue);

            this.saliencyNiftiHeaders.push( saliencyNiftiHeader );
            this.saliencyNiftiImages.push ( saliencyNiftiImage );

        }

        if (nifti.isNIFTI(data)) {
            niftiHeader = nifti.readHeader(data);
            this.niftiHeaders.push(niftiHeader);

            niftiImage = nifti.readImage(niftiHeader, data);
            this.niftiImages.push(niftiImage);

            if (nifti.hasExtension(niftiHeader)) {
                niftiExt = nifti.readExtensionData(niftiHeader, data);
            }

            roiNiftiHeader = []
            roiNiftiImage = [];

            if (roiDataValue.byteLength > 0 && nifti.isNIFTI(roiDataValue)) {
              roiNiftiHeader = nifti.readHeader(roiDataValue);
              this.roiNiftiHeaders.push(roiNiftiHeader);

              roiNiftiImage = nifti.readImage(roiNiftiHeader, roiDataValue);
              this.roiNiftiImages.push(roiNiftiImage);
            }

            // set up slider
            var slices = niftiHeader.dims[3];
            var maxSliceNum = slices - 1;
            var midSliceNum = Math.round(slices / 2);
            var canvas: HTMLCanvasElement;
            var canvas2: HTMLCanvasElement;

            var canvas_crossHair: HTMLCanvasElement;
            var canvas2_crossHair: HTMLCanvasElement;

            var canvas_saliency: HTMLCanvasElement;
            var canvas2_saliency: HTMLCanvasElement;

            var canvas_comment: HTMLCanvasElement;
            var canvas2_comment: HTMLCanvasElement;

            var canvas_coords: HTMLCanvasElement;
            var canvas2_coords: HTMLCanvasElement;

            var canvas_orientation: HTMLCanvasElement;
            var canvas2_orientation: HTMLCanvasElement;
            // make canvas image data
            var target:any;
            var target2:any;

            var horizontalDiv: any;
            var verticalDiv: any;

            this.sliceNumArray = [midSliceNum, midSliceNum, midSliceNum];

            target = document.getElementById('target_' + i);

            if (i == 0){
              target.width  = shapeLPI;
              target.height = shapeLPI;
            }else{
              target.width  = shape;
              target.height = shape;
            }

            target.selectedView = this.selectedView;

            canvas = document.createElement("canvas");
            canvas.id = 'canvas_'+ i;

            canvas.style.position = "absolute";
            canvas.style.zIndex="0";

            if (i == 0){
              canvas.width  = shapeLPI;
              canvas.height = shapeLPI;
            } else {
              canvas.width  = shape;
              canvas.height = shape;
            }

            var newCanvasCtx = canvas.getContext("2d");
            newCanvasCtx.font = "30px Arial";
            newCanvasCtx.fillText("Loading .. ",10,50);

            canvas_crossHair = document.createElement("canvas");
            canvas_crossHair.id = 'canvas_crossHair_'+ i;

            canvas_crossHair.style.zIndex="1";
            canvas_crossHair.style.position = "absolute";

            if (i == 0){
              canvas_crossHair.width  = shapeLPI;
              canvas_crossHair.height = shapeLPI;
            } else {
              canvas_crossHair.width  = shape;
              canvas_crossHair.height = shape;
            }

            target.appendChild(canvas_crossHair);

            canvas_saliency = document.createElement("canvas");
            canvas_saliency.id = 'canvas_saliency_'+ i;

            canvas_saliency.style.zIndex="2";
            canvas_saliency.style.position = "absolute";

            if (i == 0){
              canvas_saliency.width  = shapeLPI;
              canvas_saliency.height = shapeLPI;
            } else {
              canvas_saliency.width  = shape;
              canvas_saliency.height = shape;
            }
            target.appendChild(canvas_saliency);

            canvas_coords = document.createElement("canvas");
            canvas_coords.id = 'canvas_coords_'+ i;

            canvas_coords.style.zIndex="7";
            canvas_coords.style.position = "absolute";

            // if (imagePrefixes[i] == "LPI"){
            if (i == 0){

              canvas_coords.width  = shapeLPI;
              canvas_coords.height = shapeLPI;
            } else {
              canvas_coords.width  = shape;
              canvas_coords.height = shape;
            }
            target.appendChild(canvas_coords);

            canvas_comment = document.createElement("canvas");
            canvas_comment.id = 'canvas_comment_'+ i;
            canvas_comment.style.zIndex="4";
            canvas_comment.style.position = "absolute";

            // if (imagePrefixes[i] == "LPI"){
            if (i == 0){

              canvas_comment.width  = shapeLPI;
              canvas_comment.height = shapeLPI;
            } else {
              canvas_comment.width  = shape;
              canvas_comment.height = shape;
            }
            target.appendChild(canvas_comment);

            canvas_orientation = document.createElement("canvas");
            canvas_orientation.id = 'canvas_'+ i;

            if (i == 0){

              canvas_orientation.width  = shapeLPI;
              canvas_orientation.height = shapeLPI;
            } else {
              canvas_orientation.width  = shape;
              canvas_orientation.height = shape;
            }

            canvas_orientation.id = 'canvas_orientation_'+ i;
            canvas_orientation.style.zIndex="6";
            canvas_orientation.style.position = "absolute";

            var ctx_orientation = canvas_orientation.getContext("2d");
            ctx_orientation.clearRect(0,0,canvas_orientation.width,canvas_orientation.height);

            ctx_orientation.font = "18px Arial";
            ctx_orientation.fillStyle = "#FFFFFF";
            ctx_orientation.strokeStyle = "#FFFFFF";

            target.appendChild(canvas_orientation);

            var selectedRegionList = [];
            var getMouseEvent = {

            // get mouse position
            getMousePos: function (canvas, evt) {

                var rect = canvas.getBoundingClientRect();
                var objectId = canvas.id;
                var objectIdValue = objectId.split("_")[1];

                var rectLeft = Math.floor(rect.left);
                var rectTop = Math.floor(rect.top);
                // to get mouse position when scrolling page, must initialise
                if (canvas.initTopPosition == 0){
                    canvas.initTopPosition = rectTop;
                };

                // var diff = {x: evt.pageX - rectLeft,
                //             y: evt.pageY - canvas.initTopPosition,
                //            };
                 var diff = {x: evt.clientX - rectLeft,
                             y: evt.clientY - rectTop,
                            };

                if (objectIdValue == 0){
                  diff = {x: Math.round(diff.x / 2),
                          y: Math.round(diff.y / 2)
                         }
                }

                if (diff.x > this.shape || diff.y > this.shape){
                    return {
                      x: 0,
                      y: 0,
                      pageX: 0,
                      pageY: 0,
                      rectLeft:0,
                      rectTop:0
                    };
                  }
                else{
                  return {
                    x: diff.x,
                    y: diff.y,
                  };
                }
              }
            };

            // rotate canvas image by 90
            var rotate90Var = {
                rotate90: function(matrix){
                const n = matrix.length;
                const x = Math.floor(n/ 2);
                const y = n - 1;
                for (let i = 0; i < x; i++) {
                   for (let j = i; j < y - i; j++) {
                      let k = matrix[i][j];
                      matrix[i][j] = matrix[y - j][i];
                      matrix[y - j][i] = matrix[y - i][y - j];
                      matrix[y - i][y - j] = matrix[j][y - i]
                      matrix[j][y - i] = k
                   }
                }
              }
            };

            // defined as a variable to pass to mouse event listeners
            var drawCanvasVar = {

                drawCanvas: function(canvas, canvas_saliency, canvas_comment, canvas_coords, canvas_orientation, canvas_crossHair, shape, target, selectedView, index, sliceNumArray, niftiHeader, niftiImage, roiNiftiHeader, roiNiftiImage, saliencyNiftiHeader, saliencyNiftiImage, saliencyMapSelected, saliencyMapSliderValue, roiSliderValue, selectedRegions, planeSelectionArray, coordsArray, regionInfoMap, comments, initFlag) {
                    let slice = sliceNumArray[index];

                    // get nifti dimensions
                    var cols = niftiHeader.dims[1];
                    var rows = niftiHeader.dims[2];
                    // set canvas dimensions to nifti slice dimensions
                    if (index == 0) {
                      canvas.width = 2*cols;
                      canvas.height = 2*rows;
                    } else {
                      canvas.width = cols;
                      canvas.height = rows;
                    }

                    var ctx = canvas.getContext("2d");

                    var canvasImageData:any;

                    if (target.contains(canvas)) {
                      canvasImageData = ctx.getImageData(0,0,canvas.width,canvas.height);
                    } else {
                      canvasImageData = ctx.createImageData(canvas.width, canvas.height);
                    }

                    var ctx2 = canvas_saliency.getContext("2d");

                    var canvasSaliencyImageData:any;

                    if (target.contains(canvas_saliency)) {
                      canvasSaliencyImageData = ctx.getImageData(0,0,canvas_saliency.width,canvas_saliency.height);
                    } else {
                      canvasSaliencyImageData = ctx.createImageData(canvas_saliency.width, canvas_saliency.height);
                    }

                    if (initFlag){
                      var ctx_crossHair = canvas_crossHair.getContext("2d");
                      ctx_crossHair.clearRect(0,0,canvas_crossHair.width,canvas_crossHair.height);

                      if (index == 0){
                  		  ctx_crossHair.moveTo(0, coordsArray[1]*2);
                  		  ctx_crossHair.lineTo(canvas_crossHair.width, coordsArray[1]*2);
                      } else{
                        ctx_crossHair.moveTo(0, coordsArray[1]);
                  		  ctx_crossHair.lineTo(canvas_crossHair.width, coordsArray[1]);
                      }
                		  ctx_crossHair.strokeStyle = "#FF0000";
                		  ctx_crossHair.stroke();

                		  ctx_crossHair.beginPath();
                      if (index == 0){
                  		  ctx_crossHair.moveTo(coordsArray[0]*2, 0);
                  		  ctx_crossHair.lineTo(coordsArray[0]*2, canvas_crossHair.height);
                      } else{
                        ctx_crossHair.moveTo(coordsArray[0], 0);
                  		  ctx_crossHair.lineTo(coordsArray[0], canvas_crossHair.height);
                      }
                		  ctx_crossHair.strokeStyle = "#FF0000";
                		  ctx_crossHair.stroke();
                    }

                    if (index == 0){

                      var ctx_coords = canvas_coords.getContext("2d");
                      ctx_coords.clearRect(0,0,canvas_coords.width,canvas_comment.height);
                      ctx_coords.font = "14px Arial";

                      ctx_coords.fillStyle = "#FFFFFF";
                      ctx_coords.strokeStyle = "#FFFFFF";

                      ctx_coords.fillText("X: " + coordsArray[0] + " Y: " + coordsArray[1], canvas_coords.width-100, 15);
                      ctx_coords.fillText("Slice: " + sliceNumArray[0], canvas_coords.width-100, 30);

                    }

                    var ctx3 = canvas_comment.getContext("2d");
                    ctx3.clearRect(0,0,canvas_comment.width,canvas_comment.height);

                    let coord1 = 0;
                    let coord2 = 0;

                    for ( let i = 0; i < comments.length; i++){
                      let comment = comments[i];

                      if (comment.showHideFlag == "1"){
                        continue;
                      }

                      let xPosition = +comment.xPosition;
                      let yPosition = +comment.yPosition;
                      let zPosition = +comment.zPosition;

                      if (index == 0){
                        xPosition = 2*xPosition;
                        yPosition = 2*yPosition;
                        zPosition = 2*zPosition;
                      }

                      ctx3.fillStyle = "#FF0000";
                      ctx3.strokeStyle = "#FF0000";

                      let sliceMin = 0;
                      let sliceMax = 0;

                      if (selectedView == 0){// coronal view
                        if (index == "0"){// coronal slice
                          sliceMin = +comment.zPosition - 3;
                          sliceMax = +comment.zPosition + 3;
                        } else if (index == "1"){//axial slice
                         sliceMin = shape - (+comment.yPosition) - 3;
                         sliceMax = shape - (+comment.yPosition) + 3;
                       } else if (index == "2"){// sagittal slice
                          sliceMin = shape - (+comment.xPosition) - 3;
                          sliceMax = shape - (+comment.xPosition) + 3;
                        }
                      }
                      else if (selectedView == 1){//axial view
                        if (index == "0"){// axial slice
                          sliceMin = shape-(+comment.yPosition) - 3;
                          sliceMax = shape-(+comment.yPosition) + 3;
                        } else if (index == "1"){// sagittal slice
                          sliceMin = shape - (+comment.xPosition) - 3;
                          sliceMax = shape - (+comment.xPosition) + 3;
                        } else if (index == "2"){// coronal slice
                           sliceMin = +comment.zPosition - 3;
                           sliceMax = +comment.zPosition + 3;
                        }
                      }
                      else if (selectedView == 2){// sagittal view
                        if (index == "0"){// sagittal slice
                            sliceMin = shape-(+comment.xPosition) - 3;
                            sliceMax = shape-(+comment.xPosition) + 3;
                        } else if (index == "1"){// coronal slice
                          sliceMin = +comment.zPosition - 3;
                          sliceMax = +comment.zPosition + 3;
                        } else if (index == "2"){// axial slice
                          sliceMin = shape-(+comment.yPosition) - 3;
                          sliceMax = shape-(+comment.yPosition) + 3;
                        }
                      }

                      if ( (sliceMin < +sliceNumArray[index] ) && ( +sliceNumArray[index] < sliceMax ) ) {
                        ctx3.globalAlpha = 0.6;
                        ctx3.beginPath();

                        if (selectedView == 0){//coronal view
                          if (index == "0"){// coronal slice
                            if (+comment.zPosition == slice) {
                             ctx3.globalAlpha = 1;
                             }
                             coord1 = xPosition;
                             coord2 = yPosition;
                          } else if (index == "1"){// axial slice
                            if (shape - (+comment.yPosition) == slice) {
                             ctx3.globalAlpha = 1;
                             }
                             coord1 = zPosition;
                             coord2 = shape-xPosition;
                          } else if (index == "2"){//sagittal slice
                            if (shape-(+comment.xPosition) == slice) {
                             ctx3.globalAlpha = 1;
                             }
                             coord1 = zPosition;
                             coord2 = yPosition;
                          }
                        }

                        else if (selectedView == 1){//axial view
                          if (index == "0"){//axial slice
                            if (shape-(+comment.yPosition) == slice) {
                             ctx3.globalAlpha = 1;
                             }
                             coord1 = zPosition;
                             coord2 = 2*shape-xPosition;
                          } else if (index == "1"){//sagittal slice
                            if (shape-(+comment.xPosition) == slice) {
                             ctx3.globalAlpha = 1;
                             }
                             coord1 = zPosition;
                             coord2 = yPosition;
                          } else if (index == "2"){// coronal slice
                            if (+comment.zPosition == slice) {
                             ctx3.globalAlpha = 1;
                             }
                             coord1 = xPosition;
                             coord2 = yPosition;
                          }
                        }

                        else if (selectedView == 2){//sagittal view
                          if (index == "0"){//sagittal slice
                            // if (shape-(+comment.xPosition) == slice) {
                            if (+comment.xPosition == slice) {

                             ctx3.globalAlpha = 1;
                             }
                             coord1 = zPosition;
                             coord2 = yPosition;
                          } else if (index == "1"){// coronal slice
                            if (+comment.zPosition == slice) {
                             ctx3.globalAlpha = 1;
                             }
                             coord1 = xPosition;
                             coord2 = yPosition;
                          } else if (index == "2"){// axial slice
                            if (+comment.yPosition == slice) {
                             ctx3.globalAlpha = 1;
                             }
                             coord1 = zPosition;
                             coord2 = shape-xPosition;
                          }
                        }
                        ctx3.arc(coord1, coord2, 5, 0, 2 * Math.PI);

                        ctx3.stroke();
                        ctx3.fill();

                      }
                      // } // end if selected view (coronal / axial / sagittal)
                    } // end iterating comments
                    target.appendChild(canvas_comment);

                    if (initFlag){
                      var ctx_orientation = canvas_orientation.getContext("2d");
                      ctx_orientation.clearRect(0,0,canvas_orientation.width,canvas_orientation.height);

                      if(planeSelectionArray[index] == 0){
                        ctx_orientation.fillText("R", 3, canvas_orientation.height/2);
                        ctx_orientation.fillText("L", canvas_orientation.width-15, canvas_orientation.height/2);

                        ctx_orientation.fillText("I", canvas_orientation.width/2, canvas_orientation.height - 10);
                        ctx_orientation.fillText("S", canvas_orientation.width/2, 15);

                      } else if(planeSelectionArray[index] == 1){
                        ctx_orientation.fillText("P", 3, canvas_orientation.height/2);
                        ctx_orientation.fillText("A", canvas_orientation.width-15, canvas_orientation.height/2);

                        ctx_orientation.fillText("R", canvas_orientation.width/2, canvas_orientation.height - 10);
                        ctx_orientation.fillText("L", canvas_orientation.width/2, 15);

                      } else if(planeSelectionArray[index] == 2){
                        ctx_orientation.fillText("P", 3, canvas_orientation.height/2);
                        ctx_orientation.fillText("A", canvas_orientation.width-15, canvas_orientation.height/2);

                        ctx_orientation.fillText("I", canvas_orientation.width/2, canvas_orientation.height - 10);
                        ctx_orientation.fillText("S", canvas_orientation.width/2, 15);
                      }
                   }
                    // convert raw data to typed array based on nifti datatype
                    var typedData;
                    if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT8) {
                        typedData = new Uint8Array(niftiImage);
                    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT16) {
                        typedData = new Int16Array(niftiImage);
                    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT32) {
                        typedData = new Int32Array(niftiImage);
                    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT32) {
                        typedData = new Float32Array(niftiImage);
                    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT64) {
                        typedData = new Float64Array(niftiImage);
                    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT8) {
                        typedData = new Int8Array(niftiImage);
                    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT16) {
                        typedData = new Uint16Array(niftiImage);
                    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT32) {
                        typedData = new Uint32Array(niftiImage);
                    } else {
                        return;
                    }

                    var saliencyTypedData;
                    // saliencyTypedData = new Int32Array(saliencyNiftiImage);
                    if (saliencyNiftiHeader && saliencyNiftiImage) {
                      if (saliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT8) {
                          saliencyTypedData = new Uint8Array(saliencyNiftiImage);
                      } else if (saliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT16) {
                          saliencyTypedData = new Int16Array(saliencyNiftiImage);
                      } else if (saliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT32) {
                          saliencyTypedData = new Int32Array(saliencyNiftiImage);
                      } else if (saliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT32) {
                          saliencyTypedData = new Float32Array(saliencyNiftiImage);
                      } else if (saliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT64) {
                          saliencyTypedData = new Float64Array(saliencyNiftiImage);
                      } else if (saliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT8) {
                          saliencyTypedData = new Int8Array(saliencyNiftiImage);
                      } else if (saliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT16) {
                          saliencyTypedData = new Uint16Array(saliencyNiftiImage);
                      } else if (saliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT32) {
                          saliencyTypedData = new Uint32Array(saliencyNiftiImage);
                      }
                    }

                    var roiTypedData ;

                    if (roiNiftiHeader && roiNiftiImage) {
                      if (roiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT8) {
                          roiTypedData = new Uint8Array(roiNiftiImage);
                      } else if (roiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT16) {
                          roiTypedData = new Int16Array(roiNiftiImage);
                      } else if (roiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT32) {
                          roiTypedData = new Int32Array(roiNiftiImage);
                      } else if (roiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT32) {
                          roiTypedData = new Float32Array(roiNiftiImage);
                      } else if (roiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT64) {
                          roiTypedData = new Float64Array(roiNiftiImage);
                      } else if (roiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT8) {
                          roiTypedData = new Int8Array(roiNiftiImage);
                      } else if (roiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT16) {
                          roiTypedData = new Uint16Array(roiNiftiImage);
                      } else if (roiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT32) {
                          roiTypedData = new Uint32Array(roiNiftiImage);
                      }
                    }

                    var sliceSize = cols * rows;
                    var sliceOffset = sliceSize * slice;
                    var typedDataArray = Array(typedData);

                    console.log(" sliceOffset " + sliceOffset );
                    var sliceEndIndex = sliceOffset + sliceSize;
                    console.log(" sliceEndIndex " + sliceEndIndex );
                    // console.log(" roiTypedData lenght ^^^^^^^^^^^^^^^^^^ " + roiTypedData.length );

                    var dataSlice2 = Array();
                    var roiDataSlice2 = Array();
                    var saliencyDataSlice2 = Array();

                    for (var i = sliceOffset; i< sliceEndIndex; i++){
                      dataSlice2.push(typedData[i]);
                      if (roiTypedData ){
                        roiDataSlice2.push(roiTypedData[i]);
                      }
                      if (saliencyTypedData ){
                        saliencyDataSlice2.push(saliencyTypedData[i]);
                      }
                    }

                    dataSlice2 = math.reshape(dataSlice2, [rows,cols]);
                    if(roiDataSlice2.length > 0){
                      roiDataSlice2 = math.reshape(roiDataSlice2, [rows,cols]);
                    }
                    if(saliencyDataSlice2.length > 0){
                      saliencyDataSlice2 = math.reshape(saliencyDataSlice2, [rows,cols]);
                    }
                    // console.log(" in draw canvs var planeSelectionArray = " + planeSelectionArray);
                    if (index ==  planeSelectionArray.indexOf(2)){
                      rotate90Var.rotate90(dataSlice2);
                      rotate90Var.rotate90(dataSlice2);
                      rotate90Var.rotate90(dataSlice2);

                      if(roiDataSlice2.length > 0){
                        rotate90Var.rotate90(roiDataSlice2);
                        rotate90Var.rotate90(roiDataSlice2);
                        rotate90Var.rotate90(roiDataSlice2);
                      }

                      if(saliencyDataSlice2.length > 0){
                        rotate90Var.rotate90(saliencyDataSlice2);
                        rotate90Var.rotate90(saliencyDataSlice2);
                        rotate90Var.rotate90(saliencyDataSlice2);
                      }
                    }

                    var scale = 2;
                    var countertest = 0;
                    // draw pixels
                    for (var row = 0; row < rows; row++) {
                        var rowOffset = row * cols;
                        for (var col = 0; col < cols; col++) {
                            var colOffset = col * rows;
                            // var offset = sliceOffset + rowOffset + col;
                            var offset = colOffset + row;

                            var value = dataSlice2[row][col];

                            var roiValue = 0;
                            if (roiDataSlice2.length > 0){
                              roiValue = roiDataSlice2[row][col];
                            }

                            var saliencyValue = 0;
                            if (saliencyDataSlice2.length > 0){
                              saliencyValue = saliencyDataSlice2[row][col];
                            }
                            /*
                               Assumes data is 8-bit, otherwise you would need to first convert
                               to 0-255 range based on datatype range, data range (iterate through
                               data to find), or display range (cal_min/max).

                               Other things to take into consideration:
                                 - data scale: scl_slope and scl_inter, apply to raw value before
                                   applying display range
                                 - orientation: displays in raw orientation, see nifti orientation
                                   info for how to orient data
                                 - assumes voxel shape (pixDims) is isometric, if not, you'll need
                                   to apply transform to the canvas
                                 - byte order: see littleEndian flag
                            */

                            if (selectedRegions.includes(roiValue) ) {

                                if (roiSliderValue != 0) {

                                  let regionInfoObj = regionInfoMap[roiValue];

                                  canvasImageData.data[(rowOffset + col) * 4] = Math.abs(value - regionInfoObj.redColor) & 0xFF;
                                  canvasImageData.data[(rowOffset + col) * 4 + 1] = Math.abs(value - regionInfoObj.blueColor) & 0xFF;
                                  canvasImageData.data[(rowOffset + col) * 4 + 2] = Math.abs(value - regionInfoObj.greenColor) & 0xFF;
                                  canvasImageData.data[(rowOffset + col) * 4 + 3] = Math.round(255*roiSliderValue)& 0xFF;// change to 0xFF
                                }

                                else if (roiSliderValue == 255) {

                                  let regionInfoObj = regionInfoMap[roiValue];

                                  canvasImageData.data[(rowOffset + col) * 4] = regionInfoObj.redColor & 0xFF;
                                  canvasImageData.data[(rowOffset + col) * 4 + 1] = regionInfoObj.blueColor & 0xFF;
                                  canvasImageData.data[(rowOffset + col) * 4 + 2] = regionInfoObj.greenColor & 0xFF;
                                  canvasImageData.data[(rowOffset + col) * 4 + 3] = 0xFF & 0xFF;// change to 0xFF

                                }

                                else{
                                  canvasImageData.data[(rowOffset + col) * 4] = value & 0xFF;
                                  canvasImageData.data[(rowOffset + col) * 4 + 1] = value & 0xFF;
                                  canvasImageData.data[(rowOffset + col) * 4 + 2] = value & 0xFF;
                                  canvasImageData.data[(rowOffset + col) * 4 + 3] = 0xFF& 0xFF;
                                }

                            }

                            else{
                              if (saliencyMapSelected && saliencyValue && ( (Math.round(255*saliencyValue) & 0xFF) >= saliencyMapSliderValue )){
                                // countertest += 1;
                                // if (countertest < 3)
                                //      {console.log(" saliencyValue : saliencyMapSliderValue  " + saliencyValue + ":" + saliencyMapSliderValue );}
                                canvasImageData.data[(rowOffset + col) * 4] = 0 & 0xFF;
                                canvasImageData.data[(rowOffset + col) * 4 + 1] = 0 & 0xFF;
                                canvasImageData.data[(rowOffset + col) * 4 + 2] = Math.round(255*saliencyValue) & 0xFF;
                                canvasImageData.data[(rowOffset + col) * 4 + 3] = 0xFF & 0xFF;
                              } else {

                                canvasImageData.data[(rowOffset + col) * 4] = value & 0xFF;
                                canvasImageData.data[(rowOffset + col) * 4 + 1] = value & 0xFF;
                                canvasImageData.data[(rowOffset + col) * 4 + 2] = value & 0xFF;
                                canvasImageData.data[(rowOffset + col) * 4 + 3] = 0xFF& 0xFF;

                               }
                             }
                        }
                    }
                    ctx.clearRect(0,0,canvas.width,canvas.height);

                    ctx.putImageData(canvasImageData, 0, 0);
                    if (index == 0){
                        ctx.scale(1, 2);
                        ctx.drawImage(canvas, 0, 0, +shape, +shape, 0,0, +shape*2, +shape*2);
                    }

                    if (!(target.contains(canvas)) ) {
                      target.appendChild(canvas);
                      if (index == 0){
                        this.imageLoaded_0 = true;
                        // debugger;
                      }
                      else if (index == 0){
                        this.imageLoaded_1 = true;
                      }
                      else if (index == 0){
                        this.imageLoaded_2 = true;
                      }
                    } // if not contains canvas
                }
            };

            // console.log(" &&&&&&&&&&&&&& main call to draw canvas saliencyNiftiHeader = " + saliencyNiftiHeader + " saliencyNiftiImage " + saliencyNiftiImage);
            drawCanvasVar.drawCanvas(canvas, canvas_saliency, canvas_comment, canvas_coords, canvas_orientation, canvas_crossHair, this.shape, target, this.selectedView, i, this.sliceNumArray, niftiHeader, niftiImage, roiNiftiHeader, roiNiftiImage, saliencyNiftiHeader, saliencyNiftiImage, this.saliencyMapSelected, this.saliencyMapSliderValue, this.roiSliderValue, this.selectedRegions, this.planeSelectionArray, this.coordsArray, this.regionInfoMap, this.comments, this.initFlag);

            target.selectedImageClass = this.selectedImageClass;
            target.sliceNumArray = this.sliceNumArray;

            target.uploadFolder = this.uploadFolder;

            target.imageLoaded_0 = this.imageLoaded_0;
            target.imageLoaded_1 = this.imageLoaded_1;
            target.imageLoaded_2 = this.imageLoaded_2;

            target.getMouseEvent = getMouseEvent;
            target.imagePrefixes = this.imagePrefixes;
            target.drawCanvasVar = drawCanvasVar;
            target.planeSelectionArray = this.planeSelectionArray;
            target.coordsArray = this.coordsArray;

            target.niftiHeaders = this.niftiHeaders;
            target.niftiImages = this.niftiImages;

            target.roiNiftiHeaders = this.roiNiftiHeaders;
            target.roiNiftiImages = this.roiNiftiImages;

            target.saliencyNiftiHeaders = this.saliencyNiftiHeaders;
            target.saliencyNiftiImages = this.saliencyNiftiImages;
            target.saliencyMapSelected = this.saliencyMapSelected;

            target.saliencyMapSliderValue = this.saliencyMapSliderValue;
            target.roiSliderValue = this.roiSliderValue;

            target.mousePress = this.mousePress;
            target.midSliceNum = midSliceNum;
            target.sliceNumArray = this.sliceNumArray;
            target.originalSliceNumArray = this.sliceNumArray;

            target.rotateArray  = this.rotateArray;
            target.selectedRegions  = this.selectedRegions;
            target.regionInfoMap  = this.regionInfoMap;
            target.regionInfoObj  = this.regionInfoObj;

            target.initTopPosition = 0;

            target.commentModalService = this.commentModalService;
            target.comments = this.comments;
            target.rotate3dService = this.rotate3dService;
            target.commentsListChange = this.commentsListChange;
            target.sliceNumArrayChange = this.sliceNumArrayChange;
            target.coordinatesChange = this.coordinatesChange;
            target.shape = this.shape;
            target.initFalg = this.initFlag;
            target.selectedView = this.selectedView;

            target.addEventListener('mousemove', function(evt) {

                var mousePos = this.getMouseEvent.getMousePos(this, evt);

                var elemId = (this.id).split("_")[1];
                let reversePositionArray = [mousePos.y, mousePos.x];
                let originalPositionArray = [mousePos.x, mousePos.y];

                var canvas: HTMLCanvasElement;
                var canvas_crossHair: HTMLCanvasElement;
                var canvas_comment: HTMLCanvasElement;
                var canvas_coords: HTMLCanvasElement;
                var canvas_orientation: HTMLCanvasElement;

                var ctx :any;
                var ctx2: any;
                var ctx_coords: any;
                var ctx2_coords: any;

                var mousePosScaled = {
                                      x:0,
                                      y:0
                                    };

                var finalMousePos = {
                                      x:0,
                                      y:0
                                    };

                mousePosScaled = {
                  x: mousePos.x*2,
                  y: mousePos.y*2
                }

                let finalSliceValue1 = 0;
                let finalSliceValue2 = 0;

                let originalFinalSliceValue1 = 0;
                let originalFinalSliceValue2 = 0;

                this.coordinatesChange.emit([mousePos.x, mousePos.y, this.sliceNumArray[elemId]]);
                this.coordsArray = [mousePos.x, mousePos.y, this.sliceNumArray[elemId]];

                for (var j = 0; j < (this.imagePrefixes).length; j++){

                  canvas = document.getElementById('canvas_crossHair_' + j) as HTMLCanvasElement;
                  canvas_crossHair = document.getElementById('canvas_crossHair_' + j) as HTMLCanvasElement;
                  canvas_comment = document.getElementById('canvas_comment_' + j) as HTMLCanvasElement;
                  canvas_coords = document.getElementById('canvas_coords_' + j) as HTMLCanvasElement;
                  canvas_orientation = document.getElementById('canvas_orientation_' + j) as HTMLCanvasElement;

                  ctx = canvas_crossHair.getContext("2d");
                  ctx.clearRect(0,0,canvas_crossHair.width,canvas_crossHair.height);

                  // Cursor position. Determine which panel the mouse is on, and move cursors in corresponding panels using coronal (x,yz), axial (y,z,x), sagittal(z,y,x) rule, panels in that order (j).
                  let diffCanvasSign = Math.sign(elemId - j);
                  let diffCanvasAbs = Math.abs(elemId - j);
                  let sliceIndex1 = (j+1)%3;
                  let sliceIndex2 = (j+2)%3;

                  // for the center larger canvas, scale the mouse position
                  if (j == 0){
                      finalMousePos = mousePosScaled;

                      finalSliceValue1 = this.originalSliceNumArray[sliceIndex1]*2;
                      finalSliceValue2 = this.originalSliceNumArray[sliceIndex2]*2

                      // originalFinalSliceValue1 = this.originalSliceNumArray[sliceIndex1]*2;
                      // originalFinalSliceValue1 = this.originalSliceNumArray[sliceIndex2]*2

                  }
                  else{
                    finalMousePos = mousePos;

                    finalSliceValue1 = this.originalSliceNumArray[sliceIndex1];
                    finalSliceValue2 = this.originalSliceNumArray[sliceIndex2];

                    // originalFinalSliceValue1 = this.originalSliceNumArray[sliceIndex1];
                    // originalFinalSliceValue1 = this.originalSliceNumArray[sliceIndex2];

                  }

                  // Select slice. Determine which panel the mouse is on, and move cursors in corresponding panels using coronal (x,yz), axial (y,z,x), sagittal(z,y,x) rule, panels in that order (j).
                  if (this.selectedView == 0){
                      if (elemId == 0){
                         if ( j == 0){
                           ctx.beginPath();
                           ctx.moveTo(0, finalMousePos.y);
                           ctx.lineTo(canvas_crossHair.width, finalMousePos.y);
                           ctx.strokeStyle = "#FF0000";
                           ctx.stroke();
                           ctx.closePath();

                           ctx.beginPath();
                           ctx.moveTo(finalMousePos.x, 0);
                           ctx.lineTo(finalMousePos.x, canvas_crossHair.height);
                           ctx.strokeStyle = "#FF0000";
                           ctx.stroke();
                           ctx.closePath();
                         }
                         else if (j == 1) {
                           ctx.beginPath();
                           ctx.moveTo(0,shape - finalMousePos.x);
                           ctx.lineTo(canvas_crossHair.width, shape - finalMousePos.x);
                           ctx.strokeStyle = "#FF0000";
                           ctx.stroke();
                           ctx.closePath();

                           ctx.beginPath();
                           ctx.moveTo(shape - finalSliceValue2, 0);
                           ctx.lineTo(shape - finalSliceValue2, canvas_crossHair.width);
                           ctx.strokeStyle = "#FF0000";
                           ctx.stroke();
                           ctx.closePath();
                         }
                         else if (j == 2) {
                           ctx.beginPath();
                           ctx.moveTo(finalSliceValue1, 0);
                           ctx.lineTo(finalSliceValue1, canvas_crossHair.height);
                           ctx.strokeStyle = "#FF0000";
                           ctx.stroke();
                           ctx.closePath();

                           ctx.beginPath();
                           ctx.moveTo(0, finalMousePos.y);
                           ctx.lineTo(canvas_crossHair.width, finalMousePos.y);
                           ctx.strokeStyle = "#FF0000";
                           ctx.stroke();
                           ctx.closePath();

                         }
                     }
                     else if (elemId == 1){
                       if ( j == 1){
                         ctx.beginPath();
                         ctx.moveTo(0, finalMousePos.y);
                         ctx.lineTo(canvas_crossHair.width, finalMousePos.y);
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                         ctx.beginPath();
                         ctx.moveTo(finalMousePos.x, 0);
                         ctx.lineTo(finalMousePos.x, canvas_crossHair.height);
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                       }
                       else if (j == 2) {
                         ctx.beginPath();
                         ctx.moveTo(finalMousePos.x,0);
                         ctx.lineTo(finalMousePos.x, canvas_crossHair.height );
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                         ctx.beginPath();
                         ctx.moveTo(0, finalSliceValue1);
                         ctx.lineTo(canvas_crossHair.width, finalSliceValue1, );
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                       }
                       else if (j == 0) {
                         ctx.beginPath();
                         ctx.moveTo(2*shape-finalMousePos.y, 0);
                         ctx.lineTo(2*shape-finalMousePos.y, canvas_crossHair.height);
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                         ctx.beginPath();
                         ctx.moveTo(0, finalSliceValue1);
                         ctx.lineTo(canvas_crossHair.width, finalSliceValue1);
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                       }
                     }
                     else if (elemId == 2){
                       if ( j == 2){
                         ctx.beginPath();
                         ctx.moveTo(0, finalMousePos.y);
                         ctx.lineTo(canvas_crossHair.width, finalMousePos.y);
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                         ctx.beginPath();
                         ctx.moveTo(finalMousePos.x, 0);
                         ctx.lineTo(finalMousePos.x, canvas_crossHair.height);
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                       }
                       else if (j == 1) {
                         ctx.beginPath();
                         ctx.moveTo(finalMousePos.x,0);
                         ctx.lineTo(finalMousePos.x, canvas_crossHair.height );
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                         ctx.beginPath();
                         ctx.moveTo(0, finalSliceValue1);
                         ctx.lineTo(canvas_crossHair.width, finalSliceValue1, );
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                       }
                       else if (j == 0) {

                         ctx.beginPath();
                         ctx.moveTo(0, finalMousePos.y);
                         ctx.lineTo(canvas_crossHair.height, finalMousePos.y);
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                         ctx.beginPath();
                         ctx.moveTo(finalSliceValue2, 0);
                         ctx.lineTo(finalSliceValue2, canvas_crossHair.height );
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                       }
                     } // if last panel (sagittal)
                  } // coronal view
                  else if (this.selectedView == 1){ // axial view
                    // center panel
                      if (elemId == 0){
                         if ( j == 0){
                           ctx.beginPath();
                           ctx.moveTo(0, finalMousePos.y);
                           ctx.lineTo(canvas_crossHair.width, finalMousePos.y);
                           ctx.strokeStyle = "#FF0000";
                           ctx.stroke();
                           ctx.closePath();

                           ctx.beginPath();
                           ctx.moveTo(finalMousePos.x, 0);
                           ctx.lineTo(finalMousePos.x, canvas_crossHair.height);
                           ctx.strokeStyle = "#FF0000";
                           ctx.stroke();
                           ctx.closePath();

                         }
                         else if (j == 1) {
                           // console.log(" finalSliceValue1 " + finalSliceValue1);

                           ctx.beginPath();
                           ctx.moveTo(finalMousePos.x,0);
                           ctx.lineTo(finalMousePos.x, canvas_crossHair.height );
                           ctx.strokeStyle = "#FF0000";
                           ctx.stroke();
                           ctx.closePath();

                           ctx.beginPath();
                           ctx.moveTo(0, finalSliceValue2);
                           ctx.lineTo(canvas_crossHair.width, finalSliceValue2 );
                           ctx.strokeStyle = "#FF0000";
                           ctx.stroke();
                           ctx.closePath();

                         }
                         else if (j == 2) {
                           ctx.beginPath();
                           ctx.moveTo(0, finalSliceValue1);
                           ctx.lineTo(canvas_crossHair.height, finalSliceValue1 );
                           ctx.strokeStyle = "#FF0000";
                           ctx.stroke();
                           ctx.closePath();

                           ctx.beginPath();
                           ctx.moveTo(this.shape - finalMousePos.y, 0);
                           ctx.lineTo(this.shape - finalMousePos.y, canvas_crossHair.width );
                           ctx.strokeStyle = "#FF0000";
                           ctx.stroke();
                           ctx.closePath();

                         }
                     }
                     // top right panel
                     else if (elemId == 1){
                       if ( j == 1){
                         ctx.beginPath();
                         ctx.moveTo(0, finalMousePos.y);
                         ctx.lineTo(canvas_crossHair.width, finalMousePos.y);
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                         ctx.beginPath();
                         ctx.moveTo(finalMousePos.x, 0);
                         ctx.lineTo(finalMousePos.x, canvas_crossHair.height);
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                       }
                       else if (j == 0) {
                         ctx.beginPath();
                         ctx.moveTo(finalMousePos.x,0);
                         ctx.lineTo(finalMousePos.x, canvas_crossHair.height );
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                         ctx.beginPath();
                         ctx.moveTo(0, finalSliceValue1);
                         ctx.lineTo(canvas_crossHair.width, finalSliceValue1, );
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                       }
                       else if (j == 2) {
                         ctx.beginPath();
                         ctx.moveTo(0, finalMousePos.y );
                         ctx.lineTo(canvas_crossHair.height, finalMousePos.y );
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                         ctx.beginPath();
                         ctx.moveTo(finalSliceValue2, 0);
                         ctx.lineTo(finalSliceValue2, canvas_crossHair.height );
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                       }
                     }
                     else if (elemId == 2){
                       if ( j == 2){
                         ctx.beginPath();
                         ctx.moveTo(0, finalMousePos.y);
                         ctx.lineTo(canvas_crossHair.width, finalMousePos.y);
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                         ctx.beginPath();
                         ctx.moveTo(finalMousePos.x, 0);
                         ctx.lineTo(finalMousePos.x, canvas_crossHair.height);
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                       }
                       else if (j == 0) {
                         ctx.beginPath();
                         ctx.moveTo(0, 2*this.shape-finalMousePos.x);
                         ctx.lineTo(canvas_crossHair.height, 2*this.shape-finalMousePos.x  );
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                         ctx.beginPath();
                         ctx.moveTo(finalSliceValue2, 0);
                         ctx.lineTo(finalSliceValue2, canvas_crossHair.width );
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                       }
                       else if (j == 1) {
                         ctx.beginPath();
                         ctx.moveTo(0,finalMousePos.y);
                         ctx.lineTo(canvas_crossHair.width, finalMousePos.y );
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                         ctx.beginPath();
                         ctx.moveTo(finalSliceValue2, 0);
                         ctx.lineTo(finalSliceValue2, canvas_crossHair.height);
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                       }
                     } // if last panel (sagittal)
                  } // axial view
                  else if (this.selectedView == 2){// sagittal view
                    // center panel
                      if (elemId == 0){
                         if ( j == 0){
                           ctx.beginPath();
                           ctx.moveTo(0, finalMousePos.y);
                           ctx.lineTo(canvas_crossHair.width, finalMousePos.y);
                           ctx.strokeStyle = "#FF0000";
                           ctx.stroke();
                           ctx.closePath();

                           ctx.beginPath();
                           ctx.moveTo(finalMousePos.x, 0);
                           ctx.lineTo(finalMousePos.x, canvas_crossHair.height);
                           ctx.strokeStyle = "#FF0000";
                           ctx.stroke();
                           ctx.closePath();

                         }
                         else if (j == 2) {
                           // console.log(" finalSliceValue1 = " + finalSliceValue1);
                           ctx.beginPath();
                           ctx.moveTo(finalMousePos.x,0);
                           ctx.lineTo(finalMousePos.x, canvas_crossHair.height );
                           ctx.strokeStyle = "#FF0000";
                           ctx.stroke();
                           ctx.closePath();

                           ctx.beginPath();
                           ctx.moveTo(0, finalSliceValue1);
                           ctx.lineTo(canvas_crossHair.width, finalSliceValue1 );
                           ctx.strokeStyle = "#FF0000";
                           ctx.stroke();
                           ctx.closePath();

                         }
                         else if (j == 1) {
                           // console.log(" finalSliceValue2 = " + finalSliceValue2);

                           ctx.beginPath();
                           ctx.moveTo(this.shape - finalSliceValue2, 0 );
                           ctx.lineTo(this.shape - finalSliceValue2, canvas_crossHair.height  );
                           ctx.strokeStyle = "#FF0000";
                           ctx.stroke();
                           ctx.closePath();

                           ctx.beginPath();
                           ctx.moveTo(0, finalMousePos.y);
                           ctx.lineTo(canvas_crossHair.width, finalMousePos.y  );
                           ctx.strokeStyle = "#FF0000";
                           ctx.stroke();
                           ctx.closePath();

                         }
                     }
                     // top right panel
                     else if (elemId == 1){
                       if ( j == 1){
                         ctx.beginPath();
                         ctx.moveTo(0, finalMousePos.y);
                         ctx.lineTo(canvas_crossHair.width, finalMousePos.y);
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                         ctx.beginPath();
                         ctx.moveTo(finalMousePos.x, 0);
                         ctx.lineTo(finalMousePos.x, canvas_crossHair.height);
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                       }
                       else if (j == 2) {
                         ctx.beginPath();
                         ctx.moveTo(0, this.shape - finalMousePos.x);
                         ctx.lineTo(canvas_crossHair.height, this.shape - finalMousePos.x  );
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                         ctx.beginPath();
                         ctx.moveTo(finalSliceValue2, 0);
                         ctx.lineTo(finalSliceValue2, canvas_crossHair.width );
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                       }
                       else if (j == 0) {
                         ctx.beginPath();
                         ctx.moveTo(0, finalMousePos.y );
                         ctx.lineTo(canvas_crossHair.height, finalMousePos.y );
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                         ctx.beginPath();
                         ctx.moveTo(finalSliceValue1, 0);
                         ctx.lineTo(finalSliceValue1, canvas_crossHair.height );
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                       }
                     }
                     else if (elemId == 2){
                       if ( j == 2){
                         ctx.beginPath();
                         ctx.moveTo(0, finalMousePos.y);
                         ctx.lineTo(canvas_crossHair.width, finalMousePos.y);
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                         ctx.beginPath();
                         ctx.moveTo(finalMousePos.x, 0);
                         ctx.lineTo(finalMousePos.x, canvas_crossHair.height);
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                       }
                       else if (j == 0) {
                         ctx.beginPath();
                         ctx.moveTo(finalMousePos.x, 0);
                         ctx.lineTo(finalMousePos.x, canvas_crossHair.height  );
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                         console.log(" finalSliceValue1 ==== " + finalSliceValue2);
                         ctx.beginPath();
                         ctx.moveTo(0, finalSliceValue2);
                         ctx.lineTo(canvas_crossHair.width, finalSliceValue2  );
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                       }
                       else if (j == 1) {
                         ctx.beginPath();
                         ctx.moveTo(this.shape - finalMousePos.y, 0);
                         ctx.lineTo(this.shape - finalMousePos.y, canvas_crossHair.height );
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                         ctx.beginPath();
                         ctx.moveTo(0, finalSliceValue1);
                         ctx.lineTo(canvas_crossHair.width, finalSliceValue1 );
                         ctx.strokeStyle = "#FF0000";
                         ctx.stroke();
                         ctx.closePath();

                       }
                     } // if last panel (sagittal)
                  } // sagittal view
               } // iterating the 2 canvases

               if(!this.mousePress){
                 if (elemId == 0){
                   canvas_coords = document.getElementById('canvas_coords_' + elemId) as HTMLCanvasElement;
                   ctx_coords = canvas_coords.getContext("2d");
                   ctx_coords.clearRect(0,0,canvas_coords.width,canvas_coords.height);
                   ctx_coords.font = "14px Arial";

                   ctx_coords.fillStyle = "#FFFFFF";
                   ctx_coords.strokeStyle = "#FFFFFF";

                   ctx_coords.fillText("X: " + this.coordsArray[0] + " Y: " + this.coordsArray[1], canvas_coords.width-100, 15);
                   ctx_coords.fillText("Slice: " + this.coordsArray[2], canvas_coords.width-100, 30);

                 }
               }

               if (this.mousePress){

                  let k = 0;
                  let sliceNumValue = 0;
                  let finalSliceNumArray = this.sliceNumArray;
                  for (var j = 0; j < this.imagePrefixes.length; j++){

                    canvas2_coords = document.getElementById('canvas_coords_' + j) as HTMLCanvasElement;
                    ctx2_coords = canvas2_coords.getContext("2d");

                    target2 = document.getElementById('target_' + j);

                    canvas2 = document.getElementById('canvas_' + j) as HTMLCanvasElement;
                    canvas2_comment = document.getElementById('canvas_comment_' + j) as HTMLCanvasElement;
                    canvas2_saliency = document.getElementById('canvas_saliency_' + j) as HTMLCanvasElement;
                    canvas2_coords = document.getElementById('canvas_coords_' + j) as HTMLCanvasElement;
                    canvas2_orientation = document.getElementById('canvas_orientation_' + j) as HTMLCanvasElement;
                    canvas2_crossHair = document.getElementById('canvas_crossHair_' + j) as HTMLCanvasElement;

                    ctx2 = canvas2.getContext("2d");
                    ctx2_coords = canvas2_coords.getContext("2d");

                    this.drawCanvasVar.drawCanvas(canvas2, canvas2_saliency, canvas2_comment, canvas2_coords, canvas2_orientation, canvas2_crossHair, this.shape, target2, this.selectedView, j, this.sliceNumArray, this.niftiHeaders[j], this.niftiImages[j], this.roiNiftiHeaders[j], this.roiNiftiImages[j], this.saliencyNiftiHeaders[j], this.saliencyNiftiImages[j], this.saliencyMapSelected, this.saliencyMapSliderValue, this.roiSliderValue, this.selectedRegions, this.planeSelectionArray, this.coordsArray, this.regionInfoMap, this.comments, this.initFlag);

                    if (j != elemId){

                        sliceNumValue = 0;
                        target2 = document.getElementById('target_' + j);

                        ctx2 = canvas2.getContext("2d");
                        ctx2_coords = canvas2_coords.getContext("2d");

                        if (this.selectedView == 0){
                           if (elemId == 0){
                             this.sliceNumArray[j] = this.shape - reversePositionArray[k];
                           }
                           else if (elemId == 1){
                             this.sliceNumArray[j] = originalPositionArray[k];
                           }
                           else if (elemId == 2){
                             if (j == 1){
                               this.sliceNumArray[j] = this.shape - originalPositionArray[k];
                             } // axial
                             else {
                              this.sliceNumArray[j] = originalPositionArray[k];
                            }
                          } // if last panel (sagittal)
                        } // coronal view
                        // axial view
                        else if (this.selectedView == 1){
                          if (elemId == 0){
                            this.sliceNumArray[j] = reversePositionArray[k];
                          }
                          else if (elemId == 1){
                            if (j == 0){
                              this.sliceNumArray[j] = this.shape - reversePositionArray[k];
                            } else {
                              this.sliceNumArray[j] = reversePositionArray[k];
                            }
                          }
                          else if (elemId == 2){
                            if (j == 0){
                             this.sliceNumArray[j] = this.shape - reversePositionArray[k];
                           } else {
                             this.sliceNumArray[j] = reversePositionArray[k];
                           }
                         } // if last panel (coronal)
                        } // axial view
                        // sagittal view
                        else if (this.selectedView == 2){
                          if (elemId == 0){
                            if (j == 2){
                              this.sliceNumArray[j] = this.shape - originalPositionArray[k];
                            }
                            else {
                              this.sliceNumArray[j] = originalPositionArray[k];
                            }
                          }
                          else if (elemId == 1){
                              this.sliceNumArray[j] = this.shape - originalPositionArray[k];
                          }
                          else if (elemId == 2){
                              this.sliceNumArray[j] = reversePositionArray[k];
                         } // if last panel (axial)
                        } // sagittal view
                        this.drawCanvasVar.drawCanvas(canvas2, canvas2_saliency, canvas2_comment, canvas2_coords, canvas2_orientation, canvas2_crossHair, this.shape, target2, this.selectedView, j, this.sliceNumArray, this.niftiHeaders[j], this.niftiImages[j], this.roiNiftiHeaders[j], this.roiNiftiImages[j], this.saliencyNiftiHeaders[j], this.saliencyNiftiImages[j], this.saliencyMapSelected, this.saliencyMapSliderValue, this.roiSliderValue, this.selectedRegions, this.planeSelectionArray, this.coordsArray, this.regionInfoMap, this.comments, this.initFlag);

                        k++;

                      } // end if different image prefix

                    }//end for
                    // emit slices currently showing
                    this.sliceNumArrayChange.emit(this.sliceNumArray);
                  }// end if mouse press to handle drag event

             }, false);

             target.addEventListener('click', function(evt) {

                 console.log( " in mouse click");
                 var mousePos = this.getMouseEvent.getMousePos( this, evt);
                 let reversePositionArray = [mousePos.y, mousePos.x];
                 let originalPositionArray = [mousePos.x, mousePos.y];

                 var elemId = (this.id).split("_")[1];
                 let k = 0;

                 var ctx:any;
                 var ctx_coords:any;

                 ctx_coords = canvas_coords.getContext("2d");
                 ctx_coords.clearRect(0,0,ctx_coords.width,ctx_coords.height);

                 var mousePosScaled = {
                                       x:0,
                                       y:0
                                     };

                 for (var j = 0; j < this.imagePrefixes.length; j++){

                   if (j == 0){

                       mousePosScaled = {
                         x: mousePos.x*2,
                         y: mousePos.y*2
                       }
                   }
                   else {
                     mousePosScaled = mousePos;
                   }

                   this.coordinatesChange.emit([mousePos.x, mousePos.y, this.sliceNumArray[elemId]]);
                   this.coordsArray = [mousePos.x, mousePos.y, this.sliceNumArray[elemId]];

                   // console.log(" click elem is " + elemId + " j = " + j + " this.imagePrefixes[j] " + this.imagePrefixes[j] + " this.planeSelectionArray[elemId] " + this.planeSelectionArray[elemId]);
                   if (j != elemId){

                       target2 = document.getElementById('target_' + j);
                       canvas2 = document.getElementById('canvas_' + j) as HTMLCanvasElement;

                       ctx = canvas2.getContext("2d");

                       canvas2_saliency = document.getElementById('canvas_saliency_' + j) as HTMLCanvasElement;
                       canvas2_comment = document.getElementById('canvas_comment_' + j) as HTMLCanvasElement;
                       canvas2_coords = document.getElementById('canvas_coords_' + j) as HTMLCanvasElement;
                       canvas2_orientation = document.getElementById('canvas_orientation_' + j) as HTMLCanvasElement;
                       canvas2_crossHair = document.getElementById('canvas_crossHair' + j) as HTMLCanvasElement;

                        if (this.selectedView == 0){
                           if (elemId == 0){
                             this.sliceNumArray[j] = this.shape - reversePositionArray[k];
                           }
                           else if (elemId == 1){
                             this.sliceNumArray[j] = originalPositionArray[k];
                           }
                           else if (elemId == 2){
                             if (j == 1){
                               this.sliceNumArray[j] = this.shape - originalPositionArray[k];
                             } // axial
                             else {
                              this.sliceNumArray[j] = originalPositionArray[k];
                            }
                          } // if last panel (sagittal)
                        } // coronal view
                        // axial view
                        else if (this.selectedView == 1){
                          if (elemId == 0){
                            this.sliceNumArray[j] = reversePositionArray[k];
                          }
                          else if (elemId == 1){
                            if (j == 0){
                              this.sliceNumArray[j] = this.shape - reversePositionArray[k];
                            } else {
                              this.sliceNumArray[j] = reversePositionArray[k];
                            }
                          }
                          else if (elemId == 2){
                            if (j == 0){
                             this.sliceNumArray[j] = this.shape - reversePositionArray[k];
                           } else {
                             this.sliceNumArray[j] = reversePositionArray[k];
                           }
                         } // if last panel (coronal)
                        } // axial view
                        // sagittal view
                        else if (this.selectedView == 2){
                          if (elemId == 0){
                            if (j == 2){
                              this.sliceNumArray[j] = this.shape - originalPositionArray[k];
                            }
                            else {
                              this.sliceNumArray[j] = originalPositionArray[k];
                            }
                          }
                          else if (elemId == 1){
                              this.sliceNumArray[j] = this.shape - originalPositionArray[k];
                          }
                          else if (elemId == 2){
                              this.sliceNumArray[j] = reversePositionArray[k];
                         } // if last panel (axial)
                        } // sagittal view

                       this.drawCanvasVar.drawCanvas(canvas2, canvas2_saliency, canvas2_comment, canvas2_coords, canvas_orientation, canvas2_crossHair, this.shape, target2, this.selectedView, j, this.sliceNumArray, this.niftiHeaders[j], this.niftiImages[j], this.roiNiftiHeaders[j], this.roiNiftiImages[j], this.saliencyNiftiHeaders[j], this.saliencyNiftiImages[j], this.saliencyMapSelected, this.saliencyMapSliderValue, this.roiSliderValue, this.selectedRegions, this.planeSelectionArray, this.coordsArray, this.regionInfoMap, this.comments, this.initFlag);

                       k++;
                     } // end if different image prefix
                   }//end for

                   this.coordinatesChange.emit(this.sliceNumArray);
                   // emit slices currently showing
                   this.sliceNumArrayChange.emit(this.sliceNumArray);

             }, false);

             target.addEventListener('mousedown', function(evt) {
               this.mousePress = true;
               // console.log(" mouse down ");
             }, false);
             target.addEventListener('mouseup', function(evt) {
               this.mousePress = false;
               // console.log(" mouse up ");
             }, false);
             target.addEventListener('mouseleave', function(evt) {
               var elemId = (this.id).split("_")[1];
               var canvas_crossHair = document.getElementById('canvas_crossHair_' + elemId) as HTMLCanvasElement;
               var ctx = canvas_crossHair.getContext("2d");
               ctx.clearRect(0,0,canvas_crossHair.width,canvas_crossHair.height);
             }, false);
             target.addEventListener('mouseleave', function(evt) {
               var elemId = (this.id).split("_")[1];
               var canvas_crossHair = document.getElementById('canvas_crossHair_' + elemId) as HTMLCanvasElement;
               var ctx = canvas_crossHair.getContext("2d");
               ctx.clearRect(0,0,canvas_crossHair.width,canvas_crossHair.height);
             }, false);
             // handler for right click
             target.addEventListener('contextmenu', function(evt) {
              // get element id -
               var elemId = (this.id).split("_")[1];
               evt.preventDefault();
               evt.stopPropagation();
               var mousePos = this.getMouseEvent.getMousePos( this, evt);
               let slice = 0;

               let reversePositionArray = [mousePos.y, mousePos.x];
               let originalPositionArray = [mousePos.x, mousePos.y];
               let k = 0;

               // console.log("mouse right clicked at " + mousePos.x + " : " + mousePos.y);

               const commentModalRef = this.commentModalService.open(CommentModalComponent);

               commentModalRef.componentInstance.name = 'Mouse was clicked at ' + 2*mousePos.x + " : " + 2*mousePos.y + ".";
               commentModalRef.componentInstance.imageClass = this.selectedImageClass;
               commentModalRef.componentInstance.uploadFolder = this.uploadFolder;
               commentModalRef.componentInstance.allowAddComment = true;

               // set the 3D coordinates for the comment. Set slice for the coordiantes updates (z position),  Set the other slices for redrawing the canvases and positioning for comments.
               if (this.selectedView == 0){//coronal view
                 if (elemId == "0"){// coronal slice
                  commentModalRef.componentInstance.xPosition = mousePos.x;
                  commentModalRef.componentInstance.yPosition = mousePos.y;
                  commentModalRef.componentInstance.zPosition = this.sliceNumArray[0];
                  // axial slice
                  this.sliceNumArray[1] = this.shape - mousePos.y;
                  //sagittal slice
                  this.sliceNumArray[2] = this.shape - mousePos.x;
                } else if (elemId == "1"){// axial slice
                   commentModalRef.componentInstance.xPosition = this.shape-mousePos.y;
                   commentModalRef.componentInstance.yPosition = this.shape - this.sliceNumArray[1];
                   commentModalRef.componentInstance.zPosition = mousePos.x;
                   //sagittal slice
                   this.sliceNumArray[2] = mousePos.y;
                   // coronal slice
                   this.sliceNumArray[0] = mousePos.x;
                 } else if (elemId == "2"){// sagittal slice
                  commentModalRef.componentInstance.xPosition = this.shape - this.sliceNumArray[2];
                  commentModalRef.componentInstance.yPosition = mousePos.y;
                  commentModalRef.componentInstance.zPosition = mousePos.x;
                  // coronal slice
                  this.sliceNumArray[0] = mousePos.x;
                  //axial slice
                  this.sliceNumArray[1] = this.shape - mousePos.y;
                  }
                }
                else if (this.selectedView == 1){//axial view
                  if (elemId == "0"){//axial slice
                   commentModalRef.componentInstance.xPosition = this.shape - mousePos.y;
                   commentModalRef.componentInstance.yPosition = this.shape - this.sliceNumArray[0];
                   commentModalRef.componentInstance.zPosition = mousePos.x;
                   // sagittal slice
                   this.sliceNumArray[1] = mousePos.y;
                   //coronal slice
                   this.sliceNumArray[2] = mousePos.x;
                 } else if (elemId == "1"){ // sagittal slice
                    commentModalRef.componentInstance.xPosition = this.sliceNumArray[0];
                    commentModalRef.componentInstance.yPosition = mousePos.y;
                    commentModalRef.componentInstance.zPosition = mousePos.x;
                    // coronal slice
                    this.sliceNumArray[2] = mousePos.x;
                    // axial slice
                    this.sliceNumArray[0] = this.shape - mousePos.y;
                  } else if (elemId == "2"){//coronal slice
                   commentModalRef.componentInstance.xPosition = mousePos.x;
                   commentModalRef.componentInstance.yPosition = mousePos.y;
                   commentModalRef.componentInstance.zPosition = this.sliceNumArray[2];
                   // axial
                   this.sliceNumArray[0] = this.shape - mousePos.y;
                   //sagittal
                   this.sliceNumArray[1] = this.shape - mousePos.x;
                   }
                } else if (this.selectedView == 2){// sagittal view
                  if (elemId == "0"){// sagittal slice
                   commentModalRef.componentInstance.xPosition = this.sliceNumArray[0];
                   commentModalRef.componentInstance.yPosition = mousePos.y;
                   commentModalRef.componentInstance.zPosition = mousePos.x;
                   // coronal slice
                   this.sliceNumArray[1] = mousePos.x;
                   // axial slice
                   this.sliceNumArray[2] = this.shape - mousePos.y;
                 } else if (elemId == "1"){//coronal slice
                    commentModalRef.componentInstance.xPosition = mousePos.x;
                    commentModalRef.componentInstance.yPosition = mousePos.y;
                    commentModalRef.componentInstance.zPosition = this.sliceNumArray[1];
                    // axial slice
                    this.sliceNumArray[2] = this.shape - mousePos.y;
                    // sagittal slice
                    this.sliceNumArray[0] = this.shape - mousePos.x;
                  } else if (elemId == "2"){//axial slice
                     commentModalRef.componentInstance.xPosition = this.shape - mousePos.y;
                     commentModalRef.componentInstance.yPosition = this.shape - this.sliceNumArray[2];
                     commentModalRef.componentInstance.zPosition = mousePos.x;
                     // coronal slice
                     this.sliceNumArray[1] = mousePos.x;
                     // sagittal slice
                     this.sliceNumArray[0] = mousePos.y;
                   }
                }

               const sub = commentModalRef.componentInstance.saveEvent.subscribe(() => {
                 this.rotate3dService.fetchAllComments(this.uploadFolder.id).then(comments => {
                   this.comments = comments;

                   for (let i = 0; i< this.imagePrefixes.length; i++){

                      var canvas_comment = document.getElementById('canvas_comment_' + i ) as HTMLCanvasElement;
                      var canvas = document.getElementById('canvas_' + i ) as HTMLCanvasElement;
                      var canvas_saliency = document.getElementById('canvas_saliency_' + i ) as HTMLCanvasElement;
                      var canvas_coords = document.getElementById('canvas_coords_' + i ) as HTMLCanvasElement;
                      var target = document.getElementById('target_' + i );

                      this.drawCanvasVar.drawCanvas(canvas, canvas_saliency, canvas_comment, canvas_coords, canvas_orientation, canvas_crossHair, this.shape, target, this.selectedView, i,  this.sliceNumArray, this.niftiHeaders[i], this.niftiImages[i], this.roiNiftiHeaders[i], this.roiNiftiImages[i], this.saliencyNiftiHeaders[i], this.saliencyNiftiImages[i], this.saliencyMapSelected, this.saliencyMapSliderValue , this.roiSliderValue, this.selectedRegions, this.planeSelectionArray, this.coordsArray, this.regionInfoMap, this.comments, this.initFlag);

                    } // draw all 3 panels

                    // console.log(" listened to change in modal");
                    this.commentsListChange.emit(this.comments);
                    this.sliceNumArrayChange.emit(this.sliceNumArray);

                 });
                 // console.log(" subscription to event ")
               });

               var canvas_ctx = canvas_comment.getContext("2d");

               let commentsList =[];
               for (let j = 0; j < this.comments.length; j++){

                 let comment = this.comments[j];

                 let xmin = 0;
                 let xmax = 0;

                 let ymin = 0;
                 let ymax = 0;

                 let zmin = 0;
                 let zmax = 0;

                 if (this.planeSelectionArray[elemId]== 0) { // if coronal

                   xmin = mousePos.x-3;
                   xmax = mousePos.x+3;

                   ymin = mousePos.y-3;
                   ymax = mousePos.y+3;

                   if (i == 0){

                     xmin = 2*mousePos.x-3;
                     xmax = 2*mousePos.x+3;

                     ymin = 2*mousePos.y-3;
                     ymax = 2*mousePos.y+3;

                   }

                   if(
                     (xmin < comment.xPosition ) && ( comment.xPosition < xmax ) && (ymin < comment.yPosition ) && ( comment.yPosition < ymax )
                    )
                    {
                     commentsList.push(comment);
                     commentModalRef.componentInstance.xPosition = comment.xPosition;
                     commentModalRef.componentInstance.yPosition = comment.yPosition;
                   }

                 } else if (this.planeSelectionArray[elemId]== 1) { // if coronal

                   zmin = mousePos.x-3;
                   zmax = mousePos.x+3;

                   xmin = mousePos.y-3;
                   xmax = mousePos.y+3;

                   if (i == 0){

                     zmin = 2*mousePos.x-3;
                     zmax = 2*mousePos.x+3;

                     xmin = 2*mousePos.y-3;
                     xmax = 2*mousePos.y+3;

                   }

                   if(
                     (zmin < comment.zPosition ) && ( comment.zPosition < zmax ) && (xmin < (this.shape - comment.xPosition) ) && ( (this.shape - comment.xPosition) < xmax )
                    )
                    {
                     commentsList.push(comment);
                     commentModalRef.componentInstance.xPosition = comment.xPosition;
                     commentModalRef.componentInstance.yPosition = comment.yPosition;
                   }

                 } else if (this.planeSelectionArray[elemId]== 2) { // if coronal

                   zmin = mousePos.x-3;
                   zmax = mousePos.x+3;

                   ymin = mousePos.y-3;
                   ymax = mousePos.y+3;

                   if (i == 0){

                     zmin = 2*mousePos.x-3;
                     zmax = 2*mousePos.x+3;

                     ymin = 2*mousePos.y-3;
                     ymax = 2*mousePos.y+3;

                   }
                   console.log("zmin = " + zmin + " zmax = " + zmax + " comment.zPosition = " + comment.zPosition );
                   console.log("ymin = " + ymin + " ymax = " + ymax + " comment.xPosition = " + comment.yPosition + " -- " + (this.shape - comment.yPosition));

                   if(
                     (zmin < comment.zPosition ) && ( comment.zPosition < zmax ) && (ymin < comment.yPosition ) && ( comment.yPosition < ymax )
                    )
                    {
                     commentsList.push(comment);
                     commentModalRef.componentInstance.xPosition = comment.xPosition;
                     commentModalRef.componentInstance.yPosition = comment.yPosition;
                   }

                 }// end if sagittal

               }

               commentModalRef.componentInstance.commentsList = commentsList;
               this.mousePress=false;

             }, false);
        }
      }// end iterating image prefixes

      // initflag for drawing crossHairs in panel first time page is shown
      if (this.initFlag){
        this.initFlag = false;
      }

    }// end function

    drawCanvas(canvas, canvas_saliency, canvas_comment, canvas_coords, canvas_orientation, canvas_crossHair, shape, target, selectedView, index, sliceNumArray, niftiHeader, niftiImage, roiNiftiHeader, roiNiftiImage, saliencyNiftiHeader, saliencyNiftiImage, saliencyMapSelected, saliencyMapSliderValue, roiSliderValue,selectedRegions, planeSelectionArray, coordsArray,regionInfoMap, comments, initFlag) {
       let slice = sliceNumArray[index];
       console.log( " in stand alone draw canvas ");
        // console.log(" index " + index + " slice " + slice);
        // get nifti dimensions
        var cols = niftiHeader.dims[1];
        var rows = niftiHeader.dims[2];
        // set canvas dimensions to nifti slice dimensions
        if (index == 0) {
          canvas.width = 2*cols;
          canvas.height = 2*rows;
        } else {
          canvas.width = cols;
          canvas.height = rows;
        }

        var ctx = canvas.getContext("2d");

        var canvasImageData:any;

        if (target.contains(canvas)) {
          canvasImageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        } else {
          canvasImageData = ctx.createImageData(canvas.width, canvas.height);
        }

        var ctx2 = canvas_saliency.getContext("2d");

        var canvasSaliencyImageData:any;

        if (target.contains(canvas_saliency)) {
          canvasSaliencyImageData = ctx.getImageData(0,0,canvas_saliency.width,canvas_saliency.height);
        } else {
          canvasSaliencyImageData = ctx.createImageData(canvas_saliency.width, canvas_saliency.height);
        }

        if (index == 0) {
          var ctx_coords = canvas_coords.getContext("2d");
          ctx_coords.clearRect(0,0,canvas_coords.width,canvas_comment.height);
          ctx_coords.fillStyle = "#FFFFFF";
          ctx_coords.strokeStyle = "#FFFFFF";
          ctx_coords.font = "14px Arial";

          ctx_coords.fillText("X: " + coordsArray[0] + " Y: " + coordsArray[1], canvas_coords.width-100, 15);
          ctx_coords.fillText("Slice: " + sliceNumArray[0], canvas_coords.width-100, 30);

        }

        // if (initFlag){
        var ctx_orientation = canvas_orientation.getContext("2d");
        ctx_orientation.clearRect(0,0,canvas_orientation.width,canvas_orientation.height);

        if(planeSelectionArray[index] == 0){
          ctx_orientation.fillText("R", 3, canvas_orientation.height/2);
          ctx_orientation.fillText("L", canvas_orientation.width-15, canvas_orientation.height/2);

          ctx_orientation.fillText("I", canvas_orientation.width/2, canvas_orientation.height - 10);
          ctx_orientation.fillText("S", canvas_orientation.width/2, 15);

        } else if(planeSelectionArray[index] == 1){
          ctx_orientation.fillText("P", 3, canvas_orientation.height/2);
          ctx_orientation.fillText("A", canvas_orientation.width-15, canvas_orientation.height/2);

          ctx_orientation.fillText("R", canvas_orientation.width/2, canvas_orientation.height - 10);
          ctx_orientation.fillText("L", canvas_orientation.width/2, 15);

        } else if(planeSelectionArray[index] == 2){
          ctx_orientation.fillText("P", 3, canvas_orientation.height/2);
          ctx_orientation.fillText("A", canvas_orientation.width-15, canvas_orientation.height/2);

          ctx_orientation.fillText("I", canvas_orientation.width/2, canvas_orientation.height - 10);
          ctx_orientation.fillText("S", canvas_orientation.width/2, 15);
          }
        // }
        var ctx3 = canvas_comment.getContext("2d");
        ctx3.clearRect(0,0,canvas_comment.width,canvas_comment.height);
        // debugger;
        // ctx3.clearRect(0,0,canvas_comment.width,canvas_comment.height);

        let coord1 = 0;
        let coord2 = 0;

        // draw the comments
        for ( let i = 0; i < comments.length; i++){
          let comment = comments[i];

          if (comment.showHideFlag == "1"){
            continue;
          }

          let xPosition = comment.xPosition;
          let yPosition = comment.yPosition;
          let zPosition = comment.zPosition;

          if (index == 0){
            xPosition = 2*xPosition;
            yPosition = 2*yPosition;
            zPosition = 2*zPosition;
          }

          ctx3.fillStyle = "#FF0000";
          ctx3.strokeStyle = "#FF0000";

          let sliceMin = 0;
          let sliceMax = 0;

          if (selectedView == 0){// coronal view
            if (index == "0"){// coronal slice
              sliceMin = +comment.zPosition - 3;
              sliceMax = +comment.zPosition + 3;
            } else if (index == "1"){//axial slice
             sliceMin = shape - (+comment.yPosition) - 3;
             sliceMax = shape - (+comment.yPosition) + 3;
           } else if (index == "2"){// sagittal slice
              sliceMin = shape - (+comment.xPosition) - 3;
              sliceMax = shape - (+comment.xPosition) + 3;
            }
          }
          else if (selectedView == 1){//axial view
            if (index == "0"){// axial slice
              sliceMin = shape-(+comment.yPosition) - 3;
              sliceMax = shape-(+comment.yPosition) + 3;
            } else if (index == "1"){// sagittal slice
              sliceMin = shape - (+comment.xPosition) - 3;
              sliceMax = shape - (+comment.xPosition) + 3;
            } else if (index == "2"){// coronal slice
               sliceMin = +comment.zPosition - 3;
               sliceMax = +comment.zPosition + 3;
            }
          }
          else if (selectedView == 2){// sagittal view
            if (index == "0"){// sagittal slice
                sliceMin = shape-(+comment.xPosition) - 3;
                sliceMax = shape-(+comment.xPosition) + 3;
            } else if (index == "1"){// coronal slice
              sliceMin = +comment.zPosition - 3;
              sliceMax = +comment.zPosition + 3;
            } else if (index == "2"){// axial slice
              sliceMin = shape-(+comment.yPosition) - 3;
              sliceMax = shape-(+comment.yPosition) + 3;
            }
          }

          if ( (sliceMin < +sliceNumArray[index] ) && ( +sliceNumArray[index] < sliceMax ) ) {
            ctx3.globalAlpha = 0.6;
            ctx3.beginPath();

            if (selectedView == 0){//coronal view
              if (index == "0"){// coronal slice
                if (+comment.zPosition == slice) {
                 ctx3.globalAlpha = 1;
                 }
                 coord1 = xPosition;
                 coord2 = yPosition;
              } else if (index == "1"){// axial slice
                if (shape - (+comment.yPosition) == slice) {
                 ctx3.globalAlpha = 1;
                 }
                 coord1 = zPosition;
                 coord2 = shape-xPosition;
              } else if (index == "2"){//sagittal slice
                if (shape-(+comment.xPosition) == slice) {
                 ctx3.globalAlpha = 1;
                 }
                 coord1 = zPosition;
                 coord2 = yPosition;
              }
            }

            else if (selectedView == 1){//axial view
              if (index == "0"){//axial slice
                if (shape-(+comment.yPosition) == slice) {
                 ctx3.globalAlpha = 1;
                 }
                 coord1 = zPosition;
                 coord2 = 2*shape-xPosition;
              } else if (index == "1"){//sagittal slice
                if (shape-(+comment.xPosition) == slice) {
                 ctx3.globalAlpha = 1;
                 }
                 coord1 = zPosition;
                 coord2 = yPosition;
              } else if (index == "2"){// coronal slice
                if (+comment.zPosition == slice) {
                 ctx3.globalAlpha = 1;
                 }
                 coord1 = xPosition;
                 coord2 = yPosition;
              }
            }
            else if (selectedView == 2){//sagittal view
              if (index == "0"){//sagittal slice
                if (+comment.xPosition == slice) {
                 ctx3.globalAlpha = 1;
                 }
                 coord1 = zPosition;
                 coord2 = yPosition;
              } else if (index == "1"){// coronal slice
                if (+comment.zPosition == slice) {
                 ctx3.globalAlpha = 1;
                 }
                 coord1 = xPosition;
                 coord2 = yPosition;
              } else if (index == "2"){// axial slice
                if (+comment.yPosition == slice) {
                 ctx3.globalAlpha = 1;
                 }
                 coord1 = zPosition;
                 coord2 = shape-xPosition;
              }
            }
            ctx3.arc(coord1, coord2, 5, 0, 2 * Math.PI);

            ctx3.stroke();
            ctx3.fill();

          }// if in slice range then draw circle

        } // end iterating comments

        // convert raw data to typed array based on nifti datatype
        var typedData;
        if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT8) {
            typedData = new Uint8Array(niftiImage);
        } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT16) {
            typedData = new Int16Array(niftiImage);
        } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT32) {
            typedData = new Int32Array(niftiImage);
        } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT32) {
            typedData = new Float32Array(niftiImage);
        } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT64) {
            typedData = new Float64Array(niftiImage);
        } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT8) {
            typedData = new Int8Array(niftiImage);
        } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT16) {
            typedData = new Uint16Array(niftiImage);
        } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT32) {
            typedData = new Uint32Array(niftiImage);
        } else {
            return;
        }

        var saliencyTypedData;
        // saliencyTypedData = new Int32Array(saliencyNiftiImage);

        if(saliencyNiftiHeader && saliencyNiftiImage){
          if (saliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT8) {
              saliencyTypedData = new Uint8Array(saliencyNiftiImage);
          } else if (saliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT16) {
              saliencyTypedData = new Int16Array(saliencyNiftiImage);
          } else if (saliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT32) {
              saliencyTypedData = new Int32Array(saliencyNiftiImage);
          } else if (saliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT32) {
              saliencyTypedData = new Float32Array(saliencyNiftiImage);
          } else if (saliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT64) {
              saliencyTypedData = new Float64Array(saliencyNiftiImage);
          } else if (saliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT8) {
              saliencyTypedData = new Int8Array(saliencyNiftiImage);
          } else if (saliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT16) {
              saliencyTypedData = new Uint16Array(saliencyNiftiImage);
          } else if (saliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT32) {
              saliencyTypedData = new Uint32Array(saliencyNiftiImage);
          }
        }

        var roiTypedData;

        if(roiNiftiHeader && roiNiftiImage){
          if (roiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT8) {
              roiTypedData = new Uint8Array(roiNiftiImage);
          } else if (roiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT16) {
              roiTypedData = new Int16Array(roiNiftiImage);
          } else if (roiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT32) {
              roiTypedData = new Int32Array(roiNiftiImage);
          } else if (roiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT32) {
              roiTypedData = new Float32Array(roiNiftiImage);
          } else if (roiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT64) {
              roiTypedData = new Float64Array(roiNiftiImage);
          } else if (roiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT8) {
              roiTypedData = new Int8Array(roiNiftiImage);
          } else if (roiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT16) {
              roiTypedData = new Uint16Array(roiNiftiImage);
          } else if (roiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT32) {
              roiTypedData = new Uint32Array(roiNiftiImage);
          }
        }
        // else {
        //     return;
        // }

        var sliceSize = cols * rows;
        var sliceOffset = sliceSize * slice;
        var typedDataArray = Array(typedData);

        // console.log(" sliceOffset " + sliceOffset );
        var sliceEndIndex = sliceOffset + sliceSize;
        // console.log(" sliceEndIndex " + sliceEndIndex );

        var dataSlice2 = Array();
        var roiDataSlice2 = Array();
        var saliencyDataSlice2 = Array();

        for (var i = sliceOffset; i< sliceEndIndex; i++){
          dataSlice2.push(typedData[i]);
          // if (roiTypedData && roiTypedData[i] && roiTypedData[i].length > 0){

          if (roiTypedData){
            roiDataSlice2.push(roiTypedData[i]);
          }
          // if (saliencyTypedData && saliencyTypedData[i] && saliencyTypedData[i].length > 0){
          if (saliencyTypedData){
            saliencyDataSlice2.push(saliencyTypedData[i]);
          }
        }

        dataSlice2 = math.reshape(dataSlice2, [rows,cols]);
        if(roiDataSlice2.length > 0){
          roiDataSlice2 = math.reshape(roiDataSlice2, [rows,cols]);
        }
        if(saliencyDataSlice2.length > 0){
          saliencyDataSlice2 = math.reshape(saliencyDataSlice2, [rows,cols]);
        }

        if (index ==  (this.planeSelectionArray).indexOf(2)){
          this.rotate90(dataSlice2);
          this.rotate90(dataSlice2);
          this.rotate90(dataSlice2);

          if(roiDataSlice2.length > 0){
            this.rotate90(roiDataSlice2);
            this.rotate90(roiDataSlice2);
            this.rotate90(roiDataSlice2);
          }

          if(saliencyDataSlice2.length > 0){
            this.rotate90(saliencyDataSlice2);
            this.rotate90(saliencyDataSlice2);
            this.rotate90(saliencyDataSlice2);
          }

        }

        var scale = 2;
        var countertest = 0;

        // draw pixels
        for (var row = 0; row < rows; row++) {
            var rowOffset = row * cols;
            for (var col = 0; col < cols; col++) {

                var colOffset = col * rows;
                var offset = colOffset + row;

                var value = dataSlice2[row][col];

                var roiValue = 0;

                if(roiDataSlice2.length > 0){
                  roiValue = roiDataSlice2[row][col];
                }

                var saliencyValue = 0;
                if(saliencyDataSlice2.length > 0){
                  saliencyValue = saliencyDataSlice2[row][col];
                }

                /*
                   Assumes data is 8-bit, otherwise you would need to first convert
                   to 0-255 range based on datatype range, data range (iterate through
                   data to find), or display range (cal_min/max).

                   Other things to take into consideration:
                     - data scale: scl_slope and scl_inter, apply to raw value before
                       applying display range
                     - orientation: displays in raw orientation, see nifti orientation
                       info for how to orient data
                     - assumes voxel shape (pixDims) is isometric, if not, you'll need
                       to apply transform to the canvas
                     - byte order: see littleEndian flag
                */

                if (selectedRegions.includes(roiValue) ) {

                    if (roiSliderValue != 0) {

                      this.regionInfoObj = regionInfoMap[roiValue];

                      canvasImageData.data[(rowOffset + col) * 4] = Math.abs(value - this.regionInfoObj.redColor) & 0xFF;
                      canvasImageData.data[(rowOffset + col) * 4 + 1] = Math.abs(value - this.regionInfoObj.blueColor) & 0xFF;
                      canvasImageData.data[(rowOffset + col) * 4 + 2] = Math.abs(value - this.regionInfoObj.greenColor) & 0xFF;
                      canvasImageData.data[(rowOffset + col) * 4 + 3] = Math.round(255*roiSliderValue)& 0xFF;// change to 0xFF
                    }

                    else if (roiSliderValue == 255) {

                      this.regionInfoObj = this.regionInfoMap[roiValue];

                      canvasImageData.data[(rowOffset + col) * 4] = this.regionInfoObj.redColor & 0xFF;
                      canvasImageData.data[(rowOffset + col) * 4 + 1] = this.regionInfoObj.blueColor & 0xFF;
                      canvasImageData.data[(rowOffset + col) * 4 + 2] = this.regionInfoObj.greenColor & 0xFF;
                      canvasImageData.data[(rowOffset + col) * 4 + 3] = 0xFF & 0xFF;// change to 0xFF

                    }

                    else{
                      canvasImageData.data[(rowOffset + col) * 4] = value & 0xFF;
                      canvasImageData.data[(rowOffset + col) * 4 + 1] = value & 0xFF;
                      canvasImageData.data[(rowOffset + col) * 4 + 2] = value & 0xFF;
                      canvasImageData.data[(rowOffset + col) * 4 + 3] = 0xFF& 0xFF;
                    }

                }
                else{
                  if (saliencyMapSelected && saliencyValue && ( (Math.round(255*saliencyValue) & 0xFF) >= saliencyMapSliderValue ) ) {
                    // Frank suggested blue isntead of red
                    canvasImageData.data[(rowOffset + col) * 4] = 0 & 0xFF;
                    canvasImageData.data[(rowOffset + col) * 4 + 1] = 0 & 0xFF;
                    canvasImageData.data[(rowOffset + col) * 4 + 2] = Math.round(255*saliencyValue) & 0xFF;
                    canvasImageData.data[(rowOffset + col) * 4 + 3] = 0xFF & 0xFF;
                  } else {

                      canvasImageData.data[(rowOffset + col) * 4] = value & 0xFF;
                      canvasImageData.data[(rowOffset + col) * 4 + 1] = value & 0xFF;
                      canvasImageData.data[(rowOffset + col) * 4 + 2] = value & 0xFF;
                      canvasImageData.data[(rowOffset + col) * 4 + 3] = 0xFF& 0xFF;
                   }
                 }
            }
        }

        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.putImageData(canvasImageData, 0, 0);
        if (index == 0){
            ctx.scale(1, 2);
            ctx.drawImage(canvas, 0, 0, +this.shape, +this.shape, 0,0, +this.shape*2, +this.shape*2);
        }

        if (!(target.contains(canvas)) ) {
          console.log (" ** appending image");
          target.appendChild(canvas);

          if (index == 0){
            this.imageLoaded_0 = true;
          }
          else if (index == 1){
            this.imageLoaded_1 = true;
          }
          else if (index == 2){
            this.imageLoaded_2 = true;
          }

        } // end if target does not have canvas

    }

    ngOnInit() {
      this.route.paramMap.subscribe(params => {
        this.fileId = (params.get("fileId")).toString();
      })

      this.originalScanEnabled = false;
      this.brainExtractionEnabled = false;
      this.corticalThicknessEnabled = false;
      this.warpedImageEnabled = false;
      this.disableSaliencySlider = true;
      this.saliencyMapSliderValue = 25;

      this.imageLoaded_0 = false;
      this.imageLoaded_1 = false;
      this.imageLoaded_2 = false;
      this.selectedView = 0;
      this.initFlag = true;
      this.defaultButtonColor="#006400;";

      this.originalScanButtonBackgroundColor = "#6567DF";
      this.brainExtractionButtonBackgroundColor = "#9A9AE9";
      this.corticalThicknessButtonBackgroundColor = "#9A9AE9";
      this.warpedImageButtonBackgroundColor = "#9A9AE9";

      this.commentsSelFormGroup = new FormGroup({
        commentTypeSel: new FormControl('Usr'),
      });

      this.totalVoxelsRegions = [];
      this.totalVoxelsRegionNumbers= [];
      this.thresholdProportionalRegions= [];
      this.thresholdProportionalRegionNumbers= [];
      this.zmBinRegions= [];
      this.zmBinRegionNumbers = [];

      this.initialise3dArray();

      // this.rotate3dService.getOverlayData(this.fileId).then(brainViewerData => {
      //
      //     this.brainViewerData = brainViewerData;
      //     this.uploadFolder = this.brainViewerData.uploadFolder;
      //
      //     this.overlayDataList = this.brainViewerData.overlayDataList;
      //
      //     this.originalScanEnabled = this.brainViewerData.originalScanFlag;
      //     // console.log(" this.originalScanEnabled " + this.originalScanEnabled);
      //     this.brainExtractionEnabled = this.brainViewerData.brainExtractionFlag;
      //     this.corticalThicknessEnabled = this.brainViewerData.corticalThicknessFlag;
      //     this.warpedImageEnabled = this.brainViewerData.warpedImageFlag;
      //
      //     this.roiDataFlag = this.brainViewerData.roiDataFlag;
      //     this.saliencyDataFlag = this.brainViewerData.saliencyDataFlag;
      //
      //     this.regionInfoList = this.brainViewerData.regionInfoList;
      //
      //     this.pdScore = this.brainViewerData.pdScore;
      //     this.saliencyMapSelected = false;
      //
      //     this.imageClasses = this.brainViewerData.imageClasses;
      //     this.imageTypes = this.brainViewerData.imageTypes;
      //     this.roiData = this.brainViewerData.roiData;
      //     this.saliencyData = this.brainViewerData.saliencyData;
      //     this.saliencyInfo = this.brainViewerData.saliencyInfo;
      //     this.shape = this.brainViewerData.shape;
      //     console.log (" the shape is " + this.shape );
      //
      //     this.mainPanelWidth = 2*(+this.shape);
      //     this.mainPanelHeight = 2*(+this.shape);
      //     this.sidePanelWidth = +this.shape;
      //     this.sidePanelWidth = +this.shape;
      //
      //     this.imagePrefixes = this.brainViewerData.imagePrefixes;
      //     this.ppvValue = this.brainViewerData.ppvValue;
      //     this.npvValue = this.brainViewerData.npvValue;
      //     this.sliceNumArray = [0,0,0];
      //     this.boxPlotData = this.brainViewerData.boxPlotData;
      //     this.boxPlotImagePath = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,'
      //                      + this.boxPlotData);
      //
      //     this.totalVoxelsSelected = false;
      //     this.thresholdProportionalSelected = false;
      //     this.zmBinSelected = false;
      //     this.disableLineChartsSelection = true;
      //     this.midSliceNumArray = [146,146,146];
      //     this.coordsArray = [146,146,146];
      //     this.planeSelectionArray = [0,1,2];
      //     this.showParamsFlag = false;
      //     this.showHideCommentsFlag = true;
      //     this.regionsSelected = false;
      //     this.searchText = "";
      //
      //     this.commentsFilterButtonColor_0 = "#609FA7";
      //     this.commentsFilterButtonColor_1 = "#609FA7";
      //     this.commentsFilterButtonColor_2 = "#478B93";
      //
      //     if (this.overlayDataList.length > 0){
      //       this.comments = this.overlayDataList[0].comments;
      //     }
      //
      //     if (this.brainViewerData.saliencyInfo) {
      //
      //       this.totalVoxelsData = this.brainViewerData.saliencyInfo.totalVoxelsData;
      //       this.totalVoxelRegionNames = this.brainViewerData.saliencyInfo.totalVoxelRegionNames;
      //       this.thresholdProportionalRegionNumbers = this.brainViewerData.saliencyInfo.thresholdProportionalRegionNumbers;
      //       this.thresholdProportionalData = this.brainViewerData.saliencyInfo.thresholdProportionalData;
      //       this.zmBinRegionNumbers = this.brainViewerData.saliencyInfo.zmBinRegionNumbers;
      //       this.zmBinData = this.brainViewerData.saliencyInfo.zmBinData;
      //
      //       this.totalVoxelsRegions = this.brainViewerData.saliencyInfo.totalVoxelsRegions;
      //       this.totalVoxelsColors = this.brainViewerData.saliencyInfo.totalVoxelsColors;
      //       this.totalVoxelsRGBAColors = this.brainViewerData.saliencyInfo.totalVoxelsRGBAColors;
      //       this.totalVoxelsRGBA02Colors = this.brainViewerData.saliencyInfo.totalVoxelsRGBA02Colors;
      //       this.totalVoxelsRGBA08Colors = this.brainViewerData.saliencyInfo.totalVoxelsRGBA08Colors;
      //       this.totalVoxelsRegionNumbers = this.brainViewerData.saliencyInfo.totalVoxelsRegionNumbers;
      //
      //       this.thresholdProportionalRegions = this.brainViewerData.saliencyInfo.thresholdProportionalRegions;
      //       this.thresholdProportionalColors = this.brainViewerData.saliencyInfo.thresholdProportionalColors;
      //       this.thresholdProportionalRGBAColors = this.brainViewerData.saliencyInfo.thresholdProportionalRGBAColors;
      //       this.thresholdProportionalRGBA02Colors = this.brainViewerData.saliencyInfo.thresholdProportionalRGBA02Colors;
      //       this.thresholdProportionalRGBA08Colors = this.brainViewerData.saliencyInfo.thresholdProportionalRGBA08Colors;
      //       this.thresholdProportionalRegionNumbers = this.brainViewerData.saliencyInfo.thresholdProportionalRegionNumbers;
      //
      //       this.zmBinRegions = this.brainViewerData.saliencyInfo.zmBinRegions;
      //       this.zmBinColors = this.brainViewerData.saliencyInfo.zmBinColors;
      //       this.zmBinRGBAColors = this.brainViewerData.saliencyInfo.zmBinRGBAColors;
      //       this.zmBinRGBA02Colors = this.brainViewerData.saliencyInfo.zmBinRGBA02Colors;
      //       this.zmBinRGBA08Colors = this.brainViewerData.saliencyInfo.zmBinRGBA08Colors;
      //       this.zmBinRegionNumbers = this.brainViewerData.saliencyInfo.zmBinRegionNumbers;
      //
      //       this.totalVoxelsLineChartData = this.brainViewerData.saliencyInfo.totalVoxelsLineChartData;
      //       this.thresholdProportionalLineChartData = this.brainViewerData.saliencyInfo.thresholdProportionalLineChartData;
      //       this.zmBinLineChartData = this.brainViewerData.saliencyInfo.zmBinLineChartData;
      //
      //       this.lineChartLabels = this.brainViewerData.saliencyInfo.lineChartLabels;
      //
      //       this.setGraphData();
      //       this.setLineChartData();
      //
      //       this.regionInfoList = this.brainViewerData.regionInfoList;
      //       for (let i = 0; i< this.regionInfoList.length; i++){
      //           this.dropdownList.push({'item_id':this.regionInfoList[i].regionNumber, 'item_text':this.regionInfoList[i].regionName});
      //           this.regionInfoMap[this.regionInfoList[i].regionNumber] =  this.regionInfoList[i];
      //       }
      //
      //       this.selectedRegions = [
      //
      //       ];
      //       this.dropdownSettings = {
      //         singleSelection: false,
      //         idField: 'item_id',
      //         textField: 'item_text',
      //         selectAllText: 'Select All',
      //         unSelectAllText: 'UnSelect All',
      //         itemsShowLimit: 3,
      //         allowSearchFilter: true
      //       };
      //
      //     }
      //     // clear out data from memory
      //     this.brainViewerData = new BrainViewerData();
      //     this.disableSelection = false;
      //
      //     this.showPage();
      // });

    }

    constructor( private rotate3dService: Rotate3DService,
                 private sanitizer: DomSanitizer,
                 private route:ActivatedRoute,
                 private modalService: NgbModal,
                 private commentModalService: NgbModal,
                 private _elementRef: ElementRef,
                 private helpModalService: HelpModalService,
                 private formBuilder: FormBuilder,
               ) {
    };

}
