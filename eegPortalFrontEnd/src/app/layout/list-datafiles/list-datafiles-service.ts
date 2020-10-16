import { Observable } from "rxjs/Rx"
import { Injectable, OnInit }     from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Datafile, UploadFolder } from '../../models/datafile';
import {AppSettings} from '../../app.settings';

@Injectable()
export class ListDatafilesService {

    public getDatafilesUrl = AppSettings.BASE_URL + "/eegPortalApp/listUploadedFiles/";
    public searchDatafilesUrl = AppSettings.BASE_URL + "/eegPortalApp/searchUploadedFolders/";
    public deleteDatafileUrl = AppSettings.BASE_URL + "/eegPortalApp/deleteDatafile/";

    constructor (private http: HttpClient) {}

    getDatafiles(): Promise<UploadFolder[]> {
      return this.http.post(this.getDatafilesUrl, {}).toPromise().then(res => res as UploadFolder[]).catch(this.handleError);
    }

    deleteDatafile(datafileId:string): Promise<string> {
       return this.http.post(this.deleteDatafileUrl, {"datafileId":datafileId}).toPromise().then(res => res)
       .catch(this.handleError);
    }

    searchDatafiles(searchString:string): Promise<UploadFolder[]> {
       return this.http.post(this.searchDatafilesUrl, {"searchString":searchString}).toPromise().then(res => res as UploadFolder[])
       .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
      console.error('An error occurred', error); // for demo purposes only
      return Promise.reject(error.message || error);
    }

}
