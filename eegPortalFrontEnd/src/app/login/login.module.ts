import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
// import { BrowserModule } from '@angular/platform-browser';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { LogoutComponent } from '../logout/logout.component';

import { FormsModule } from '@angular/forms';


@NgModule({
    imports: [CommonModule, LoginRoutingModule,FormsModule,ReactiveFormsModule],
    declarations: [LoginComponent],
    providers: [LogoutComponent],

})
export class LoginModule {}
