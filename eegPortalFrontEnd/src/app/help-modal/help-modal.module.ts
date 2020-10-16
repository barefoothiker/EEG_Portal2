import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HelpModalRoutingModule } from './help-modal-routing.module';
import { HelpModalComponent } from './help-modal.component';

@NgModule({
  imports: [
    CommonModule,
    HelpModalRoutingModule,
    FormsModule,
  ],
  declarations: []
})
export class HelpModalModule { }
