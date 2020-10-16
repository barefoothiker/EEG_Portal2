import { Component, OnInit, Input, Output, EventEmitter, ViewChild} from '@angular/core';
// import { ParamsModalSubmitService } from '../services/params-modal-submit.service';

import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FullScreenService } from '../services/full-screen.service';
import { Comment } from '../models/comment';
import * as math from 'mathjs'
import * as nifti from "nifti-reader-js"
import { BrainViewerService } from '../layout/brain-viewer/brain-viewer-service';
import { HelpModalService } from '../services/help-modal.service';
import { HelpModalComponent } from '../help-modal/help-modal.component';
import { CommentModalService } from '../services/comment-modal.service';
import { ParamsModalService } from '../services/params-modal.service';
import { CommentModalComponent } from '../comment-modal/comment-modal.component';
import { Color, BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'ngbd-modal-content',
  providers: [],
  templateUrl: './params-modal.component.html',
  styleUrls: ['./params-modal.component.scss'],
})
// />

export class ParamsModalComponent implements OnInit {

  @Input() name;
  @Input() uploadFolderId;
  @Input() index;
  @Input() canvas;
  @Input() shape;
  @Input() shapeLPI;
  @Input() target;
  @Input() selectedView;
  @Input() sliceNumArray;
  @Input() niftiHeaders;
  @Input() niftiImages;
  @Input() roiNiftiHeaders;
  @Input() roiNiftiImages;
  @Input() saliencyNiftiHeaders;
  @Input() saliencyNiftiImages;
  @Input() saliencyMapSliderValue;
  @Input() roiSliderValue;
  @Input() selectedRegions;
  @Input() planeSelectionArray;
  @Input() coordsArray;
  @Input() regionInfoMap;
  @Input() comments;
  @Input() displayRoiFlag;
  @Input() displaySaliencyFlag;
  @Input() showCrossHairsFlag;
  @Input() mousePos;
  @Input() imagePrefixes;
  @Input() selectedImageClass;
  @Input() uploadFolder;
  @Input() mousePress;
  @Input() regionInfoObj;
  @Input() contrastFactor;
  @Input() brightnessFactor;
  @Input() imageLoaded_0;
  @Input() imageLoaded_1;
  @Input() imageLoaded_2;

  @Input() saliencyDataFlag;
  @Input() saliencyDataList;

  @Input() brainData;
  @Input() roiData;
  @Input() saliencyData;

  @Input() brainViewerService;
  @Input() helpModalService;
  @Input() commentModalService;

  @Input() originalScanEnabled;
  @Input() brainExtractionEnabled;
  @Input() saliencyMapSelected;
  @Input() totalVoxelsSelected;
  @Input() thresholdProportionalSelected;
  @Input() zmBinSelected;
  @Input() selectedRegionsList;
  @Input() dropdownSettings;
  @Input() dropdownList;
  @Input() selectedRegionsMap;
  @Input() regionsSelected;

  @Input() totalVoxelsPlotRegions;
  @Input() totalVoxelsRegions;
  @Input() totalVoxelsColors;
  @Input() totalVoxelsRGBAColors;
  @Input() totalVoxelsRGBA02Colors;
  @Input() totalVoxelsRGBA08Colors;
  @Input() totalVoxelsRegionNumbers;

  @Input() totalVoxelRegionNames;
  @Input() totalVoxelsData;
  @Input() totalVoxelsPlotData;
  @Input() totalVoxelsLabels;
  @Input() totalVoxelsLabel;

  @Input() thresholdProportionalRegions;
  @Input() thresholdProportionalColors;
  @Input() thresholdProportionalRGBAColors;
  @Input() thresholdProportionalRGBA02Colors;
  @Input() thresholdProportionalRGBA08Colors;
  @Input() thresholdProportionalRegionNumbers;

  @Input() thresholdProportionalData;
  @Input() thresholdProportionalPlotData;
  @Input() thresholdProportionalLabels;
  @Input() thresholdProportionalLabel;

  @Input() zmBinRegions;
  @Input() zmBinRGBAColors;
  @Input() zmBinColors;
  @Input() zmBinRGBA02Colors;
  @Input() zmBinRegionNumbers;
  @Input() zmBinRGBA08Colors;

  @Input() zmBinData;
  @Input() zmBinPlotData;
  @Input() zmBinRegionsLabel;
  @Input() zmBinLabels;
  @Input() zmBinLabel;

