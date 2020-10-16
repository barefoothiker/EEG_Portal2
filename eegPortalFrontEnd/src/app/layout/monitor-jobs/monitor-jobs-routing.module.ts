import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MonitorJobsComponent } from './monitor-jobs.component';

const routes: Routes = [
    {
        path: '',
        component: MonitorJobsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MonitorJobsRoutingModule {}
