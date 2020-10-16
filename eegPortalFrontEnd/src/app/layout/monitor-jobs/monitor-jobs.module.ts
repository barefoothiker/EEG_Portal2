import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitorJobsRoutingModule } from './monitor-jobs-routing.module';
import { MonitorJobsComponent } from './monitor-jobs.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
// import { ListFilesFilterPipe} from '../../pipes/list-files-filter.pipe';
import { ListDatafilesModule } from '../list-datafiles/list-datafiles.module';

@NgModule({
    // imports: [CommonModule, MonitorJobsRoutingModule,FormsModule, BrowserAnimationsModule],
    imports: [CommonModule,
              MonitorJobsRoutingModule,
              FormsModule,
              ReactiveFormsModule,
              ListDatafilesModule,
              NgbModule
              // NgbModule.forRoot()
            ],

    declarations: [MonitorJobsComponent]
})
export class MonitorJobsModule {}
