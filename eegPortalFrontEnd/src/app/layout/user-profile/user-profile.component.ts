import { Component, OnInit, Input, ElementRef} from '@angular/core';
import { UserProfileService } from './user-profile-service';
import { Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'list-files',
    providers: [UserProfileService],
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss']
})

export class UserProfileComponent implements OnInit{
    @Input()
    message:string;
    activeTabTitle:string;
    statusColor:string;
    username:string;
    user:User;

    ngOnInit() {
      this.route.paramMap.subscribe(params => {
        this.username = (params.get("username")).toString();
      })
      this.userProfileService.getUserProfile(this.username).then(user => {
          this.user = user;
      });
    }

    updateUser(){
      this.userProfileService.updateUser(this.user).then(userUpdateObj => {
          this.user = userUpdateObj.user;
          this.message = userUpdateObj.message;
      });
    }

    constructor( private userProfileService: UserProfileService,
                 private route: ActivatedRoute,
               ) {
    };
}
