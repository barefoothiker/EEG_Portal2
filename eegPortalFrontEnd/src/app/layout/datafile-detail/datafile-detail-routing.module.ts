import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DatafileDetailComponent } from './datafile-detail.component';

const routes: Routes = [
    {
        path: '',
        component: DatafileDetailComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DatafileDetailRoutingModule {}
