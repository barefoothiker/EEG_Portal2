import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomePageRoutingModule } from './home-page-routing.module';
import { HomePageComponent } from './home-page.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StatModule } from '../../shared';

@NgModule({
    imports: [CommonModule, HomePageRoutingModule, StatModule],
    declarations: [HomePageComponent]
})

export class HomePageModule {}
