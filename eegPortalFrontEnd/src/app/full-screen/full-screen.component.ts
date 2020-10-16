import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener, ChangeDetectionStrategy} from '@angular/core';
// import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
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
import { ParamsModalComponent } from '../params-modal/params-modal.component';
import { Color, BaseChartDirective } from 'ng2-charts';
// import { OverlayData, BarPlotData, BrainData, Region, SaliencyInfo, BrainViewerData, RegionInfo } from '../models/overlayData';
import { OverlayData, SaliencyData, BarPlotData, BrainData, Region, SaliencyInfo, BrainViewerData, RegionInfo, PredictionData, StatsImageObj } from '../models/overlayData';

@Component({
  selector: 'ngbd-modal-content',
  providers: [FullScreenService],
  templateUrl: './full-screen.component.html',
  styleUrls: ['./full-screen.component.scss'],
})

export class FullScreenComponent implements OnInit {

  @Input() name;
  @Input() uploadFolderId;
  @Input() index;
  @Input() canvas;
  @Input() canvas_saliency;
  @Input() canvas_comment;
  @Input() canvas_coords;
  @Input() canvas_orientation;
  @Input() canvas_crossHair;
  @Input() canvas_fullScreen;

  @Input() shape;
  @Input() shapeLPI;

  // shape:number;
  // shapeLPI:number;

  @Input() target;
  @Input() selectedView;
  @Input() sliceNumArray;
  // @Input() niftiHeaders;
  // @Input() niftiImages;
  // @Input() roiNiftiHeaders;
  // @Input() roiNiftiImages;
  // @Input() saliencyNiftiHeaders;
  // @Input() saliencyNiftiImages;
  @Input() saliencyMapSliderValue;
  @Input() roiSliderValue;
  @Input() selectedRegions;
  @Input() planeSelectionArray;
  @Input() coordsArray;
  @Input() regionInfoMap;
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

  @Input() roiDataFlag;
  @Input() saliencyDataFlag;

  @Input() regionInfoList;

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
  @Input() Base64Binary;

  @Input() mainPanelWidth;
  @Input() mainPanelHeight;

  @Input() sidePanelWidth;
  @Input() sidePanelHeight;
  @Input() comments;

  @Input() midSliceNum;
  @Input() xPosition;
  @Input() yPosition;
  @Input() zPosition;

  @Input() fileId;

  @Input() niftiTypedDataList;
  @Input() roiTypedDataList;
  @Input() saliencyTypedDataList;
  @Input() dims;
  @Input() saliencyDataList;
  @Input() selectedSaliencyDataIndex;
  @Input() predictionDataList;
  @Input() predictionData;
  @Input() selectedSaliencyColor;

  @Input()  fullScreenNiftiTypedDataList;
  @Input()  fullScreenRoiTypedDataList;
  @Input()  fullScreenSaliencyTypedDataList;
  @Input()  preLoaded;

  // event emitter for changes in modal box
  @Output() commentsListChange = new EventEmitter<Comment[]>();
  // event emitter for slices selected in scrolling to broadcast events outside the event listener
  @Output() sliceNumArrayChange = new EventEmitter<number[]>();
  // event emitter for slices selected in scrolling to broadcast events outside the event listener
  @Output() coordinatesChange = new EventEmitter<number[]>();
  @Output() brightnessContrastArrayChange = new EventEmitter<number[]>();

  @Output() saveEvent = new EventEmitter<string>();

  disableSubmit:boolean;
  commentForm: FormGroup;
  allowAddComment:boolean;
  showParamsFlag:boolean;
  brainViewerData:BrainViewerData;
  drawImageFlag:boolean;
  message: string;
  disableOriginalScanFlag: boolean;
  disableBrainExtractionFlag: boolean;
  niftiImages = Array();
  niftiHeaders = Array();

  roiNiftiImages = Array();
  roiNiftiHeaders = Array();

  saliencyNiftiImages = Array();
  saliencyNiftiHeaders = Array();
  fullScreenFlag:boolean;
  commentsListChangeListener = this.commentsListChange.subscribe((comments) => {
      this.comments = comments;
  });

  brightnessContrastArrayChangeListener = this.brightnessContrastArrayChange.subscribe((brightnessContrastArray) => {
      this.contrastFactor = brightnessContrastArray[0];
      this.brightnessFactor = brightnessContrastArray[1];
  });

  @ViewChild(BaseChartDirective) // for the dynamic charts
  public chart: BaseChartDirective; // Now you can reference your chart via `this.chart`

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

  }

}
