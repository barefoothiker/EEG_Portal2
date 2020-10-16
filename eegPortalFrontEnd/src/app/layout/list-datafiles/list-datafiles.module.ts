import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListDatafilesRoutingModule } from './list-datafiles-routing.module';
import { ListDatafilesComponent } from './list-datafiles.component';
import { FormsModule } from '@angular/forms';
import { ListFilesFilterPipe} from '../../pipes/list-files-filter.pipe';

import { ReactiveFormsModule } from '@angular/forms';
// import { BrowserModule } from '@angular/platform-browser';


@NgModule({
    imports: [CommonModule,
              ListDatafilesRoutingModule,
              FormsModule,
              ReactiveFormsModule,
              // BrowserModule,
              // ReactiveFormsModule
            ],

    declarations: [ListDatafilesComponent, ListFilesFilterPipe]
})
export class ListDatafilesModule {}
