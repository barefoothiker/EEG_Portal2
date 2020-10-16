import { Component, OnInit } from '@angular/core';
import {Routes, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { ResetPasswordService } from '../services/reset-password-service';
import { User} from '../models/user';
@Component({
    selector: 'app-resetPassword',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
    // animations: [routerTransition()]
})
export class ResetPasswordComponent implements OnInit {

    username:string;
    newPassword:string;
    repeatNewPassword:string;
    password:string;
    disableResetPassword:boolean;
    message:string;

    constructor(
      private resetPasswordService: ResetPasswordService,
      private route: ActivatedRoute,
      private router: Router,
    ) {

    }

    ngOnInit() {

        this.route.paramMap.subscribe(params => {
          this.username = (params.get("username")).toString();
        });

        this.newPassword = "";
        this.repeatNewPassword = "";

        this.disableResetPassword = true;
        this.message = "";

    }

    checkRepeatPassword(){
      if (this.newPassword != this.repeatNewPassword){
        this.message = "Passwords must match.";
        console.log(this.newPassword + " : " + this.repeatNewPassword);
        this.disableResetPassword = true;
      }
      else{
        this.message = "";
        this.disableResetPassword = false;
      }
    }

    resetPassword(){
      this.resetPasswordService.resetPassword(this.username, this.newPassword)
      .then((message) =>
        {
          // this.message = message;
          if (message == "Error" ){
            this.message = "There was an error. Please contact the helpdesk."
            this.disableResetPassword = true;
          }
          else if (message == "Success" ){
            this.message = "Your password has been reset. You can login using you new password."
            this.disableResetPassword = false;
          }
        }
      );
    }
}
