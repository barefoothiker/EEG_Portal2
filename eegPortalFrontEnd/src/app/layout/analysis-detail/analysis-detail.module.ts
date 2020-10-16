import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsModule } from 'ng2-charts';
import { AnalysisDetailRoutingModule } from './analysis-detail-routing.module';
import { AnalysisDetailComponent } from './analysis-detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { Ng5SliderModule } from 'ng5-slider';

import { NgxHeatmapModule } from 'ngx-heatmap';


import {NgxChartsModule} from '@swimlane/ngx-charts';

@NgModule({
    // imports: [CommonModule, AnalysisDetailRoutingModule,FormsModule, BrowserAnimationsModule],
    imports: [CommonModule,
              AnalysisDetailRoutingModule,
              FormsModule,
              ReactiveFormsModule,
              NgbModule,
              ChartsModule,
              Ng5SliderModule,
              NgxHeatmapModule,
              NgxChartsModule
             ],
             providers: [
             ],
    // declarations: [AnalysisDetailComponent,  BrowserModule, BrowserAnimationsModule, NgxChartsModule]
    declarations: [AnalysisDetailComponent]

})
export class AnalysisDetailModule {}
