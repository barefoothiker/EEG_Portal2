import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResetPasswordRoutingModule } from './reset-password-routing.module';
import { ResetPasswordComponent } from './reset-password.component';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';

@NgModule({
  imports: [
    CommonModule,
    ResetPasswordRoutingModule,
    PasswordStrengthMeterModule,
    FormsModule,
  ],
  declarations: [ResetPasswordComponent]
})
export class ResetPasswordModule { }
