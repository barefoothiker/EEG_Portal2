import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FullScreenComponent } from './full-screen.component';

const routes: Routes = [
    {
        path: '', component: FullScreenComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FullScreenRoutingModule {
}
