import { Component, OnInit, OnDestroy, Input, ElementRef} from '@angular/core';
import { ListDatafilesService } from './list-datafiles-service';
import { Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Datafile, UploadFolder } from '../../models/datafile';
import 'rxjs/add/observable/interval';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'list-files',
    providers: [ListDatafilesService],
    templateUrl: './list-datafiles.component.html',
    styleUrls: ['./list-datafiles.component.scss']
})

export class ListDatafilesComponent implements OnInit, OnDestroy{

    @Input()
    datafiles : UploadFolder[];
    allDatafiles : UploadFolder[];
    filterFilesOption:string;
    resultsAvailable:boolean;
    sub:Subscription;
    message:string;

    filterOptions = [
      { 'id': 0, 'name': 'Uploaded', 'selected':false },
      { 'id': 1, 'name': 'Score Calculated', 'selected':false },
      { 'id': 2, 'name': 'Analysis Submitted', 'selected':false },
      { 'id': 3, 'name': 'Analysis Completed', 'selected':false },
    ];

    searchDataFilesString:string;

    ngOnDestroy(){
        this.sub.unsubscribe();
    }

    ngOnInit() {
      console.log( " on init ");
      this.message = "";
      this.sub = Observable.interval(3000)
        .subscribe((val) => {
          this.listDatafilesService.getDatafiles().then(datafiles => {
              this.datafiles = datafiles;
              console.log(" 1 = " + this.datafiles);
              this.allDatafiles = datafiles;
              this.filterDataFiles();
              console.log(" 2 = " + this.datafiles);
          });

        });
    }

    deleteDatafile(event:any){

      if (confirm("Are you sure you want to delete this file?")){
        var target = event.target || event.srcElement || event.currentTarget;
        var idAttr = target.attributes.id;
        var value = idAttr.nodeValue;
        var datafileId = value.split("_")[2]
        this.listDatafilesService.deleteDatafile(datafileId).then((message) =>
        {
            this.message = message;
        }
        );
        this.listDatafilesService.getDatafiles().then(datafiles => {
            this.datafiles = datafiles;
            this.allDatafiles = datafiles;
        });
      }
    }

    filterDataFiles(){
      console.log(" in filter 1 " + this.datafiles);
      if (!this.filterFilesOption || this.filterFilesOption == "") {
        return;
      }
      this.datafiles = this.allDatafiles.filter(s => {
        if (this.filterFilesOption != ""){
          return s.status == this.filterFilesOption;
      } else {
        return true;
      }
      });
      console.log(" in filter 2 " + this.datafiles);
    }

    constructor( private listDatafilesService: ListDatafilesService,
               ) {
    };
}
