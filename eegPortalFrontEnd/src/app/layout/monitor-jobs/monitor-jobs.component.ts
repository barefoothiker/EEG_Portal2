import { Component, OnInit, OnDestroy, Input, ElementRef} from '@angular/core';
import { MonitorJobsService } from './monitor-jobs-service';
import { Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Datafile, UploadFolder, UploadFolderSubmitObj } from '../../models/datafile';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'monitor-jobs',
    providers: [MonitorJobsService],
    templateUrl: './monitor-jobs.component.html',
    styleUrls: ['./monitor-jobs.component.scss']
})

export class MonitorJobsComponent implements OnInit, OnDestroy{

    @Input()
    datafiles : UploadFolder[];
    allDatafiles : UploadFolder[];
    filterFilesOption:string;
    resultsAvailable:boolean;
    sub:Subscription;
    message:string;
    username:string;
    searchDataFilesString:string;
    runningJobs:UploadFolder[];

    filterOptions = [
      { 'id': 0, 'name': 'Uploaded', 'selected':false },
      { 'id': 1, 'name': 'Score Calculated', 'selected':false },
      { 'id': 2, 'name': 'Analysis Submitted', 'selected':false },
      { 'id': 3, 'name': 'Analysis Completed', 'selected':false },
    ];

    ngOnDestroy(){
        this.sub.unsubscribe();
    }

    ngOnInit() {
      this.sub = Observable.interval(1000)
        .subscribe((val) => {
        this.monitorJobsService.getRunningJobs(this.username).then(runningJobs => {
            this.runningJobs = runningJobs;
        });
      });
    }

    deleteDatafile(event:any){

      if (confirm("Are you sure you want to delete this file?")){
        var target = event.target || event.srcElement || event.currentTarget;
        var idAttr = target.attributes.id;
        var value = idAttr.nodeValue;
        var datafileId = value.split("_")[2]
        this.monitorJobsService.deleteDatafile(datafileId).then((message) =>
        {
            this.message = message;
        }
        );
        this.monitorJobsService.getRunningJobs(this.username).then(datafiles => {
            this.datafiles = datafiles;
            this.allDatafiles = datafiles;
        });
      }
    }

    terminateJob(event:any){

      if (confirm("Are you sure you want to terminate this process?")){
        var target = event.target || event.srcElement || event.currentTarget;
        var idAttr = target.attributes.id;
        var value = idAttr.nodeValue;
        var datafileId = value.split("_")[2]
        this.monitorJobsService.terminateJob(datafileId).then((message) =>
        {
            this.message = message;
        }
        );
        this.monitorJobsService.getRunningJobs(this.username).then(datafiles => {
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

    constructor( private monitorJobsService: MonitorJobsService,
                 private route: ActivatedRoute,
               ) {
    };
}
