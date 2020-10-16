import { Injectable } from '@angular/core';
import {AppSettings} from '../app.settings';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Comment } from '../models/comment';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class CommentModalSubmitService {
  BASE_URL=AppSettings.BASE_URL;
  public saveCommentUrl = AppSettings.BASE_URL + "/eegPortalApp/saveComment/";
  public fetchCommentsByLocationUrl = AppSettings.BASE_URL + "/eegPortalApp/fetchCommentsByLocation/";
  public fetchAllCommentsUrl = AppSettings.BASE_URL + "/eegPortalApp/fetchAllComments/";

  constructor (private http: HttpClient) {}

  fetchAllComments(uploadFolderId:string): Promise<Comment[]> {
   return this.http.post(this.fetchAllCommentsUrl, { "uploadFolderId":uploadFolderId}).toPromise().then(res => res)
     .catch(this.handleError);
  }

  fetchCommentsByLocation(uploadFolderId:string, imageClass:string, selectedView:string, xPosition:string, yPosition:number, zPosition:string): Promise<Comment[]> {
   return this.http.post(this.fetchCommentsByLocationUrl, { "uploadFolderId":uploadFolderId, "imageClass":imageClass, "xPosition":xPosition, "yPosition":yPosition,
   "zPosition":zPosition}).toPromise().then(res => res)
     .catch(this.handleError);
  }

  saveComment(commentText:string, uploadFolderId:string, imageClass:string, xPosition:string,yPosition:string,zPosition:string): Promise<string> {
   return this.http.post(this.saveCommentUrl, {"commentText":commentText, "uploadFolderId":uploadFolderId, "imageClass":imageClass, "xPosition":xPosition,"yPosition":yPosition, "zPosition":zPosition}).toPromise().then(res => res)
     .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
