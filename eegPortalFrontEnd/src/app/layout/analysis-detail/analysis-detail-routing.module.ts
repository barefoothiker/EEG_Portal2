import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AnalysisDetailComponent } from './analysis-detail.component';

const routes: Routes = [
    {
        path: '',
        component: AnalysisDetailComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AnalysisDetailRoutingModule {}
