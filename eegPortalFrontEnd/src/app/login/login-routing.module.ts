import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login.component';
// import { AdminLayoutComponent } from '../layouts/admin-layout/admin-layout.component';
import { AuthGuard } from '../shared';

const routes: Routes = [
//                           {
//                               children: [
//                                 { path: '', component: LoginComponent },
//                                 { path: 'dashboard', redirectTo: 'dashboard' , pathMatch: 'full'},
// //                                { path: 'quick-search', component: QuickSearchComponent },
// //                                { path: '', redirectTo: '/guided-search', pathMatch: 'full' }
//                               ],
//                               path: '', component: LoginComponent,
//
//                             } ,
//                             {
//                               path: '',
//                               component: AdminLayoutComponent,
//                               children: [{
//                                 path: '',
//                                 loadChildren: '../layouts/admin-layout/admin-layout.module#AdminLayoutModule'
//                               }],
//                               canActivate: [AuthGuard]
//                             },

                            {
                                children: [
                                  { path: '', component: LoginComponent },
                                  { path: 'dashboard', redirectTo: 'dashboard' , pathMatch: 'full'},
  //                                { path: 'quick-search', component: QuickSearchComponent },
  //                                { path: '', redirectTo: '/guided-search', pathMatch: 'full' }
                                ],
                                path: '', component: LoginComponent
                              }
];



@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LoginRoutingModule {}
