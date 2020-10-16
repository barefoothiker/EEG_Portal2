import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';

import { AppComponent } from './app.component';
import { AuthGuard , AuthService} from './shared';

import { DashboardComponent } from './dashboard/dashboard.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { TableListComponent } from './table-list/table-list.component';
import { TypographyComponent } from './typography/typography.component';
import { IconsComponent } from './icons/icons.component';
// import { MapsComponent } from './maps/maps.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { UpgradeComponent } from './upgrade/upgrade.component';

import { ProjectService } from './services/project-service';
import { LoginService } from './services/login-service';
import { LogoutService } from './services/logout-service';

import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { NgPipesModule} from 'ngx-pipes';
import { SigninEmitterService} from './services/signin-emitter.service';
import { SignoutEmitterService} from './services/signout-emitter.service';
import { DatafileDetailService} from './layout/datafile-detail/datafile-detail-service';
import { SignupService } from './services/signup-service';
import { ResetPasswordService } from './services/reset-password-service';
import { TokenInterceptor } from './shared/interceptor/token.interceptor';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartsModule } from 'ng2-charts';
import { FullScreenService } from './services/full-screen.service';
import { ParamsModalService } from './services/params-modal.service';
import { FullScreenComponent } from './full-screen/full-screen.component';
import { HelpModalService } from './services/help-modal.service';
import { HelpModalComponent } from './help-modal/help-modal.component';

import { WorkerService } from './services/worker.service';

import { CommentModalComponent } from './comment-modal/comment-modal.component';
// import { CommentsListComponent } from './comments-list/comments-list.component';
import { ParamsModalComponent } from './params-modal/params-modal.component';
import { CommentModalSubmitService } from './services/comment-modal-submit.service';
import { NgxSortableModule } from 'ngx-sortable';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ColorPickerModule } from 'ngx-color-picker';
import { LogoutComponent } from './logout/logout.component';
import { LoginComponent } from './login/login.component';

import { LoginModule } from './login/login.module';

import {
  AgmCoreModule
} from '@agm/core';
// import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

export function createTranslateLoader(http: HttpClient) {
    // for development

    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [

    CommonModule,
    BrowserModule,
    HttpClientModule,
    ChartsModule,
    NgxSortableModule,
    ColorPickerModule,
    NgbModule,
    // NgbModule.forRoot(),
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient]
        }
    }),
    NgMultiSelectDropDownModule.forRoot(),

    FormsModule,
    NgPipesModule,

    BrowserAnimationsModule,
    ReactiveFormsModule,
    // HttpModule,
    ComponentsModule,
    RouterModule,
    AppRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: 'YOUR_GOOGLE_MAPS_API_KEY'
    })
  ],
  entryComponents: [
       FullScreenComponent,
       HelpModalComponent,
       CommentModalComponent,
       // CommentsListComponent,
       ParamsModalComponent,
   ],
  // declarations: [
  //   AppComponent,
  //   AdminLayoutComponent,
  //
  // ],

  // declarations: [AppComponent, AdminLayoutComponent, HelpModalComponent, CommentModalComponent, FullScreenComponent, ParamsModalComponent, LoginComponent],
  declarations: [AppComponent, HelpModalComponent, CommentModalComponent, FullScreenComponent, ParamsModalComponent],

  providers: [AuthGuard, ProjectService, LoginService, SignupService, ResetPasswordService, LogoutService, AuthService, LogoutComponent,
              SigninEmitterService, SignoutEmitterService, HelpModalService, FullScreenService, CommentModalSubmitService, WorkerService, ParamsModalService, DatafileDetailService, {

    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]

  // providers: [],
  // bootstrap: [AppComponent]
})
export class AppModule { }
