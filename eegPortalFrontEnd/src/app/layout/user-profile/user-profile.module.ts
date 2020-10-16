import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserProfileRoutingModule } from './user-profile-routing.module';
import { UserProfileComponent } from './user-profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    // imports: [CommonModule, UserProfileRoutingModule,FormsModule, BrowserAnimationsModule],
    imports: [CommonModule,
              UserProfileRoutingModule,
              FormsModule,
              ReactiveFormsModule,
              NgbModule
              // NgbModule.forRoot()
             ],

    declarations: [UserProfileComponent]
})
export class UserProfileModule {}
