import { Component } from '@angular/core';
import { FileUploader} from 'ng2-file-upload';
import {UploadFolder} from '../../../../models/datafile';
import { DatafileDetailService } from '../../../datafile-detail/datafile-detail-service';
import {AppSettings} from '../../../../app.settings';

const URL = AppSettings.BASE_URL + '/eegPortalApp/submitUploadFile/';
const DELETE_URL = AppSettings.BASE_URL + '/eegPortalApp/submitDeleteUploadedFile/';

@Component({
  selector: 'simple-demo',
  templateUrl: './simple-demo.html'
})
export class SimpleDemoComponent {

  uploader:FileUploader;
  hasBaseDropZoneOver:boolean;
  hasAnotherDropZoneOver:boolean;
  response:string;
  uploadFolder:UploadFolder;
  datafileName:string;
  message:string;

  constructor ( private datafileDetailService: DatafileDetailService){
    this.uploader = new FileUploader({
      url: URL,
      authTokenHeader: "Authorization",
      authToken: "Bearer " +  localStorage.getItem("token"),
      disableMultipart: false, // 'DisableMultipart' must be 'true' for formatDataFunction to be called.
    });

    this.uploader.onBeforeUploadItem = (item) => {
      item.withCredentials = false;
    }

    this.uploader.onAfterAddingFile = ((item) => {
        item.withCredentials = false;
    })

    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;

    this.response = '';

    this.uploader.response.subscribe( res => {
      this.uploadFolder = JSON.parse(res);
      // default name to cheksum if not provided
      if (!this.datafileName || this.datafileName == ''){
        this.datafileName = this.uploadFolder.chksum;
      }
      this.datafileDetailService.updateDatafileName(this.datafileName, this.uploadFolder.id).then(message => {
          this.message = message;
      });
    });
  }

  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e:any):void {
    this.hasAnotherDropZoneOver = e;
  }
}
