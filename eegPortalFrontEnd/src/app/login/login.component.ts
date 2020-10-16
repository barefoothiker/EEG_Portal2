import { Component, OnInit, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {Routes, Router } from '@angular/router';
// import { routerTransition } from '../router.animations';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { LoginService } from '../services/login-service';
import { LogoutComponent } from '../logout/logout.component';
import {User} from '../models/user';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
    selector: 'app-login',
    // template: `<router-outlet></router-outlet>`,
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    // animations: [routerTransition()]
})
@Injectable()
export class LoginComponent implements OnInit {
    @Input()
    loggedInUser: string;
    @Input()
    loggedInPass: string;
    user: User;

    public now: Date = new Date();
    format:string="'h:mm:ss'"
    token:string = "";
    token_expires: Date;
    username: string;
    errors: any = [];
    message:string;

    // public currentUserSubject: BehaviorSubject<User>;
    // public currentUser: Observable<User>;

    constructor(
            private loginService: LoginService,
            private logoutComponent: LogoutComponent,
            private route: ActivatedRoute,
            private router: Router,
            private location: Location
    ) {
     }

    ngOnInit() {
      this.message = "";
    }

    private updateTokenData() {
      this.errors = [];
      // decode the token to read the username and expiration timestamp
      const token_parts = this.token.split(/\./);
      const token_decoded = JSON.parse(window.atob(token_parts[1]));
      this.token_expires = new Date(token_decoded.exp * 1000);
      this.username = token_decoded.username;
    }

   // sendResetPasswordEmail(){
   //   this.message = "";
   //   this.loginService.sendResetPasswordEmail()
   //    .then((message) =>
   //      {
   //        // this.message = message;
   //        if (message == "Invalid" ){
   //          this.message = "Login Invalid.";
   //          return;
   //        }
   //      }
   //    );
   // }
   onLoggedin() {
     this.message = "";
      this.loginService.checkLogin(this.loggedInUser,this.loggedInPass)
      .then((message) =>
        {
          // this.message = message;
          if (message == "Invalid" ){
            this.message = "Login Invalid.";
            return;
          }
        }
      );

     this.loginService.loginUser(this.loggedInUser,this.loggedInPass).then((data) => {this.token = data["token"];
        console.log(" log in " + data["token"]);
        if(this.token != ""){
           setTimeout (() => this.updateTokenData());
           setTimeout (() => this.logoutComponent.loggedInUser = this.username);
           setTimeout (() => localStorage.setItem('isLoggedin', 'true'));
           setTimeout (() => localStorage.setItem('loggedInTime',  new Date().toLocaleString()));
           setTimeout (() => localStorage.setItem('loggedInUser', this.username));
           setTimeout (() => localStorage.setItem('token', this.token));
           setTimeout (() => localStorage.setItem('tokenExpires', this.token_expires.toLocaleString()));
           console.log(" before navigate 1");
           this.router.navigate(['/'], { queryParams: { }});
           setTimeout (() => this.router.navigate(['/'], { queryParams: { }}));
           console.log(" before navigate 2 " + this.loggedInUser);
           // setTimeout (() => this.router.navigate(['/dashboard'], { queryParams: { }}));
           // console.log(" before navigate 3");
           // setTimeout (() => this.router.navigate(['dashboard'], { queryParams: { }}));

           this.loginService.emitUserName(this.loggedInUser);
       }
       else {
         this.message = "Unable to login."
       }

     })
     .catch((err) => {
        console.log(" Error in promise ");
        this.message = "Login Invalid.";

        this.router.navigate(['/login']);
     });

   } // end on logged in

   refreshToken()
    {
     this.loginService.refreshToken().then((token) => {this.token = token;
       if(this.token != ""){
          setTimeout (() => this.updateTokenData());
          setTimeout (() => localStorage.setItem('isLoggedin', 'true'));
          setTimeout (() => localStorage.setItem('loggedInUser', this.username));
          setTimeout (() => localStorage.setItem('token', this.token));
          setTimeout (() => localStorage.setItem('tokenExpires', this.token_expires.toLocaleString()));
          this.router.navigate(['/'], { queryParams: { }});
      }
     });
   }

   // if enter is pressed, then login
   submitEnter(event){

    console.log("on enter");

     if(event.key == "Enter") {
       this.onLoggedin();
     }

   }

}
