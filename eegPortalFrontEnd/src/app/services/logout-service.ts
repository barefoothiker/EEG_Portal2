import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { Observable } from 'rxjs/Observable';
import {AppSettings} from '../app.settings';
import {User} from '../models/user';


import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { SignoutEmitterService} from './signout-emitter.service';

@Injectable()
export class LogoutService {

    BASE_URL=AppSettings.BASE_URL;
    private headers = new Headers({ 'Content-Type': 'application/json' });
    private logoutUserUrl = this.BASE_URL+'/eegPortalApp/logoutUser/';

    public user: User;
    private loginTime: any;
    private loggedIn: boolean = false;

    // Observable string sources
    // private emitChangeSource = new Subject<User>();

    loginMessage:string="";

    constructor (
      private http: HttpClient,
      private router: Router,
      private signoutEmitterService : SignoutEmitterService,
    ) {
    }

   public logoutUser(logoutUser:string): Promise<User> {
     return this.http.post(this.logoutUserUrl, {'logoutUser': logoutUser}).toPromise().then(res => res)
       .catch(this.handleError);
    }

   public isLoggedIn() {
     console.log(this.loggedIn);
     return this.loggedIn;
   }

   public setUser (a_user){
     this.user = a_user;
   }

   private handleError(error: any): Promise<any> {
     console.error('An error occurred', error); // for demo purposes only
     return Promise.reject(error.message || error);
   }

   public logout() {
     this.loggedIn = false;

     localStorage.setItem("user", "");
     localStorage.setItem("loginTime", "");
     this.signoutEmitterService.emitChange({user: "", isSuperUser: false});
     this.router.navigate(['']);
   }

}
