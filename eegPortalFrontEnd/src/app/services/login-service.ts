import { Injectable, Output, EventEmitter} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { Observable } from 'rxjs/Observable';
import {AppSettings} from '../app.settings';
import {User} from '../models/user';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { SigninEmitterService} from './signin-emitter.service';

@Injectable()
export class LoginService {

    BASE_URL=AppSettings.LOGIN_URL;
    private headers = new Headers({ 'Content-Type': 'application/json' });
    private checkLoginUrl = this.BASE_URL+'/eegPortalApp/checkLogin/';

    private apiTokenUrl = this.BASE_URL+'/eegPortalApp/api-token-auth/';
    private refreshTokenUrl = this.BASE_URL+'/eegPortalApp/api-token-refresh/';
    public token: string;
    public errors: any = [];
    public user: User;

    private loginTime: any;
    private loggedIn: boolean = false;
    private httpOptions: any;
    @Output() loginEvent = new EventEmitter<string>();

    loginMessage:string="";

    constructor (
      private http: HttpClient,
      private router: Router,
      private signinEmitterService : SigninEmitterService,
    ) {
    }

   public checkLogin(a_loggedInUser:string,a_loggedInPass:string):Promise<string> {
    return this.http.post(this.checkLoginUrl, {"username":a_loggedInUser, "password":a_loggedInPass}).toPromise().then(res => res)
      .catch(this.handleError);
   }

   public emitUserName(username:string) {
     this.loginEvent.emit(username);
   }

   public loginUser(a_loggedInUser:string,a_loggedInPass:string):Promise<string> {
     console.log( " sending request username "+ a_loggedInUser + "password " + a_loggedInPass  ) ;
     
     return this.http.post(this.apiTokenUrl, {"username":a_loggedInUser, "password":a_loggedInPass}).toPromise()
       .then(res => res)
       .catch(this.handleError);
    }

   // Refreshes the JWT token, to extend the time the user is logged in
   public refreshToken():Promise<string> {
     return this.http.post(this.refreshTokenUrl, {"token": this.token}).toPromise()
        .then(res => res)
        .catch(this.handleError);
    }

   private handleError(error: any): Promise<any> {
       console.error('An error occurred', error); // for demo purposes only
       return Promise.reject(error.message || error);
     }

   public isLoggedIn() {
     console.log(this.loggedIn);
     return this.loggedIn;
   }

   public timeOutUser() {
     let timeOutLimit = 1000 * 1800; // time out in 30 min after login

     setTimeout( () => {
       if (localStorage.getItem("loginTime") ){
         this.loginTime = localStorage.getItem("loginTime");
         let now = new Date().getTime();

         if ( ( now - this.loginTime) > timeOutLimit ){ //1800 sec = 30 min

           this.continueTimeOutUser();
           this.confirmTimeOutUser();
         }

       }
     },  timeOutLimit);

   }

   public continueTimeOutUser() {
     setTimeout( () => {
       let continueEvt = document.getElementsByClassName('continueClick')[0];
       continueEvt.addEventListener('click', (evt) => {
         localStorage.setItem("loginTime", new Date().getTime().toString());
         this.timeOutUser();
       });

     }, 0);
   }

   public confirmTimeOutUser() {
     let timeOutLimitFinal = 1000 * 30; // time out in 30 seconds after warning
     setTimeout( () => {
       if (localStorage.getItem("loginTime") ){
         this.loginTime = localStorage.getItem("loginTime");
         let now = new Date().getTime();

         if ( ( now - this.loginTime) > timeOutLimitFinal ){ //1800 sec = 30 min
           // this.logout();
         }

       }
     },  timeOutLimitFinal);
   }

   public setUser (a_user){
     this.user = a_user;
   }

   public emitChange(change: any) {
       // this.emitChangeSource.next(change);
   }

}