  @Input() totalVoxelsColorsList;
  @Input() thresholdProportionalColorsList;
  @Input() zmBinColorsList;

  @Input() totalVoxelsLineChartLegend;
  @Input() thresholdProportionalLineChartLegend;
  @Input() zmBinLineChartLegend;

  @Input() totalVoxelsLineChartColors;
  @Input() thresholdProportionalLineChartColors;
  @Input() zmBinLineChartColors;

  @Input() lineChartLabels;
  @Input() lineChartOptions;
  @Input() lineChartColors;
  @Input() lineChartLegend;
  @Input() lineChartType;

  @Input() fullScreenView;

  @Input() lineChartPlugins;

  @Input() listStyle;
  // for checking if drawing canvas first time
  @Input() initFlag;
  // show hide params panel
  @Input() showHideCommentsFlag;

  // check if any regions are selected and show total voxels, threshold coulds, zmbin checkboxes correspondingly
  @Input() defaultButtonColor;
  @Input() unSelectedDefaultButtonColor;
  @Input() commentsSelFormGroup;
  @Input() commentTypeSel;

  @Input() commentsFilterButtonColor_0;
  @Input() commentsFilterButtonColor_1;
  @Input() commentsFilterButtonColor_2;
  @Input() commentsAll;

  @Input() originalScanButtonBackgroundColor;
  @Input() brainExtractionButtonBackgroundColor;

  @Input() totalVoxelsLineChartDataSet;
  @Input() thresholdProportionalLineChartDataSet;
  @Input() zmBinLineChartDataSet;

  @Input() totalVoxelsLineChartData;
  @Input() thresholdProportionalLineChartData;
  @Input() zmBinLineChartData;

  @Input() overlayData;
  @Input() overlayDataList;
  @Input() loadingDataFlag;
  @Input() allData;

  @Input() disableSelection;
  @Input() disableLineChartsSelection;
  @Input() disableSaliencySlider;
  @Input() selectedSaliencyDataIndex;
  @Input() predictionDataList;
  @Input() selectedSaliencyColor;

  @Input() disableOriginalScanFlag;
  @Input() disableBrainExtractionFlag;  

  disableSubmit:boolean;
  commentForm: FormGroup;
  allowAddComment:boolean;
  showParamsFlag:boolean;

  message: string;

  @Output() changeImageClassEvent = new EventEmitter<string>();
  @Output() saliencyMapSliderEvent = new EventEmitter<string>();
  @Output() setSaliencyDataEvent = new EventEmitter<string>();
  @Output() displaySaliencyMapEvent = new EventEmitter<string>();
  @Output() roiSliderEvent = new EventEmitter<string>();
  @Output() regionSelectEvent = new EventEmitter<string>();
  @Output() regionDeSelectEvent = new EventEmitter<string>();
  @Output() changeViewEvent = new EventEmitter<string>();
  @Output() gotoCenterEvent = new EventEmitter<string>();
  @Output() showHideCrossHairsEvent = new EventEmitter<string>();
  @Output() resetBrightnessContrastEvent = new EventEmitter<string>();
  @Output() selectedSaliencyColorEvent = new EventEmitter<string>();

  @ViewChild(BaseChartDirective) // for the dynamic charts
  public chart: BaseChartDirective; // Now you can reference your chart via `this.chart`

  // handle region selection from drop down list
  ngOnInit() {

    this.disableSubmit = true;
    this.showParamsFlag = false;
    this.defaultButtonColor="#93477C;";

    this.unSelectedDefaultButtonColor="#834793;";

    this.originalScanButtonBackgroundColor = "#9A9AE9";
    this.brainExtractionButtonBackgroundColor = "#9A9AE9";

    this.commentsSelFormGroup = new FormGroup({
      commentTypeSel: new FormControl('Usr'),
    });

    this.totalVoxelsRegions = [];
    this.totalVoxelsRegionNumbers= [];
    this.thresholdProportionalRegions= [];
    this.thresholdProportionalRegionNumbers= [];
    this.zmBinRegions= [];
    this.zmBinRegionNumbers = [];
    this.totalVoxelsLabel = [];
    this.thresholdProportionalLabel = [];
    this.zmBinLabel = [];

    // this.showCrossHairsFlag = true;

    this.displayRoiFlag = false;
    this.displaySaliencyFlag = false;
    this.loadingDataFlag = false;

    this.contrastFactor = 0;
    this.brightnessFactor = 0;

    this.mousePos = {
                      x:0,
                      y:0
                    };

    if (this.selectedImageClass == 0){
        this.originalScanButtonBackgroundColor = "#6567DF";
    } else if (this.selectedImageClass == 1){
      this.brainExtractionButtonBackgroundColor = "#6567DF";
      this.displaySaliencyFlag = true;
      this.displayRoiFlag = true;
    }

    for(var i = 0; i < (this.imagePrefixes).length; i++){

      let button = document.getElementById('button_' + i + '_' + i);

      if(button){
        if(i == this.selectedView){
          button.setAttribute("style", "background-color:#93477C;");
        } else {
          button.setAttribute("style", "background-color:#834793;");
        }
      }
    }

  }

