import { Component, OnInit, Input, ElementRef} from '@angular/core';
import { SupportService } from './support-service';
import { Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Datafile, UploadFolder, UploadFolderSubmitObj } from '../../models/datafile';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'list-files',
    providers: [SupportService],
    templateUrl: './support.component.html',
    styleUrls: ['./support.component.scss']
})

export class SupportComponent implements OnInit{
  datafile:UploadFolder;
    ngOnInit() {
    }

    constructor( private supportService: SupportService,
                 private route: ActivatedRoute,
               ) {
    };
}
