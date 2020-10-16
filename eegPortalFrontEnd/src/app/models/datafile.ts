export class Datafile {
  name:string;
  chksum:string;
}

export class Log {
  processName:string;
  logValue:string;
}
export class PhaseData {
  fGamma:string[];
  MIs:number[];
}

export class ChannelObj {
  channelLabel:string;
  isSelected:boolean;
}

export class QAObj {

  rawData:number[];
  rawDataLabels:string[];

  artData:number[];

  meanValues:number[];
  varValues:number[];

  meanOutliersZScores:number[];
  varOutliersZScores:number[];

  zValueOutlierRegions:number[];
  icqOutlierRegions:number[];

  plotDataString:string;

  channelLabel:string;
  isSelected:boolean;

  meanOutliers:number[];
  varOutliers:number[];

}

export class Epoch {
  id:number;
  startTime:number;
  endTime:number;
}

export class EpochResultObj {
  epochs:Epoch[];
  epochTimePoints:number[];
}

export class MontageChannel {
  id:number;
  channel1 :string;
  channel2 :string;
  resultChannel :string;
}

export class Montage {
  id:number;
  name:string;
  montageChannels:MontageChannel[];
}

export class UploadFolder {
  id:string;
  name:string;
  fileName:string;
  fileType:string;
  user:string;
  chksum:string;
  description:string;
  status:string;
  uploadedDate:Date;
  analysisProtocol:string;
  analysisSubmittedDate:Date;
  analysisCompletedDate:Date;
  rowColor:string;
  resultsAvailable:boolean;
  logs:Log;

  samplingFrequency:number;
  numChannels:number;
  channelObjs:ChannelObj[];

  channelQAObjs:QAObj[];

  beginTime:number;
  endTime:number;

  epochList:Epoch[];

  montageList:Montage[];

  epochTimePoints:number[];

  artDataList:number[];

  meanOutliersList:number[];

}

export class PacParams {

  lcut :number;
  hcut :number;
  rippleDB :number;
  bandWidth :number;
  attenHz :number;
}
export class PlvParams {

  lcut :number;
  hcut :number;
  rippleDB :number;
  bandWidth :number;
  attenHz :number;

}

export class ICAPlotObj {

  plotData:number[];
  plotLabels:string[];

}

export class AnalysisResult {

  rawData:number[];
  rawDataLabels:string[];

  psdData:number[];
  psdDataLabels:string[];
  spectrogramData:number[][];

  spectrogramString:string;
  psdString:string;

  dynamicSpectrogramPlot:boolean;
  channelLabel:string;
  bandData:number[];
  bandLabels:string[];

  pacFgamma:string[];
  pacMI:number[];

}

export class ICAMethod {
  methodName:string;
  rowColor:string;
}

export class AnalysisDetail {
  uploadFolder:UploadFolder;
  upperFrequency:number;
  lowerFrequency:number;
  timeBandWidth:number;
  timeWindow:number;
  stepSize :number;
  numTapers:number;
  status:number;
  // upperTimeLimit:number;
  // lowerTimeLimit:number;
  analysisResultList:AnalysisResult[];
  channelObjs:ChannelObj[];
  crossSpectrogramData:number[][];
  submittedOn:Date;
  pacParams:PacParams;
  plvParams:PlvParams;

  channel1:string;
  channel2:string;

  plvFgamma:string[];
  plvPlv:number[];

}

export class UploadFolderSubmitObj {
  uploadFolder:UploadFolder;
  message:string;
}