  setSaliencyColor(){
    this.selectedSaliencyColorEvent.emit(this.selectedSaliencyColor);
  }

  setSaliencyData(selectedSaliencyDataIndex){
    this.setSaliencyDataEvent.emit(selectedSaliencyDataIndex);
  }

  showHideCrossHairs(){
    if (this.showCrossHairsFlag)
      {
        this.showCrossHairsFlag = false;
        this.showHideCrossHairsEvent.emit("false");
      }else{
        this.showCrossHairsFlag = true;
        this.showHideCrossHairsEvent.emit("true");
      }
  }

  onRegionSelect(item: any) {
    this.regionSelectEvent.emit(item);
  }

  // handle region selection from drop down list
  onRegionDeSelect(item: any) {
    this.regionDeSelectEvent.emit(item);
  }

  // handler for select all regions
  onSelectAll(items: any) {
    console.log(items);
  }

  gotoCenter(){
    this.gotoCenterEvent.emit("gotoCenter");
  }

  setRoiSliderValue(){

    let roiSlider = document.getElementById('roiSlider') as HTMLInputElement;
    this.roiSliderValue = Number(roiSlider.value);
    this.roiSliderEvent.emit(this.roiSliderValue);

  }

  resetBrightnessContrast(){
    this.resetBrightnessContrastEvent.emit("reset brightness contrast");
  }
  // switch between views: coronal, axial and sagittal
  changeView(selectedView){


    for(var i = 0; i < (this.imagePrefixes).length; i++){

      let button = document.getElementById('button_' + i + '_' + i);

      // if buttons are rendered
      if(button){
        if(i == selectedView){
          button.setAttribute("style", "background-color:#93477C;");
        } else {
          button.setAttribute("style", "background-color:#834793;");
        }
      }

      if (selectedView == 0){
        this.defaultButtonColor = "#93477C";
      } else {
        this.defaultButtonColor = "#834793";
      }

      this.changeViewEvent.emit(selectedView);

    }
  }// end method

  // switch between image classes : original brain, brain extraction, cortical thickness, warped image
  changeImageClass(imageClass){

      this.displaySaliencyFlag = false;
      this.displayRoiFlag = false;

      this.selectedImageClass= imageClass;

      this.originalScanButtonBackgroundColor = "#9A9AE9";
      this.brainExtractionButtonBackgroundColor = "#9A9AE9";

      if (imageClass == 0){
          this.originalScanButtonBackgroundColor = "#6567DF";
      } else if (imageClass == 1){
        this.brainExtractionButtonBackgroundColor = "#6567DF";
        this.displaySaliencyFlag = true;
        this.displayRoiFlag = true;
      }
      this.changeImageClassEvent.emit(imageClass);

  } // end method

  setSaliencyMapSliderValue(){

    let saliencyMapSlider = document.getElementById('saliencyMapSlider') as HTMLInputElement;
    this.saliencyMapSliderValue = Number(saliencyMapSlider.value);
    this.saliencyMapSliderEvent.emit(this.saliencyMapSliderValue);
  }

  displaySaliencyMap(){
    this.displaySaliencyMapEvent.emit(this.saliencyMapSelected);
  }
  constructor(
   public activeModal: NgbActiveModal,
   private fullScreenService:FullScreenService,
   private formBuilder: FormBuilder,
  ) {
    this.createForm();
    this.allowAddComment = false;
  }

    private checkInput(){
      if (this.commentForm.value != ''){
        this.disableSubmit = false;
      }
    }
    private createForm() {
      // this.commentForm = this.formBuilder.group({
      //   commentText: ''
      // });
    }

}
