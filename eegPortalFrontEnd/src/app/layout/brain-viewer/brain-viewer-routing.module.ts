import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrainViewerComponent } from './brain-viewer.component';

const routes: Routes = [
    {
        path: '',
        component: BrainViewerComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BrainViewerRoutingModule {}
