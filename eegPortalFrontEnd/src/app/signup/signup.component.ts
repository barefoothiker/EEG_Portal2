import { Component, OnInit } from '@angular/core';
import {Routes, Router } from '@angular/router';
// import { routerTransition } from '../router.animations';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { SignupService } from '../services/signup-service';
import { User} from '../models/user';
@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
    // animations: [routerTransition()]
})
export class SignupComponent implements OnInit {

    username:string;
    email:string;
    password:string;
    repeatPassword:string;

    addressLine1:string;
    addressLine2:string;
    city:string;
    state:string;
    zipCode:string;
    phoneNumber:string;

    disableRegister:boolean;
    message:string;

    constructor(
      private signupService: SignupService,
      private route: ActivatedRoute,
      private router: Router,
    ) {

    }

    ngOnInit() {
        this.username = "";
        this.email = "";
        this.password = "";
        this.repeatPassword = "";

        this.addressLine1 = "";
        this.addressLine2 = "";
        this.city = "";
        this.state = "";
        this.zipCode = "";
        this.phoneNumber = "";

        this.disableRegister = true;
        this.message = "";

    }

    checkPassword(){
      if (this.password != this.repeatPassword){
        this.message = "Passwords must match.";
        console.log(this.password + " : " + this.repeatPassword);
        this.disableRegister = true;
      }
      else{
        this.message = "";
        this.disableRegister = false;
      }
    }

    checkEmail(){
      let isValid = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/.test(this.email);
      if (!isValid) {
        this.message = "Please enter valid email.";
        this.disableRegister = true;
      }
      else {
        this.message = "";
        this.disableRegister = false;
        this.signupService.checkEmail(this.email)
        .then((message) =>
          {
            // this.message = message;
            if (message == "Exists" ){
              this.message = "Email already exists, please try another email."
              this.disableRegister = true;
            }
          }
        );
      }
    }

    checkUser(){
      this.disableRegister = false;
      this.message = "";
      this.signupService.checkUser(this.username)
      .then((message) =>
        {
          // this.message = message;
          if (message == "Exists" ){
            this.message = "User already exists, please try another username."
            this.disableRegister = true;
          }
        }
      );
    }

    registerUser(){
      this.disableRegister = false;
      this.message = "";
      this.checkUser();
      this.checkEmail();
      this.checkPassword();
      if (this.disableRegister){
        this.message = "Please enter valid username, email, password."
        return;
      }

      this.signupService.signupUser(this.username,this.email, this.password, this.addressLine1, this.addressLine2, this.city, this.state, this.zipCode, this.phoneNumber )
      .then((message) =>
        {
          console.log(message);
          this.message = message;
          if (this.message == "Success"){
            this.message = "Registration successful."
            this.disableRegister = true;
          } else {
            this.message = "Please enter valid username, email, password."
            this.disableRegister = false;
          }
        }
      );
    }
}
