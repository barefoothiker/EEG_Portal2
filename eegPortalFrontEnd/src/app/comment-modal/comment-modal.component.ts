import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommentModalSubmitService } from '../services/comment-modal-submit.service';
import { Comment } from '../models/comment';

@Component({
  selector: 'ngbd-modal-content',
  providers: [CommentModalSubmitService],
  templateUrl: './comment-modal.component.html',
  styleUrls: ['./comment-modal.component.scss'],
})
// />

export class CommentModalComponent implements OnInit {

  @Input() name;
  @Input() imageClass;
  @Input() uploadFolder;
  @Input() xPosition;
  @Input() yPosition;
  @Input() zPosition;
  @Input() uploadFolderId;
  @Input() commentsList;

  disableSubmit:boolean;
  commentForm: FormGroup;
  allowAddComment:boolean;
  // commentsList: Comment[];
  message: string;

  @Output() saveEvent = new EventEmitter<string>();

  ngOnInit() {
    this.disableSubmit = true;
  }

  constructor(
   public activeModal: NgbActiveModal,
   private commentModalSubmitService:CommentModalSubmitService,
   private formBuilder: FormBuilder
  ) {
    this.createForm();
    this.allowAddComment = false;
  }

  checkInput(){
    if (this.commentForm.value != ''){
      this.disableSubmit = false;
    }
  }

  createForm() {
    this.commentForm = this.formBuilder.group({
      commentText: ''
    });
  }

  submitForm() {

    console.log(this.commentForm.value);
    console.log(" uploadfolder " + this.uploadFolder.id);
    console.log(" imageClass  " + this.imageClass);

    this.commentModalSubmitService.saveComment(this.commentForm.value.commentText,this.uploadFolder.id,this.imageClass, this.xPosition, this.yPosition, this.zPosition).then((message) => {
        this.message = message;
        this.activeModal.close('Close click');
        this.saveEvent.emit("Saved");
    });

  }

}
