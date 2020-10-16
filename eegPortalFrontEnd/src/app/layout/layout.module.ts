import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

import { ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from './components/components.module';

// import { BrowserModule } from '@angular/platform-browser';

@NgModule({
    imports: [
        CommonModule,
        LayoutRoutingModule,
        ReactiveFormsModule,
        ComponentsModule,
        TranslateModule,
        NgbDropdownModule,
        // ReactiveFormsModule,
    ],
    // declarations: [LayoutComponent, SidebarComponent, HeaderComponent, FooterComponent]
    // declarations: [LayoutComponent, HeaderComponent, SidebarComponent, FooterComponent]
    declarations: [LayoutComponent, HeaderComponent]

})
export class LayoutModule {}
