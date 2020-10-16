import { Component } from '@angular/core';

// let doc = require('html-loader!markdown-loader!./doc.md');

let tabDesc:Array<any> = [
  {
    heading: 'Simple',
    // ts: require('!!raw-loader?lang=typescript!./simple-demo.ts'),
    // html: require('!!raw-loader?lang=markup!./simple-demo.html'),
    // js: require('!!raw-loader?lang=javascript!./file-catcher.js')
  }
];

@Component({
  selector: 'file-upload-section',
  templateUrl: './file-upload-section.html'
})
export class FileUploadSectionComponent {
  public name:string = 'File Upload';
  public currentHeading:string = 'Upload';
  // public doc:string = doc;
  public tabs:any = tabDesc;

  public select(e:any):void {
    if (e.heading) {
      this.currentHeading = e.heading;
    }
  }
}
