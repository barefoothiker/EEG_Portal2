import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsModule } from 'ng2-charts';

import { DatafileDetailRoutingModule } from './datafile-detail-routing.module';
import { DatafileDetailComponent } from './datafile-detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { Ng5SliderModule } from 'ng5-slider';

import {NgxChartsModule} from '@swimlane/ngx-charts';

@NgModule({
    // imports: [CommonModule, DatafileDetailRoutingModule,FormsModule, BrowserAnimationsModule],
    imports: [CommonModule,
              ChartsModule,
              DatafileDetailRoutingModule,
              FormsModule,
              ReactiveFormsModule,
              NgbModule,
              Ng5SliderModule,
              NgxChartsModule
              // NgbModule.forRoot()
             ],

    declarations: [DatafileDetailComponent]
})
export class DatafileDetailModule {}
