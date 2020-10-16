import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupportRoutingModule } from './support-routing.module';
import { SupportComponent } from './support.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    // imports: [CommonModule, SupportRoutingModule,FormsModule, BrowserAnimationsModule],
    imports: [CommonModule,
              SupportRoutingModule,
              FormsModule,
              ReactiveFormsModule,
              NgbModule
              // NgbModule.forRoot()
             ],

    declarations: [SupportComponent]
})
export class SupportModule {}
