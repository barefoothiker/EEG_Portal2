import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Rotate3DRoutingModule } from './rotate-3d-routing.module';
import { Rotate3DComponent } from './rotate-3d.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgProgressModule } from 'ngx-progressbar';
import { ChartsModule } from 'ng2-charts';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxSortableModule } from 'ngx-sortable';
import {AccordionModule} from "ngx-accordion";
// import { FilterPipe} from '../../pipes/filter.pipe';

@NgModule({
    imports: [CommonModule,
              Rotate3DRoutingModule,
              FormsModule,
              NgProgressModule,
              ChartsModule,
              NgMultiSelectDropDownModule,
              NgxSortableModule,
              AccordionModule,
              ReactiveFormsModule],
    // declarations: [Rotate3DComponent, FilterPipe ],
    declarations: [Rotate3DComponent],
})
export class Rotate3DModule {}
