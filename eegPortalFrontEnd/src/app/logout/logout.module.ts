import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LogoutRoutingModule } from './logout-routing.module';
import { LogoutComponent } from './logout.component';
import { LoginComponent } from '../login/login.component';

import { FormsModule } from '@angular/forms';


@NgModule({
    imports: [CommonModule, LogoutRoutingModule,FormsModule],
    declarations: [LogoutComponent],
    providers: [LoginComponent],

})
export class LogoutModule {}
