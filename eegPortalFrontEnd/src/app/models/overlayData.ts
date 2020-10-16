import { UploadFolder } from './datafile';
import { Comment } from './comment';

export class RoiData {
  roiId:number;
  roiData:string;
}

export class BrainData {
  brainData:string;
}

export class Region {
  regionId:number;
  regionName:string;
}

export class OverlayData{
    imageClass:string;
    allData : BrainData;
    comments:Comment[];
}

export class SaliencyInfo{

    totalVoxelsRegions:string[];
    totalVoxelsRegionNumbers:string[];

    totalVoxelsColors:string[];
    totalVoxelsRGBAColors:string[];
    totalVoxelsRGBA02Colors:string[];
    totalVoxelsRGBA08Colors:string[];

    totalVoxelsData:number[][];
    totalVoxelsLineChartData:number[][];
    lineChartLabels:string[];

    thresholdProportionalRegions:string[];
    thresholdProportionalRegionNumbers:string[];

    thresholdProportionalColors:string[];
    thresholdProportionalRGBAColors:string[];
    thresholdProportionalRGBA02Colors:string[];
    thresholdProportionalRGBA08Colors:string[];

    thresholdProportionalData:number[][];
    thresholdProportionalLineChartData:number[][];

    zmBinRegions:string[];
    zmBinRegionNumbers:string[];

    zmBinColors:string[];
    zmBinRGBAColors:string[];
    zmBinRGBA02Colors:string[];
    zmBinRGBA08Colors:string[];

    zmBinData:number[][];
    zmBinLineChartData:number[][];

    totalVoxelRegionNames:string[];
}

export class BarPlotData{
    column1Data:string[];
    column2Data:string[];
    column3Data:string[];
}

export class RegionInfo {
  regionNumber:number;
  regionName:string;
  abbreviation:string;
  redColor:number;
  blueColor:number;
  greenColor:number;
  hexColor:string;
}

export class SaliencyData {
  description:number;
  saliencyValues:string;
  buttonColor:string;
}

export class PredictionData {
  pdScore:number;
  ppvValue:number;
  npvValue:number;
  barChartData:number[];
  barChartLabels:string[];
}

export class StatsImageObj {
  name:string;
  statsImagePath:any;
  statsImageData:any;
}

export class ReportData{
  corticalThicknessHeaders:string[];
  corticalThicknessList:string[];

  mriQCColumns:string[];
  mriQCValues:string[];

  demographicsColumns:string[];
  demographicsValues:string[];

  roiColumns:string[];
  roiValues:string[];

  reportGraphTitles:string[];
  reportGraphDataList:any[];

  reportGraphPathList:any[];
}

export class BrainViewerData {
  uploadFolder:UploadFolder;
  imageClasses:string[];
  overlayDataList:OverlayData[];
  roiData:string[];
  saliencyDataList:SaliencyData[];
  regions:Region[];
  imageTypes:string[];
  imagePrefixes:string[];
  shape:number;

  predictionDataList:PredictionData[];
  predictionDataFlag:boolean;

  saliencyInfo:SaliencyInfo;
  barPlotDataSets:BarPlotData[];
  originalScanFlag:boolean;
  brainExtractionFlag:boolean;
  roiDataFlag:boolean;
  saliencyDataFlag:boolean;
  statsImageObjList:StatsImageObj[];
  corticalThicknessImageObjList:StatsImageObj[];
  regionInfoList:RegionInfo[];
  boxPlotData:string;

  // report info
  reportData:ReportData;
}
