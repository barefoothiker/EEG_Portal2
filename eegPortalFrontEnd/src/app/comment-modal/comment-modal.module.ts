import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommentModalRoutingModule } from './comment-modal-routing.module';
import { CommentModalComponent } from './comment-modal.component';
import { CommentModalService } from '../services/comment-modal.service';

@NgModule({
  imports: [
    CommonModule,
    CommentModalRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [],
  providers:[CommentModalService],
  // entryComponents: [
  //      CommentModalComponent,
  //  ],
})
export class CommentModalModule { }
