import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import {AppSettings} from '../app.settings';
import {User} from '../models/user';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { SigninEmitterService} from './signin-emitter.service';

@Injectable()

export class ResetPasswordService {

    BASE_URL=AppSettings.LOGIN_URL;
    private headers = new Headers({ 'Content-Type': 'application/json' });
    private resetPasswordUrl = this.BASE_URL+'/eegPortalApp/resetPassword/';
    private emailPasswordLinkUrl = this.BASE_URL+'/eegPortalApp/emailPasswordLink/';

    public errors: any = [];
    public user: User;

    constructor (
      private http: HttpClient,
      private router: Router,
    ) {
    }

   public resetPassword(username:string, password:string):Promise<string> {
     return this.http.post(this.resetPasswordUrl, {"username":username, "password":password}).toPromise().then(res => res["message"])
       .catch(this.handleError);
    }

   public emailPasswordLink(email:string):Promise<string> {
    return this.http.post(this.emailPasswordLinkUrl, {"email":email}).toPromise().then(res => res["message"])
      .catch(this.handleError);
   }

   private handleError(error: any): Promise<any> {
       console.error('An error occurred', error); // for demo purposes only
       return Promise.reject(error.message || error);
     }

}
