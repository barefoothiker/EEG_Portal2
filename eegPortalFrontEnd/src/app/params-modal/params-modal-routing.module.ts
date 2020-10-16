import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ParamsModalComponent } from './params-modal.component';

const routes: Routes = [
    {
        path: '', component: ParamsModalComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ParamsModalRoutingModule {
}
