import { Injectable, OnInit, Output, EventEmitter}     from '@angular/core';
import { Observable } from "rxjs/Rx"
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BrainViewerData } from '../models/overlayData';
import {AppSettings} from '../app.settings';

@Injectable()
﻿export class FullScreenService {

    // event emitter for changes in modal box
    @Output() closeEvent = new EventEmitter<string>();

    private modals: any[] = [];

    public getOverlayDataUrl =  AppSettings.BASE_URL + "/eegPortalApp/getFullScreenOverlayData/";
    public fetchAllCommentsUrl = AppSettings.BASE_URL + "/eegPortalApp/fetchAllComments/";

    constructor (private http: HttpClient) {}

    add(modal: any) {
        // add modal to array of active modals
        this.modals.push(modal);
    }

    remove(id: string) {
        // remove modal from array of active modals
        this.modals = this.modals.filter(x => x.id !== id);
    }

    open(id: string) {
        // open modal specified by id
        let modal: any = this.modals.filter(x => x.id === id)[0];
        modal.open();
    }

    close(id: string) {
        // close modal specified by id
        let modal: any = this.modals.filter(x => x.id === id)[0];
        modal.close();
        this.closeEvent.emit("close");
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
