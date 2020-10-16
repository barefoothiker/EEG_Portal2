import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'listFilesFilter'
})
export class ListFilesFilterPipe implements PipeTransform {
  transform(items: any[], searchDataFilesString: string): any[] {
    console.log( " in filter ");
    if(!searchDataFilesString || searchDataFilesString == '') return items;
    console.log( " in pipe ");
    if(!items) return [];
    searchDataFilesString = searchDataFilesString.toLowerCase();
    return items.filter( it => {
      return ( it.name.toLowerCase().includes(searchDataFilesString) || it.chksum.toLowerCase().includes(searchDataFilesString) );
    });
   }
}
