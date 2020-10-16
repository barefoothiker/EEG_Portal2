import { Component,Input, OnInit } from '@angular/core';
import {Routes, Router } from '@angular/router';
// import { routerTransition } from '../router.animations';
import { Injectable } from '@angular/core';


import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

import { LogoutService } from '../services/logout-service';

import {User} from '../models/user';

@Component({
    selector: 'app-logout',
    // template: `<router-outlet></router-outlet>`,
    templateUrl: './logout.component.html',
    styleUrls: ['./logout.component.scss'],
    // animations: [routerTransition()]
})
@Injectable()
export class LogoutComponent implements OnInit {
    @Input()
    loggedInUser: string;
    @Input()
    loggedInPass: string;
    user: User;

    public now: Date = new Date();
    format:string="'h:mm:ss'"

    constructor(
            private logoutService: LogoutService,
            private route: ActivatedRoute,
            private router: Router,
            private location: Location
    ) { }


    ngOnInit() {}

    onLoggedin() {

        this.logoutService.logoutUser(this.loggedInUser).then (
                (result) => {
                    if (result) {
                        localStorage.setItem('user', '');
                        localStorage.setItem('loggedInTime', '');
                        localStorage.setItem('isLoggedIn', 'false');
                    }
                  }
                  );

        this.router.navigate(['signin'], { queryParams: { }});

    }



//    public signInUser(loginId, passcode) {
//        this.signinService.signInUser(loginId, passcode)
//                        .subscribe (
//                          (result) => {
//                            if (result) {
//                              this.registeredUser = result;
//                              this.emit();
//                            }
//                          }
//                          );
//      }

}
