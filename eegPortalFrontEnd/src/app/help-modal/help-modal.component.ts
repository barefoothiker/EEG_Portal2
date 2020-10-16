import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngbd-modal-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Help Information</h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      {{name}}
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-dark" (click)="activeModal.close('Close click')">Close</button>
    </div>
  `
})
export class HelpModalComponent {
  // <p>Hello, {{name}}!</p>
  @Input() name;

  constructor(public activeModal: NgbActiveModal) {}
}

// @Component({
//   selector: 'ngbd-modal-component',
//   templateUrl: './help-modal.component.html'
// })
// export class HelpModalComponent {
//
// }
