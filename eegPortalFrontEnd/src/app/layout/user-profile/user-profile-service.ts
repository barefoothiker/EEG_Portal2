import { Observable } from "rxjs/Rx"
import { Injectable, OnInit }     from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { User, UserUpdateObj } from '../../models/user';
import 'rxjs/add/operator/toPromise';
import {AppSettings} from '../../app.settings';

@Injectable()
export class UserProfileService {

    public getUserProfileUrl = AppSettings.BASE_URL + "/eegPortalApp/getUserProfile/";
    public updateUserUrl = AppSettings.BASE_URL + "/eegPortalApp/updateUser/";

    constructor (private http: HttpClient) {}

    getUserProfile(username:any): Promise<User> {
     return this.http.post(this.getUserProfileUrl, {"username":username}).toPromise().then(res => res)
       .catch(this.handleError);
    }

    updateUser(user:User): Promise<UserUpdateObj> {
     return this.http.post(this.updateUserUrl, {"username":user.username, "addressLine1":user.addressLine1, "addressLine2":user.addressLine2, "city":user.city, "state":user.state, "zipCode":user.zipCode, "phoneNumber":user.phoneNumber,
      "email":user.email}).toPromise().then(res => res)
       .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
      console.error('An error occurred', error); // for demo purposes only
      return Promise.reject(error.message || error);
    }

}
