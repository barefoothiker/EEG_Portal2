import { Observable } from "rxjs/Rx"
import { Injectable, OnInit }     from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BrainViewerData } from '../../models/overlayData';
import { Comment } from '../../models/comment';
import {AppSettings} from '../../app.settings';

@Injectable()
export class BrainViewerService {

    public getOverlayDataUrl =  AppSettings.BASE_URL + "/eegPortalApp/getOverlayData/";
    public getFullScreenOverlayDataUrl =  AppSettings.BASE_URL + "/eegPortalApp/getFullScreenOverlayData/";
    public fetchAllCommentsUrl = AppSettings.BASE_URL + "/eegPortalApp/fetchAllComments/";

    constructor (private http: HttpClient
                ) {}

    getOverlayData(datafileId:string): Promise<BrainViewerData> {
     return this.http.post(this.getOverlayDataUrl, {"datafileId":datafileId}).toPromise().then(res => res)
       .catch(this.handleError);
   }

   getFullScreenOverlayData(datafileId:string): Promise<BrainViewerData> {
    return this.http.post(this.getFullScreenOverlayDataUrl, {"datafileId":datafileId}).toPromise().then(res => res)
      .catch(this.handleError);
   }

   fetchAllComments(uploadFolderId:string): Promise<Comment[]> {
    return this.http.post(this.fetchAllCommentsUrl, { "uploadFolderId":uploadFolderId}).toPromise().then(res => res)
      .catch(this.handleError);
   }

    private handleError(error: any): Promise<any> {
      console.error('An error occurred', error); // for demo purposes only
      return Promise.reject(error.message || error);
    }

}
