import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbCarouselModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FormsModule } from '@angular/forms';

import { FileUploadModule } from 'ng2-file-upload';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { ListFilesComponent } from './components/listfiles/listfiles-component';

import { FileUploadSectionComponent } from './components/file-upload/file-upload-section';
import { SimpleDemoComponent } from './components/file-upload/simple-demo';

import {
    TimelineComponent,
    NotificationComponent,
    ChatComponent,
//    IterationDetailsComponent,

} from './components';
import { StatModule } from '../../shared';


@NgModule({
    imports: [
        CommonModule,
        NgbCarouselModule,
        NgbAlertModule,
        // NgbCarouselModule.forRoot(),
        // NgbAlertModule.forRoot(),
        DashboardRoutingModule,
        FileUploadModule,
        FormsModule,
        TabsModule.forRoot(),
        StatModule,
//        IterationDetailsComponent
    ],
    declarations: [
        DashboardComponent,
        TimelineComponent,
        NotificationComponent,
        ChatComponent,
        FileUploadSectionComponent,
        SimpleDemoComponent,
        ListFilesComponent,
    ]
})

export class DashboardModule {}
