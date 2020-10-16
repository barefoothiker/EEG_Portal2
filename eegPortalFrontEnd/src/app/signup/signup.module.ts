import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SignupRoutingModule } from './signup-routing.module';
import { SignupComponent } from './signup.component';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';

@NgModule({
  imports: [
    CommonModule,
    SignupRoutingModule,
    PasswordStrengthMeterModule,
    FormsModule,
  ],
  declarations: [SignupComponent]
})
export class SignupModule { }
