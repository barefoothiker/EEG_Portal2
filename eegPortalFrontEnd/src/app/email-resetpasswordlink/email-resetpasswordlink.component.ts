import { Component, OnInit } from '@angular/core';
import {Routes, Router } from '@angular/router';
// import { routerTransition } from '../router.animations';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { ResetPasswordService } from '../services/reset-password-service';
import { SignupService } from '../services/signup-service';
import { User} from '../models/user';
@Component({
    selector: 'app-emailResetPasswordLink',
    templateUrl: './email-resetpasswordlink.component.html',
    styleUrls: ['./email-resetpasswordlink.component.scss'],
    // animations: [routerTransition()]
})
export class EmailResetPasswordLinkComponent implements OnInit {

    email:string;
    disableEmailResetPasswordLink:boolean;
    message:string;

    constructor(
      private resetPasswordService: ResetPasswordService,
      private signupService: SignupService,
      private route: ActivatedRoute,
      private router: Router,
    ) {

    }

    ngOnInit() {

        this.email = "";

        this.disableEmailResetPasswordLink = true;
        this.message = "";

    }

    checkEmail(){
      let isValid = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/.test(this.email);
      if (!isValid) {
        this.message = "Please enter valid email.";
        this.disableEmailResetPasswordLink = true;
      }
      else {
        this.message = "";
        this.disableEmailResetPasswordLink = false;
        this.signupService.checkEmail(this.email)
        .then((message) =>
          {
            // this.message = message;
            if (message == "Invalid" ){
              this.message = "Email does not exist, please enter a valid email."
              this.disableEmailResetPasswordLink = true;
            }
          }
        );
      }
    }

    emailResetPasswordLink(){
      this.message = "";
      this.disableEmailResetPasswordLink = true;
      this.resetPasswordService.emailPasswordLink(this.email)
      .then((message) =>
        {
          // this.message = message;
          if (message == "Error" ){
            this.message = "There was an error. Please contact the helpdesk."
            this.disableEmailResetPasswordLink = false;
          }
          else if (message == "Success" ){
            this.message = "Email sent. Please check your email for reset password link."
            this.disableEmailResetPasswordLink = false;
          }
        }
      );
    }
}
