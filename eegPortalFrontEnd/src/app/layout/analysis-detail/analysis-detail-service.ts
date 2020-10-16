import { Observable } from "rxjs/Rx"
import { Injectable, OnInit }     from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Datafile, UploadFolder, UploadFolderSubmitObj, AnalysisDetail } from '../../models/datafile';

import 'rxjs/add/operator/toPromise';
import {AppSettings} from '../../app.settings';

@Injectable()
export class AnalysisDetailService {

    public getAnalysisDetailUrl = AppSettings.BASE_URL + "/eegPortalApp/getAnalysisDetail/";
    public submitAnalysisUrl = AppSettings.BASE_URL + "/eegPortalApp/submitAnalysis/";
    public reSubmitAnalysisUrl = AppSettings.BASE_URL + "/eegPortalApp/reSubmitAnalysis/";

    public updateDatafileNameUrl = AppSettings.BASE_URL + "/eegPortalApp/updateDatafileName/";

    // private message:string;
    constructor (private http: HttpClient) {}

    getAnalysisDetail(datafileId:any): Promise<AnalysisDetail> {
     return this.http.post(this.getAnalysisDetailUrl, {"datafileId":datafileId}).toPromise().then(res => res)
       .catch(this.handleError);
   }

   reSubmitAnalysis(samplingFrequency:number, timeBandWidth:number, numTapers:number, stepSize:number, timeWindow:number, lowerFrequency:number, upperFrequency:number,
     selectedChannels:string[], datafileId:string, upperTimeLimit:number, lowerTimeLimit:number, computePSDFlag:boolean,computeCrossCorrelationFlag:boolean,computePACFlag:boolean, computePLVFlag:boolean,
      channel1:string, channel2:string, lcut:number, hcut:number, rippleDB:number, bandWidth:number, attenHz:number
   ): Promise<UploadFolderSubmitObj> {
     return this.http.post(this.reSubmitAnalysisUrl, {"datafileId":datafileId,
     "timeBandWidth":timeBandWidth, "numTapers": numTapers, "stepSize": stepSize, "windowSize":timeWindow, "lowerFrequency": lowerFrequency, "upperFrequency": upperFrequency,
       "selectedChannels":selectedChannels, "samplingFrequency":samplingFrequency, "upperTimeLimit":upperTimeLimit, "lowerTimeLimit":lowerTimeLimit, "computePSDFlag":computePSDFlag,
       "computeCrossCorrelationFlag":computeCrossCorrelationFlag,"computePACFlag":computePACFlag, "computePLVFlag":computePLVFlag, "channel1":channel1, "channel2":channel2,
       "lcut":lcut, "hcut":hcut, "rippleDB":rippleDB, "bandWidth":bandWidth, "attenHz":attenHz
     }).toPromise().then(res => res)
       .catch(this.handleError);
    }

    submitAnalysis(samplingFrequency:number, timeBandWidth:number, numTapers:number, stepSize:number, timeWindow:number, lowerFrequency:number, upperFrequency:number,
      selectedChannels:string[], datafileId:string, upperTimeLimit:number, lowerTimeLimit:number, computePSDFlag:boolean,computeCrossCorrelationFlag:boolean,computePACFlag:boolean, computePLVFlag:boolean,
       channel1:string, channel2:string, lcut:number, hcut:number, rippleDB:number, bandWidth:number, attenHz:number
    ): Promise<UploadFolderSubmitObj> {
      return this.http.post(this.submitAnalysisUrl, {"datafileId":datafileId,
      "timeBandWidth":timeBandWidth, "numTapers": numTapers, "stepSize": stepSize, "windowSize":timeWindow, "lowerFrequency": lowerFrequency, "upperFrequency": upperFrequency,
        "selectedChannels":selectedChannels, "samplingFrequency":samplingFrequency, "upperTimeLimit":upperTimeLimit, "lowerTimeLimit":lowerTimeLimit, "computePSDFlag":computePSDFlag,
        "computeCrossCorrelationFlag":computeCrossCorrelationFlag,"computePACFlag":computePACFlag, "computePLVFlag":computePLVFlag, "channel1":channel1, "channel2":channel2,
        "lcut":lcut, "hcut":hcut, "rippleDB":rippleDB, "bandWidth":bandWidth, "attenHz":attenHz
      }).toPromise().then(res => res)
        .catch(this.handleError);
     }

    updateDatafileName(datafileName:string, uploadFolderId:string): Promise<string> {
     return this.http.post(this.updateDatafileNameUrl, {"datafileName":datafileName, "uploadFolderId":uploadFolderId}).toPromise().then(res => res)
       .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
      console.error('An error occurred', error); // for demo purposes only
      return Promise.reject(error.message || error);
    }

}
