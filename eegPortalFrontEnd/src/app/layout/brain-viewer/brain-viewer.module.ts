import { NgModule } from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { BrainViewerRoutingModule } from './brain-viewer-routing.module';
import { BrainViewerComponent } from './brain-viewer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { NgProgressModule } from 'ngx-progressbar';
// import { ChartsModule } from 'ng2-charts/ng2-charts';
import { ChartsModule } from 'ng2-charts';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxSortableModule } from 'ngx-sortable';
import {AccordionModule} from "ngx-accordion";
import { FilterPipe} from '../../pipes/filter.pipe';
import { ColorPickerModule } from 'ngx-color-picker';
import { UiTaskComponent } from '../components/ui-task/ui-task.component';
@NgModule({
    imports: [CommonModule,
              BrainViewerRoutingModule,
              FormsModule,
              // NgProgressModule,
              ChartsModule,
              NgMultiSelectDropDownModule,
              NgxSortableModule,
              AccordionModule,
              ColorPickerModule,
              NgbModule,
              // NgbModule.forRoot(),
              ReactiveFormsModule],
    declarations: [BrainViewerComponent, FilterPipe, UiTaskComponent ],
})
export class BrainViewerModule {}
