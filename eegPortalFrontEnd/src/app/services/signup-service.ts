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
export class SignupService {

    BASE_URL=AppSettings.LOGIN_URL;
    private headers = new Headers({ 'Content-Type': 'application/json' });
    private signupUserUrl = this.BASE_URL+'/eegPortalApp/signupUser/';
    private checkUserUrl = this.BASE_URL+'/eegPortalApp/checkUser/';
    private checkEmailUrl = this.BASE_URL+'/eegPortalApp/checkEmail/';

    private apiTokenUrl = this.BASE_URL+'/eegPortalApp/api-token-auth/';
    private refreshTokenUrl = this.BASE_URL+'/eegPortalApp/api-token-refresh/';
    public token: string;
    public errors: any = [];
    public user: User;

    private loginTime: any;
    private loggedIn: boolean = false;
    private httpOptions: any;

    // Observable string sources
    private emitChangeSource = new Subject<User>();
    loginMessage:string="";

    constructor (
      private http: HttpClient,
      private router: Router,
      private signinEmitterService : SigninEmitterService,
    ) {
    }

   public signupUser(username:string, email:string, password:string, addressLine1:string, addressLine2:string, city:string, state:string, zipCode:string, phoneNumber:string):Promise<string> {
     return this.http.post(this.signupUserUrl, {"username":username, "email":email, "password":password, "addressLine1":addressLine1,
     "addressLine2":addressLine2, "city":city, "state":state, "zipCode":zipCode, "phoneNumber":phoneNumber}).toPromise().then(res => res["message"])
       .catch(this.handleError);
    }

   public checkEmail(email:string):Promise<string> {
     return this.http.post(this.checkEmailUrl, {"email":email}).toPromise().then(res => res["message"])
       .catch(this.handleError);
    }

   public checkUser(username:string):Promise<string> {
     return this.http.post(this.checkUserUrl, {"username":username}).toPromise().then(res => res["message"])
       .catch(this.handleError);
    }

   private handleError(error: any): Promise<any> {
       console.error('An error occurred', error); // for demo purposes only
       return Promise.reject(error.message || error);
     }

}
