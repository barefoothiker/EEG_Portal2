import { Observable } from "rxjs/Rx"
import { Injectable, OnInit }     from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Datafile, UploadFolder, UploadFolderSubmitObj, Epoch, EpochResultObj, Montage , ICAPlotObj} from '../../models/datafile';
import 'rxjs/add/operator/toPromise';
import {AppSettings} from '../../app.settings';
@Injectable()
export class DatafileDetailService {

    public getDatafilesUrl = AppSettings.BASE_URL + "/eegPortalApp/getDatafile/";
    public submitAnalysisUrl = AppSettings.BASE_URL + "/eegPortalApp/submitAnalysis/";
    public updateDatafileNameUrl = AppSettings.BASE_URL + "/eegPortalApp/updateDatafileName/";
    public reloadDatafileUrl = AppSettings.BASE_URL + "/eegPortalApp/reloadDatafile/";
    public addEpochUrl = AppSettings.BASE_URL + "/eegPortalApp/addEpoch/";
    public removeEpochUrl = AppSettings.BASE_URL + "/eegPortalApp/removeEpoch/";

    public addMontageUrl = AppSettings.BASE_URL + "/eegPortalApp/addMontage/";
    public getMontageUrl = AppSettings.BASE_URL + "/eegPortalApp/getMontage/";

    public removeMontageUrl = AppSettings.BASE_URL + "/eegPortalApp/removeMontage/";

    public submitICAUrl = AppSettings.BASE_URL + "/eegPortalApp/submitICA/";

    public addMontageChannelUrl = AppSettings.BASE_URL + "/eegPortalApp/addMontageChannel/";
    public removeMontageChannelUrl = AppSettings.BASE_URL + "/eegPortalApp/removeMontageChannel/";

    constructor (private http: HttpClient) {}

    getDatafile(datafileId:any): Promise<UploadFolder> {
     return this.http.post(this.getDatafilesUrl, {"datafileId":datafileId}).toPromise().then(res => res)
       .catch(this.handleError);
   }

   reloadDatafile(fileId:string, selectedChannelQAIds:string[], upperQATimeLimit:number, lowerQATimeLimit:number): Promise<UploadFolder> {
     return this.http.post(this.reloadDatafileUrl, {"datafileId":fileId,"selectedChannelQAIds":selectedChannelQAIds, "upperQATimeLimit":upperQATimeLimit, "lowerQATimeLimit":lowerQATimeLimit
     }).toPromise().then(res => res)
       .catch(this.handleError);
   }

   addEpoch(fileId:string, startTime:number, endTime:number): Promise<Epoch[]> {
      return this.http.post(this.addEpochUrl, {"datafileId":fileId,"startTime":startTime, "endTime":endTime
      }).toPromise().then(res => res)
        .catch(this.handleError);
   }

   submitICA(fileId:number, lowPassFilterFlag:boolean, lowPassFilterFrequency:number, highPassFilterFlag:boolean, highPassFilterFrequency:number): Promise<ICAPlotObj[]> {
       return this.http.post(this.submitICAUrl, {"datafileId":fileId, "lowPassFilterFlag":lowPassFilterFlag, "lowPassFilterFrequency":lowPassFilterFrequency, "highPassFilterFlag":highPassFilterFlag, "highPassFilterFrequency":highPassFilterFrequency
       }).toPromise().then(res => res)
         .catch(this.handleError);
   }

   addMontage(montageName:string): Promise<Montage[]> {
       return this.http.post(this.addMontageUrl, {"montageName":montageName
       }).toPromise().then(res => res)
         .catch(this.handleError);
   }

    getMontage(selectedMontageId:number): Promise<Montage> {
        return this.http.post(this.getMontageUrl, {"selectedMontageId":selectedMontageId
        }).toPromise().then(res => res)
          .catch(this.handleError);
    }

   addMontageChannel(montageId:number, montageChannel1:string, montageChannel2:string, resultChannel:string ): Promise<Montage> {
       return this.http.post(this.addMontageChannelUrl, {"montageId":montageId, "montageChannel1":montageChannel1, "montageChannel2":montageChannel2, "resultChannel":resultChannel
       }).toPromise().then(res => res)
         .catch(this.handleError);
   }

   removeMontage(montageId:number): Promise<Montage[]> {
      return this.http.post(this.removeMontageUrl, {"montageId":montageId
      }).toPromise().then(res => res)
        .catch(this.handleError);
   }

   removeMontageChannel(montageChannelId:number): Promise<Montage> {
       return this.http.post(this.removeMontageChannelUrl, {"montageChannelId":montageChannelId
       }).toPromise().then(res => res)
         .catch(this.handleError);
    }

   removeEpoch(fileId:string, epochId:number ): Promise<EpochResultObj> {
      return this.http.post(this.removeEpochUrl, {"datafileId":fileId,"epochId":epochId
      }).toPromise().then(res => res)
        .catch(this.handleError);
   }

   submitAnalysis(analysisProtocol:string, samplingFrequency:number, timeBandWidth:number, numTapers:number, stepSize:number, windowSize:number, lowerFrequency:number, upperFrequency:number,
     computeSpectrogramFlag:boolean,selectedChannels:string[], datafileId:string, upperTimeLimit:number, lowerTimeLimit: number, computePSDFlag: boolean,computeCrossCorrelationFlag:boolean,computePACFlag:boolean, computePLVFlag:boolean,
      channel1:string, channel2:string, lcut:number, hcut:number, rippleDB:number, bandWidth:number, attenHz:number
    ): Promise<UploadFolderSubmitObj> {
     return this.http.post(this.submitAnalysisUrl, {"datafileId":datafileId,"analysisProtocol":analysisProtocol,
     "timeBandWidth":timeBandWidth, "numTapers": numTapers, "stepSize": stepSize, "windowSize":windowSize, "lowerFrequency": lowerFrequency, "upperFrequency": upperFrequency,
       "computeSpectrogramFlag":computeSpectrogramFlag,"selectedChannels":selectedChannels, "samplingFrequency":samplingFrequency, "upperTimeLimit":upperTimeLimit, "lowerTimeLimit":lowerTimeLimit,
       "computePSDFlag":computePSDFlag, "computeCrossCorrelationFlag":computeCrossCorrelationFlag,"computePACFlag":computePACFlag, "computePLVFlag":computePLVFlag, "channel1":channel1, "channel2":channel2,
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
