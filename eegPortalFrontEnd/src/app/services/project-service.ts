import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
// import { MRNPatientQuery} from './../models/mrn-patient-query';

import {AppSettings} from '../app.settings';


@Injectable()
export class ProjectService {
  BASE_URL=AppSettings.BASE_URL;
  headers = new Headers({ 'Content-Type': 'application/json' });
  // listUploadFoldersUrl = this.BASE_URL+'/eegPortalApp/listUploadFolders/';

  public  constructor(private http: HttpClient) { }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
