import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LogoutComponent } from './logout.component';

const routes: Routes = [
                          {
                              children: [
                                { path: '', component: LogoutComponent },
                                { path: 'dashboard', redirectTo: 'dashboard' , pathMatch: 'full'},
//                                { path: 'quick-search', component: QuickSearchComponent },
//                                { path: '', redirectTo: '/guided-search', pathMatch: 'full' }
                              ],
                              path: '', component: LogoutComponent
                            }
];



@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LogoutRoutingModule {}
