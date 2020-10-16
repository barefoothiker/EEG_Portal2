import { Component } from '@angular/core';
// import { ListFilesService } from '../../services/project-service';
// import { UploadFolder } from '../../models/datafile';

@Component({
    selector: 'app-listfiles',
    // providers: [ListFilesService],
    templateUrl: './listfiles.html',
    styleUrls: ['./listfiles.css']
    // animations: [routerTransition()]
})
export class ListFilesComponent {



    // constructor(private listFilesService: ListFilesService) {}

    // ngOnInit() {
    //     this.listFilesService.listUploadFolders().then((uploadFoldersList) =>
    //     {
    //         this.uploadFoldersList = uploadFoldersList;
    //     }
    //     );
    // }
    // searchUploadFolders(event:any){
    //   this.listFilesService.searchUploadFolders(this.searchString).then((l_oMRNPatientQuery) =>
    //   {
    //       this.m_oMRNPatientQuery = l_oMRNPatientQuery;
    //   }
    //   );
    // }

    // reloadItems() {
    //     // this.listFilesService.query().then(result => {
    //     //     this.items = result.items;
    //     //     this.itemCount = result.count;
    //     // });
    // }
    //
    // rowClick(rowEvent) {
    //     console.log('Clicked: ' + rowEvent.row.item.name);
    // }
    //
    // rowDoubleClick(rowEvent) {
    //     alert('Double clicked: ' + rowEvent.row.item.name);
    // }
    //
    // rowTooltip(item) { return item.name; }
}
