import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailResetPasswordLinkRoutingModule } from './email-resetpasswordlink-routing.module';
import { EmailResetPasswordLinkComponent } from './email-resetpasswordlink.component';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';

@NgModule({
  imports: [
    CommonModule,
    EmailResetPasswordLinkRoutingModule,
    PasswordStrengthMeterModule,
    FormsModule,
  ],
  declarations: [EmailResetPasswordLinkComponent]
})
export class EmailResetPasswordLinkModule { }
