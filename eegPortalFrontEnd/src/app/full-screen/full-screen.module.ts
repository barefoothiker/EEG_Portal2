import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FullScreenRoutingModule } from './full-screen-routing.module';
import { FullScreenComponent } from './full-screen.component';
import { FullScreenService } from '../services/full-screen.service';
import { BrainViewerService } from '../layout/brain-viewer/brain-viewer-service';
import { HelpModalService } from '../services/help-modal.service';
import { ParamsModalComponent } from '../params-modal/params-modal.component';
import { BrainViewerModule } from '../layout/brain-viewer/brain-viewer.module';
import { CommentModalService } from '../services/comment-modal.service';
import { ParamsModalService } from '../services/params-modal.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@NgModule({
  imports: [
    CommonModule,
    FullScreenRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrainViewerModule,
    NgMultiSelectDropDownModule
  ],
  declarations: [],
  providers:[FullScreenService, BrainViewerService, HelpModalService, CommentModalService, ParamsModalService],
  entryComponents: [
       ParamsModalComponent,
   ],
})
export class FullScreenModule { }
